import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';

export default function StudentRegistration() {
  const { db, refresh, refreshKey, addToast } = useApp();
  const events = db.getEvents();
  const allRegistrations = db.getRegistrations();
  const participants = db.getParticipants();

  const [form, setForm] = useState({ name: '', email: '', roll_number: '', event_id: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Check if participant exists by roll_number, if not create
      let participant = db.findParticipantByRoll(form.roll_number);
      if (!participant) {
        participant = await db.addParticipant({
          name: form.name,
          email: form.email,
          roll_number: form.roll_number,
        });
      }

      // Step 2: Register for the event (composite PK check happens here)
      const eventId = parseInt(form.event_id);
      await db.registerParticipant(eventId, participant.id);

      const eventName = events.find(ev => ev.id === eventId)?.name || 'Event';
      addToast(`Registration Successful! ${form.name} registered for "${eventName}".`);
      setForm({ name: '', email: '', roll_number: '', event_id: '' });
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Build registration table data with JOINs
  const regData = allRegistrations.map(r => {
    const p = participants.find(pp => pp.id === r.participant_id);
    const ev = events.find(ee => ee.id === r.event_id);
    return {
      id: `${r.event_id}-${r.participant_id}`,
      event_name: ev ? ev.name : 'Deleted Event',
      participant_name: p ? p.name : 'Unknown',
      roll_number: p ? p.roll_number : '',
      email: p ? p.email : '',
      registration_date: r.registration_date,
    };
  });

  const columns = [
    { key: 'event_name', label: 'Event' },
    { key: 'participant_name', label: 'Student Name' },
    { key: 'roll_number', label: 'Roll no' },
    { key: 'registration_date', label: 'Registration date', render: (row) => row.registration_date },
    { key: 'email', label: 'Email' },
  ];

  return (
    <div className="page-registration">
      <div className="page-header">
        <div>
          <h2>Student Registration</h2>
          <p className="page-subtitle">Register students for events — Composite PK (event_id, participant_id) enforces no duplicates</p>
        </div>
      </div>

      <div className="card form-card">
        <div className="card-header">
          <h3>Register for an Event</h3>
          <span className="badge badge-emerald">PUBLIC FORM</span>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Aarav Mehta" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="e.g., aarav.m@student.edu" />
          </div>
          <div className="form-group">
            <label>Roll Number (UNIQUE Constraint)</label>
            <input type="text" required value={form.roll_number} onChange={e => setForm({ ...form, roll_number: e.target.value })} placeholder="e.g., CS2024001" />
          </div>
          <div className="form-group">
            <label>Select Event (FK → Events)</label>
            <select required value={form.event_id} onChange={e => setForm({ ...form, event_id: e.target.value })}>
              <option value="">Choose an event…</option>
              {events.map(ev => {
                const regs = allRegistrations.filter(r => r.event_id === ev.id).length;
                return (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} — {new Date(ev.date).toLocaleDateString('en-IN')} ({regs} registered)
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Register Student</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Registrations</h3>
          <span className="badge badge-blue">{regData.length} total</span>
        </div>
        <DataTable columns={columns} data={regData} emptyMessage="No registrations yet." />
      </div>

      <div className="card schema-card">
        <div className="card-header">
          <h3>📐 Schema: Registrations Table</h3>
        </div>
        <pre className="sql-block">{`CREATE TABLE Registrations (
    event_id        INT NOT NULL,
    participant_id  INT NOT NULL,
    registration_date DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (event_id, participant_id),  -- Composite PK
    FOREIGN KEY (event_id) REFERENCES Events(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES Participants(id)
);

-- This composite primary key ensures a participant
-- cannot register for the same event twice.`}</pre>
      </div>
    </div>
  );
}
