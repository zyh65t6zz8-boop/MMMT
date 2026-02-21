import { useEffect, useState } from 'react';
import EventModal from './EventModal.jsx';
import './CalendarView.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const TYPE_LABELS = {
  team: 'Team Event',
  bbmx: 'BBMX',
  mrann: 'MRANN',
  rep: 'REP Racing',
};

const TYPE_COLORS = {
  team: '#ff6b00',
  bbmx: '#3b82f6',
  mrann: '#22c55e',
  rep: '#ef4444',
};

function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildCalendarGrid(year, month) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false, dateStr: null });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ day: d, current: true, dateStr: toLocalDateStr(date) });
  }
  // Next month padding
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false, dateStr: null });
  }
  return cells;
}

export default function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  function fetchEvents() {
    fetch('/api/events')
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {});
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  const cells = buildCalendarGrid(year, month);
  const todayStr = toLocalDateStr(today);

  function eventsForDate(dateStr) {
    return events.filter(
      (e) => e.date === dateStr && (filter === 'all' || e.type === filter)
    );
  }

  function upcomingEvents() {
    const now = todayStr;
    return events
      .filter((e) => e.date >= now && (filter === 'all' || e.type === filter))
      .slice(0, 8);
  }

  function selectedEvents() {
    if (!selectedDate) return [];
    return events.filter((e) => e.date === selectedDate);
  }

  async function handleSaveEvent(eventData) {
    if (editingEvent) {
      await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
    } else {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
    }
    fetchEvents();
    setShowModal(false);
    setEditingEvent(null);
  }

  async function handleDeleteEvent(id) {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    fetchEvents();
    setSelectedDate(null);
  }

  function openAddEvent(dateStr) {
    setEditingEvent(null);
    setSelectedDate(dateStr || selectedDate);
    setShowModal(true);
  }

  function openEditEvent(ev) {
    setEditingEvent(ev);
    setShowModal(true);
  }

  const upcoming = upcomingEvents();

  return (
    <div className="cal-layout">
      {/* Left: Calendar */}
      <div className="cal-main">
        {/* Toolbar */}
        <div className="cal-toolbar">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={prevMonth}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h2 className="cal-month-title">
              {MONTHS[month]} <span>{year}</span>
            </h2>
            <button className="cal-nav-btn" onClick={nextMonth}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="cal-toolbar-right">
            <div className="cal-filters">
              {['all', 'team', 'bbmx', 'mrann', 'rep'].map((t) => (
                <button
                  key={t}
                  className={`filter-btn ${filter === t ? 'active' : ''}`}
                  style={filter === t && t !== 'all' ? { borderColor: TYPE_COLORS[t], color: TYPE_COLORS[t] } : {}}
                  onClick={() => setFilter(t)}
                >
                  {t === 'all' ? 'All' : TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <button className="today-btn" onClick={goToday}>Today</button>
            <button className="add-event-btn" onClick={() => openAddEvent(todayStr)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Event
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="cal-day-headers">
          {DAYS.map((d) => <div key={d} className="cal-day-header">{d}</div>)}
        </div>

        {/* Grid */}
        <div className="cal-grid">
          {cells.map((cell, idx) => {
            const cellEvents = cell.dateStr ? eventsForDate(cell.dateStr) : [];
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDate;

            return (
              <div
                key={idx}
                className={[
                  'cal-cell',
                  !cell.current ? 'other-month' : '',
                  isToday ? 'today' : '',
                  isSelected ? 'selected' : '',
                ].join(' ')}
                onClick={() => cell.dateStr && setSelectedDate(cell.dateStr)}
              >
                <div className="cell-day-num">{cell.day}</div>
                <div className="cell-events">
                  {cellEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="cell-event-chip"
                      style={{ background: ev.color + '22', borderLeft: `3px solid ${ev.color}`, color: ev.color }}
                      onClick={(e) => { e.stopPropagation(); setSelectedDate(cell.dateStr); }}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {cellEvents.length > 3 && (
                    <div className="cell-more">+{cellEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Sidebar */}
      <aside className="cal-sidebar">
        {selectedDate ? (
          <div className="day-detail">
            <div className="day-detail-header">
              <div>
                <p className="day-detail-label">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString([], {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="day-detail-count">
                  {selectedEvents().length} event{selectedEvents().length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="day-detail-actions">
                <button className="icon-btn" onClick={() => openAddEvent(selectedDate)} title="Add event">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <button className="icon-btn close-btn" onClick={() => setSelectedDate(null)} title="Close">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {selectedEvents().length === 0 ? (
              <div className="no-events">
                <p>No events scheduled.</p>
                <button className="link-btn" onClick={() => openAddEvent(selectedDate)}>
                  + Add an event
                </button>
              </div>
            ) : (
              <div className="event-list">
                {selectedEvents().map((ev) => (
                  <div key={ev.id} className="event-card" style={{ borderLeft: `4px solid ${ev.color}` }}>
                    <div className="event-card-top">
                      <span
                        className="event-type-badge"
                        style={{ background: ev.color + '22', color: ev.color }}
                      >
                        {TYPE_LABELS[ev.type] || ev.type}
                      </span>
                      <div className="event-card-actions">
                        <button className="icon-btn-sm" onClick={() => openEditEvent(ev)} title="Edit">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="icon-btn-sm delete-btn"
                          onClick={() => handleDeleteEvent(ev.id)}
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <h3 className="event-card-title">{ev.title}</h3>
                    {ev.location && (
                      <p className="event-card-meta">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="meta-icon">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {ev.location}
                      </p>
                    )}
                    {ev.description && <p className="event-card-desc">{ev.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="upcoming-panel">
            <h3 className="upcoming-title">Upcoming Events</h3>
            {upcoming.length === 0 ? (
              <p className="no-upcoming">No upcoming events.</p>
            ) : (
              <div className="upcoming-list">
                {upcoming.map((ev) => {
                  const d = new Date(ev.date + 'T12:00:00');
                  return (
                    <div
                      key={ev.id}
                      className="upcoming-item"
                      onClick={() => setSelectedDate(ev.date)}
                      style={{ borderLeft: `3px solid ${ev.color}` }}
                    >
                      <div className="upcoming-date">
                        <span className="upcoming-month">
                          {d.toLocaleDateString([], { month: 'short' })}
                        </span>
                        <span className="upcoming-day">{d.getDate()}</span>
                      </div>
                      <div className="upcoming-info">
                        <p className="upcoming-event-title">{ev.title}</p>
                        <p className="upcoming-type" style={{ color: ev.color }}>
                          {TYPE_LABELS[ev.type] || ev.type}
                        </p>
                        {ev.location && <p className="upcoming-location">{ev.location}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </aside>

      {showModal && (
        <EventModal
          defaultDate={selectedDate || todayStr}
          event={editingEvent}
          onSave={handleSaveEvent}
          onClose={() => { setShowModal(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
}
