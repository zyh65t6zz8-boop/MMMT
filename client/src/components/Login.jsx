import { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to continue.');
      return;
    }
    if (trimmed.length > 20) {
      setError('Name must be 20 characters or less.');
      return;
    }
    onLogin(trimmed);
  }

  return (
    <div className="login-page">
      <div className="login-bg-pattern" aria-hidden="true" />

      <div className="login-card">
        <div className="login-header">
          <div className="login-badge">NORTHERN NEVADA</div>
          <h1 className="login-title">
            <span className="login-title-orange">MOTO MOUTH</span>
            <span className="login-title-white">MINI TEAM</span>
          </h1>
          <p className="login-subtitle">Team Chat &amp; Race Calendar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="username">
            Enter Your Name
          </label>
          <input
            id="username"
            className="login-input"
            type="text"
            placeholder="e.g. Rider Rick"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            autoFocus
            maxLength={20}
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn">
            Join the Team
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>

        <div className="login-series">
          <span>BBMX</span>
          <span className="dot">•</span>
          <span>MRANN</span>
          <span className="dot">•</span>
          <span>REP RACING</span>
        </div>
      </div>
    </div>
  );
}
