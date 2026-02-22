const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();

const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

let server;
if (isProduction) {
  const certDir = process.env.CERT_DIR || '/etc/ssl/motomouthminiteam';
  const sslOptions = {
    key: fs.readFileSync(path.join(certDir, 'privkey.pem')),
    cert: fs.readFileSync(path.join(certDir, 'fullchain.pem')),
  };
  server = https.createServer(sslOptions, app);

  // HTTP → HTTPS redirect
  const httpApp = express();
  httpApp.use((req, res) => {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  });
  http.createServer(httpApp).listen(80, () => {
    console.log('HTTP → HTTPS redirect listening on port 80');
  });
} else {
  server = http.createServer(app);
}

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : true,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
}));
app.use(express.json());

// Serve built client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
}

// ── Auth ─────────────────────────────────────────────────────────
app.post('/api/auth', (req, res) => {
  const { passcode } = req.body;
  const expected = process.env.TEAM_PASSCODE || 'mmmt2026';
  if (passcode === expected) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: 'Incorrect team passcode.' });
  }
});

// ── Message routes ──────────────────────────────────────────────
app.get('/api/messages', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const rows = db
    .prepare('SELECT * FROM messages ORDER BY id DESC LIMIT ?')
    .all(limit)
    .reverse();
  res.json(rows);
});

// ── Event routes ─────────────────────────────────────────────────
app.get('/api/events', (req, res) => {
  const rows = db.prepare('SELECT * FROM events ORDER BY date ASC').all();
  res.json(rows);
});

app.post('/api/events', (req, res) => {
  const { title, date, type, description, location } = req.body;
  if (!title || !date) return res.status(400).json({ error: 'title and date required' });

  const colorMap = {
    team: '#ff6b00',
    bbmx: '#3b82f6',
    mrann: '#22c55e',
    rep: '#ef4444',
  };
  const color = colorMap[type] || '#ff6b00';

  const stmt = db.prepare(
    'INSERT INTO events (title, date, type, description, location, color) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(title, date, type || 'team', description || '', location || '', color);
  const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { title, date, type, description, location } = req.body;
  const colorMap = {
    team: '#ff6b00',
    bbmx: '#3b82f6',
    mrann: '#22c55e',
    rep: '#ef4444',
  };
  const color = colorMap[type] || '#ff6b00';
  db.prepare(
    'UPDATE events SET title=?, date=?, type=?, description=?, location=?, color=? WHERE id=?'
  ).run(title, date, type || 'team', description || '', location || '', color, id);
  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  res.json(updated);
});

app.delete('/api/events/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Catch-all for React in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

// ── Socket.io ─────────────────────────────────────────────────────
const onlineUsers = new Map(); // socket.id → username

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('user_join', (username) => {
    onlineUsers.set(socket.id, username);
    io.emit('online_users', Array.from(onlineUsers.values()));
    socket.broadcast.emit('system_message', { text: `${username} joined the chat`, timestamp: new Date().toISOString() });
  });

  socket.on('send_message', ({ username, text, avatarColor }) => {
    const timestamp = new Date().toISOString();
    const stmt = db.prepare(
      'INSERT INTO messages (username, text, timestamp, avatar_color) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(username, text, timestamp, avatarColor || '#ff6b00');
    const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
    io.emit('receive_message', msg);
  });

  socket.on('disconnect', () => {
    const username = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    if (username) {
      io.emit('online_users', Array.from(onlineUsers.values()));
      io.emit('system_message', { text: `${username} left the chat`, timestamp: new Date().toISOString() });
    }
    console.log('Client disconnected:', socket.id);
  });
});

const listenPort = isProduction ? 443 : PORT;
server.listen(listenPort, () => {
  const scheme = isProduction ? 'https' : 'http';
  console.log(`MMMT server running on ${scheme}://localhost:${listenPort}`);
});
