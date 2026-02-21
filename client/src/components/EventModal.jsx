import { useEffect, useState } from 'react';
import './EventModal.css';

export default function EventModal({ defaultDate, event, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || '');
  const [type, setType] = useState('team');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(event.date);
      setType(event.type);
      setLocation(event.location || '');
      setDescription(event.description || '');
    } else {
      setTitle('');
      setDate(defaultDate || '');
      setType('team');
      setLocation('');
      setDescription('');
    }
  }, [event, defaultDate]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError('Event title is required.'); return; }
    if (!date) { setError('Date is required.'); return; }
    onSave({ title: title.trim(), date, type, location: location.trim(), description: description.trim() });
  }

  const TYPE_OPTIONS = [
    { value: 'team', label: 'Team Event', color: '#ff6b00' },
    { value: 'bbmx', label: 'BBMX Race', color: '#3b82f6' },
    { value: 'mrann', label: 'MRANN Race', color: '#22c55e' },
    { value: 'rep', label: 'REP Racing', color: '#ef4444' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Add Event'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Type selector */}
          <div className="form-group">
            <label className="form-label">Event Type</label>
            <div className="type-grid">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`type-option ${type === opt.value ? 'active' : ''}`}
                  style={type === opt.value ? {
                    borderColor: opt.color,
                    background: opt.color + '18',
                    color: opt.color,
                  } : {}}
                  onClick={() => setType(opt.value)}
                >
                  <span className="type-dot" style={{ background: opt.color }} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="evt-title">Title *</label>
              <input
                id="evt-title"
                className="form-input"
                type="text"
                placeholder="Event name"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(''); }}
                maxLength={60}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="evt-date">Date *</label>
              <input
                id="evt-date"
                className="form-input"
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setError(''); }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="evt-location">Location</label>
            <input
              id="evt-location"
              className="form-input"
              type="text"
              placeholder="e.g. Fernley, NV"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="evt-desc">Notes</label>
            <textarea
              id="evt-desc"
              className="form-input form-textarea"
              placeholder="Additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={300}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {event ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
