import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';

export default function AttendanceTracker() {
  const { db, refresh, refreshKey, addToast } = useApp();
  const events = db.getEvents();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const eventId = parseInt(selectedEvent);
  const registeredParticipants = selectedEvent ? db.getRegisteredParticipantsForEvent(eventId) : [];
  const totalCheckedIn = registeredParticipants.filter(p => p.checked_in).length;

  const tableData = registeredParticipants.map((p, idx) => ({
    id: `${eventId}-${p.participant_id}`,
    sl: idx + 1,
    student_name: p.participant_name,
    roll_no: p.roll_number,
    registration_date: p.registration_date,
    checked_in: p.checked_in,
    check_in_time: p.check_in_time,
    participant_id: p.participant_id,
  }));

  const tableColumns = [
    { key: 'sl', label: 'SL' },
    { key: 'student_name', label: 'Student Name' },
    { key: 'roll_no', label: 'Roll no' },
    { key: 'registration_date', label: 'Registration date' },
    {
      key: 'checked_in',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.checked_in ? 'badge-emerald' : 'badge-ghost'}`}>
          {row.checked_in ? '✓ Present' : 'Absent'}
        </span>
      ),
    },
    {
      key: 'check_in_time',
      label: 'Check-in Time',
      render: (row) => row.checked_in && row.check_in_time ? row.check_in_time : '—',
    },
    {
      key: 'actions',
      label: 'Action',
      noSort: true,
      render: (row) => (
        <button
          className={`btn btn-sm ${row.checked_in ? 'btn-danger' : 'btn-success'}`}
          onClick={() => row.checked_in ? handleRemoveCheckIn(row.participant_id) : handleCheckIn(row.participant_id)}
        >
          {row.checked_in ? 'Undo Check-In' : 'Check In'}
        </button>
      ),
    },
  ];

  const handleCheckIn = async (participantId) => {
    try {
      await db.checkIn(eventId, participantId);
      addToast('Check-in recorded successfully.');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRemoveCheckIn = async (participantId) => {
    try {
      await db.removeCheckIn(eventId, participantId);
      addToast('Check-in removed.');
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="page-attendance">
      <div className="page-header">
        <div>
          <h2>Attendance Tracker</h2>
          <p className="page-subtitle">Record and manage event attendance for registered participants</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Select Event</h3>
        </div>
        <div className="card-body">
          <div className="form-group" style={{ maxWidth: '400px' }}>
            <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
              <option value="">Choose an event…</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name} — {ev.date}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <>
          <div className="attendance-stats">
            <div className="att-stat">
              <span className="att-stat-value">{registeredParticipants.length}</span>
              <span className="att-stat-label">Registered</span>
            </div>
            <div className="att-stat checked">
              <span className="att-stat-value">{totalCheckedIn}</span>
              <span className="att-stat-label">Checked In</span>
            </div>
            <div className="att-stat pending">
              <span className="att-stat-value">{registeredParticipants.length - totalCheckedIn}</span>
              <span className="att-stat-label">Pending</span>
            </div>
            <div className="att-stat pct">
              <span className="att-stat-value">
                {registeredParticipants.length > 0
                  ? Math.round((totalCheckedIn / registeredParticipants.length) * 100)
                  : 0}%
              </span>
              <span className="att-stat-label">Attendance Rate</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ margin: 0 }}>Registered Participants</h3>
                <span className="badge badge-blue">{registeredParticipants.length} students</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setViewMode('table')}
                >
                  📊 Table View
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setViewMode('cards')}
                >
                  📇 Card View
                </button>
              </div>
            </div>

            {viewMode === 'table' ? (
              <div style={{ padding: '1rem' }}>
                <DataTable
                  columns={tableColumns}
                  data={tableData}
                  emptyMessage="No participants registered for this event yet."
                />
              </div>
            ) : (
              <div className="attendance-list">
                {registeredParticipants.length === 0 ? (
                  <p className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>No participants registered for this event yet.</p>
                ) : (
                  registeredParticipants.map((p, i) => (
                    <div className={`attendance-row ${p.checked_in ? 'checked-in' : ''}`} key={i}>
                      <div className="att-info">
                        <div className={`att-avatar ${p.checked_in ? 'present' : 'absent'}`}>
                          {p.participant_name.charAt(0)}
                        </div>
                        <div>
                          <span className="att-name">{p.participant_name}</span>
                          <span className="att-meta">{p.roll_number} • {p.participant_email}</span>
                        </div>
                      </div>
                      <div className="att-actions">
                        {p.checked_in && (
                          <span className="att-time">✓ {p.check_in_time}</span>
                        )}
                        <button
                          className={`btn btn-sm ${p.checked_in ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => p.checked_in ? handleRemoveCheckIn(p.participant_id) : handleCheckIn(p.participant_id)}
                        >
                          {p.checked_in ? 'Undo Check-In' : 'Check In'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}

      <div className="card schema-card">
        <div className="card-header">
          <h3>📐 Schema: Attendance Table</h3>
        </div>
        <pre className="sql-block">{`CREATE TABLE Attendance (
    event_id        INT NOT NULL,
    participant_id  INT NOT NULL,
    check_in_time   DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, participant_id),
    FOREIGN KEY (event_id) REFERENCES Events(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES Participants(id),
    -- Participant must be registered before checking in
    FOREIGN KEY (event_id, participant_id)
        REFERENCES Registrations(event_id, participant_id)
);`}</pre>
      </div>
    </div>
  );
}
