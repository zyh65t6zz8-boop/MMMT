const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'mmmt.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    avatar_color TEXT NOT NULL DEFAULT '#ff6b00'
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'team',
    description TEXT DEFAULT '',
    location TEXT DEFAULT '',
    color TEXT NOT NULL DEFAULT '#ff6b00'
  );
`);

// Seed race events if calendar is empty
const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get();
if (eventCount.count === 0) {
  const insertEvent = db.prepare(
    'INSERT INTO events (title, date, type, description, location, color) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const seedEvents = [
    // ── MRANN (Motorcycle Racing Association of Northern Nevada) ──
    // Spring series
    ['MRANN Round 1', '2026-03-08', 'mrann', 'Season opener - Spring Series Round 1', 'Fernley, NV', '#22c55e'],
    ['MRANN Round 2', '2026-03-29', 'mrann', 'Spring Series Round 2', 'Fernley, NV', '#22c55e'],
    ['MRANN Round 3', '2026-04-19', 'mrann', 'Spring Series Round 3', 'Fernley, NV', '#22c55e'],
    ['MRANN Round 4', '2026-05-10', 'mrann', 'Spring Series Round 4', 'Fernley, NV', '#22c55e'],
    ['MRANN Round 5', '2026-05-31', 'mrann', 'Spring Series Championship Round', 'Fernley, NV', '#22c55e'],
    // Summer series
    ['MRANN Round 6', '2026-06-21', 'mrann', 'Summer Series Round 1', 'Fallon, NV', '#22c55e'],
    ['MRANN Round 7', '2026-07-12', 'mrann', 'Summer Series Round 2', 'Fallon, NV', '#22c55e'],
    ['MRANN Round 8', '2026-08-02', 'mrann', 'Summer Series Round 3', 'Fallon, NV', '#22c55e'],
    ['MRANN Round 9', '2026-08-23', 'mrann', 'Summer Series Round 4', 'Fallon, NV', '#22c55e'],
    // Fall series
    ['MRANN Round 10', '2026-09-13', 'mrann', 'Fall Series Round 1', 'Fernley, NV', '#22c55e'],
    ['MRANN Round 11', '2026-10-04', 'mrann', 'Fall Series Round 2', 'Fernley, NV', '#22c55e'],
    ['MRANN Round 12', '2026-10-25', 'mrann', 'Fall Series Championship - Season Finale', 'Fernley, NV', '#22c55e'],

    // ── BBMX ──
    ['BBMX Race Day', '2026-03-15', 'bbmx', 'BBMX Spring Kickoff', 'Northern Nevada', '#3b82f6'],
    ['BBMX Race Day', '2026-04-05', 'bbmx', 'BBMX Round 2', 'Northern Nevada', '#3b82f6'],
    ['BBMX Race Day', '2026-04-26', 'bbmx', 'BBMX Round 3', 'Northern Nevada', '#3b82f6'],
    ['BBMX Race Day', '2026-05-17', 'bbmx', 'BBMX Round 4', 'Northern Nevada', '#3b82f6'],
    ['BBMX Race Day', '2026-06-07', 'bbmx', 'BBMX Round 5', 'Northern Nevada', '#3b82f6'],
    ['BBMX Race Day', '2026-06-28', 'bbmx', 'BBMX Round 6', 'Northern Nevada', '#3b82f6'],
    ['BBMX Race Day', '2026-07-19', 'bbmx', 'BBMX Summer Shootout', 'Northern Nevada', '#3b82f6'],
    ['BBMX Race Day', '2026-08-09', 'bbmx', 'BBMX Round 8', 'Northern Nevada', '#3b82f6'],
    ['BBMX Race Day', '2026-09-06', 'bbmx', 'BBMX Round 9', 'Northern Nevada', '#3b82f6'],
    ['BBMX Championship', '2026-09-27', 'bbmx', 'BBMX Season Championship', 'Northern Nevada', '#3b82f6'],

    // ── REP Racing ──
    ['REP Racing Round 1', '2026-03-22', 'rep', 'REP Racing Spring Series Opener', 'Reno, NV', '#ef4444'],
    ['REP Racing Round 2', '2026-04-12', 'rep', 'REP Racing Round 2', 'Reno, NV', '#ef4444'],
    ['REP Racing Round 3', '2026-05-03', 'rep', 'REP Racing Round 3', 'Reno, NV', '#ef4444'],
    ['REP Racing Round 4', '2026-05-24', 'rep', 'REP Racing Round 4', 'Reno, NV', '#ef4444'],
    ['REP Racing Round 5', '2026-06-14', 'rep', 'REP Racing Summer Series', 'Reno, NV', '#ef4444'],
    ['REP Racing Round 6', '2026-07-05', 'rep', 'REP Racing Round 6', 'Reno, NV', '#ef4444'],
    ['REP Racing Round 7', '2026-07-26', 'rep', 'REP Racing Round 7', 'Reno, NV', '#ef4444'],
    ['REP Racing Round 8', '2026-08-16', 'rep', 'REP Racing Round 8', 'Reno, NV', '#ef4444'],
    ['REP Racing Round 9', '2026-09-20', 'rep', 'REP Racing Fall Series', 'Reno, NV', '#ef4444'],
    ['REP Racing Championship', '2026-10-11', 'rep', 'REP Racing Season Championship', 'Reno, NV', '#ef4444'],

    // ── Team Events ──
    ['Team Practice', '2026-03-01', 'team', 'Season prep practice - all riders', 'Local Track', '#ff6b00'],
    ['Team Meeting', '2026-03-07', 'team', 'Pre-season team meeting - gear check', 'Team HQ', '#ff6b00'],
    ['Team Practice', '2026-04-18', 'team', 'Pre-race practice session', 'Local Track', '#ff6b00'],
    ['Gear Day', '2026-05-02', 'team', 'Bike maintenance & gear day', 'Team HQ', '#ff6b00'],
    ['Team Practice', '2026-06-06', 'team', 'Summer training session', 'Local Track', '#ff6b00'],
    ['Team BBQ', '2026-07-04', 'team', '4th of July team BBQ celebration!', 'Team HQ', '#ff6b00'],
    ['Team Practice', '2026-08-01', 'team', 'Late summer practice', 'Local Track', '#ff6b00'],
    ['End of Season Party', '2026-11-07', 'team', 'End of season celebration & awards', 'TBD', '#ff6b00'],
  ];

  const insertMany = db.transaction((events) => {
    for (const e of events) insertEvent.run(...e);
  });
  insertMany(seedEvents);
  console.log('Seeded', seedEvents.length, 'race and team events for 2026.');
}

module.exports = db;
