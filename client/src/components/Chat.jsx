import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket.js';
import './Chat.css';

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'long', day: 'numeric' });
}

function groupMessages(messages) {
  const groups = [];
  let lastDate = null;
  let lastUser = null;

  for (const msg of messages) {
    const date = new Date(msg.timestamp).toDateString();
    if (date !== lastDate) {
      groups.push({ type: 'date', label: formatDate(msg.timestamp) });
      lastDate = date;
      lastUser = null;
    }

    const showHeader = msg.username !== lastUser;
    groups.push({ type: 'message', msg, showHeader });
    lastUser = msg.username;
  }
  return groups;
}

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [systemMsgs, setSystemMsgs] = useState([]);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load history & connect socket
  useEffect(() => {
    fetch('/api/messages?limit=100')
      .then((r) => r.json())
      .then((data) => setMessages(data))
      .catch(() => {});

    socket.connect();
    socket.emit('user_join', user.username);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('online_users', (users) => setOnlineUsers(users));

    socket.on('system_message', (sm) => {
      const id = Date.now();
      setSystemMsgs((prev) => [...prev, { id, ...sm }]);
      setTimeout(() => setSystemMsgs((prev) => prev.filter((m) => m.id !== id)), 4000);
    });

    return () => {
      socket.off('receive_message');
      socket.off('online_users');
      socket.off('system_message');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [user.username]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !connected) return;
    socket.emit('send_message', { username: user.username, text, avatarColor: user.avatarColor });
    setInput('');
    inputRef.current?.focus();
  }

  const grouped = groupMessages(messages);

  return (
    <div className="chat-layout">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <span className="chat-hash">#</span>
          <span className="chat-channel-name">team-general</span>
          <span className={`chat-status ${connected ? 'online' : 'offline'}`}>
            {connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        <div className="chat-online-count" title={onlineUsers.join(', ')}>
          <span className="online-dot" />
          {onlineUsers.length} online
        </div>
      </div>

      {/* System message toasts */}
      <div className="system-toasts">
        {systemMsgs.map((sm) => (
          <div key={sm.id} className="system-toast">{sm.text}</div>
        ))}
      </div>

      {/* Messages */}
      <div className="messages-area">
        {messages.length === 0 && (
          <div className="empty-chat">
            <div className="empty-icon">💬</div>
            <p>No messages yet — say hi to the team!</p>
          </div>
        )}
        {grouped.map((item, idx) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${idx}`} className="date-divider">
                <span>{item.label}</span>
              </div>
            );
          }
          const { msg, showHeader } = item;
          return (
            <div key={msg.id} className={`message-row ${showHeader ? '' : 'compact'}`}>
              {showHeader ? (
                <div className="msg-avatar" style={{ background: msg.avatar_color }}>
                  {msg.username.slice(0, 2).toUpperCase()}
                </div>
              ) : (
                <div className="msg-avatar-spacer" />
              )}
              <div className="msg-body">
                {showHeader && (
                  <div className="msg-header">
                    <span className="msg-username" style={{ color: msg.avatar_color }}>
                      {msg.username}
                    </span>
                    <span className="msg-time">{formatTime(msg.timestamp)}</span>
                  </div>
                )}
                <p className="msg-text">{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Online users bar */}
      {onlineUsers.length > 0 && (
        <div className="online-bar">
          <span className="online-bar-label">Online now:</span>
          {onlineUsers.map((u) => (
            <span key={u} className="online-pill">{u}</span>
          ))}
        </div>
      )}

      {/* Input */}
      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          placeholder={connected ? 'Message #team-general...' : 'Connecting...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!connected}
          maxLength={500}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!input.trim() || !connected}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
