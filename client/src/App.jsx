import { useState } from 'react';
import Login from './components/Login.jsx';
import Chat from './components/Chat.jsx';
import CalendarView from './components/CalendarView.jsx';
import Sponsors from './components/Sponsors.jsx';
import './App.css';

const AVATAR_COLORS = [
  '#ff6b00', '#e91e63', '#9c27b0', '#3f51b5',
  '#2196f3', '#009688', '#4caf50', '#ff9800',
];

function pickColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('chat');

  function handleLogin(username) {
    setUser({ username, avatarColor: pickColor(username) });
  }

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/moto-logo.svg" alt="" className="logo-icon" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="logo-text">
            <span className="logo-team">MOTO MOUTH</span>
            <span className="logo-sub">MINI TEAM</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${tab === 'chat' ? 'active' : ''}`}
            onClick={() => setTab('chat')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Team Chat
          </button>
          <button
            className={`nav-btn ${tab === 'calendar' ? 'active' : ''}`}
            onClick={() => setTab('calendar')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Race Calendar
          </button>
          <button
            className={`nav-btn ${tab === 'sponsors' ? 'active' : ''}`}
            onClick={() => setTab('sponsors')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Sponsors
          </button>
        </nav>

        <div className="sidebar-legend">
          <p className="legend-title">RACE SERIES</p>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#ff6b00' }} />Team Events</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }} />BBMX</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }} />MRANN</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} />REP Racing</div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: user.avatarColor }}>
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <span className="user-status">● Online</span>
          </div>
          <button className="logout-btn" onClick={() => setUser(null)} title="Leave">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {tab === 'chat' && <Chat user={user} />}
        {tab === 'calendar' && <CalendarView />}
        {tab === 'sponsors' && <Sponsors />}
      </main>
    </div>
  );
}
