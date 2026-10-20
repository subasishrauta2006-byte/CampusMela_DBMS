import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';

export default function EventManagement() {
  const { db, refresh, refreshKey, addToast } = useApp();
  const venues = db.getVenues();
  const eventsWithVenue = db.getEventsWithVenue();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', date: '', venue_id: '', base_budget: '' });
  const [showDetail, setShowDetail] = useState(null);
  const [detailTab, setDetailTab] = useState('registrations');

  const resetForm = () => {
    setForm({ name: '', date: '', venue_id: '', base_budget: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        date: form.date,
        venue_id: parseInt(form.venue_id),
        base_budget: parseFloat(form.base_budget),
      };
      if (editId) {
        await db.updateEvent(editId, payload);
        addToast(`Event "${form.name}" updated successfully.`);
      } else {
        await db.addEvent(payload);
        addToast(`Event "${form.name}" created successfully.`);
      }
      resetForm();
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleEdit = (event) => {
    setForm({
      name: event.name,
      date: event.date,
      venue_id: String(event.venue_id),
      base_budget: String(event.base_budget),
    });
    setEditId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (event) => {
    if (window.confirm(`Delete event "${event.name}"? This will cascade-delete all registrations, attendance, sponsors, and expenses for this event in PostgreSQL.`)) {
      try {
        await db.deleteEvent(event.id);
        addToast(`Event "${event.name}" deleted from database.`, 'info');
        refresh();
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  const handleViewDetail = (event) => {
    setShowDetail(showDetail === event.id ? null : event.id);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Event Name' },
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { key: 'venue_name', label: 'Venue' },
    { key: 'base_budget', label: 'Base Budget', render: (row) => `₹${row.base_budget.toLocaleString('en-IN')}` },
    {
      key: 'actions', label: 'Actions', noSort: true,
      render: (row) => (
        <div className="action-btns">
          <button className="btn-icon btn-view" onClick={() => handleViewDetail(row)} title="View Details">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button className="btn-icon btn-edit" onClick={() => handleEdit(row)} title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button className="btn-icon btn-delete" onClick={() => handleDelete(row)} title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      ),
    },
  ];

  const detailEvent = showDetail ? eventsWithVenue.find(e => e.id === showDetail) : null;
  const detailRegs = showDetail ? db.getRegistrationsByEvent(showDetail) : [];
  const detailSponsors = showDetail ? db.getSponsorsByEvent(showDetail) : [];
  const detailExpenses = showDetail ? db.getExpensesByEvent(showDetail) : [];

  const detailRegsData = detailRegs.map((r, i) => {
    const p = db.getParticipants().find(pp => pp.id === r.participant_id);
    const att = db.getAttendance().find(a => a.event_id === showDetail && a.participant_id === r.participant_id);
    return {
      id: `${r.event_id}-${r.participant_id}`,
      sl: i + 1,
      student_name: p ? p.name : 'Unknown',
      roll_no: p ? p.roll_number : '—',
      registration_date: r.registration_date,
      attendance: att ? 'Checked In' : 'Pending',
    };
  });

  const detailRegColumns = [
    { key: 'sl', label: 'SL' },
    { key: 'student_name', label: 'Student Name' },
    { key: 'roll_no', label: 'Roll no' },
    { key: 'registration_date', label: 'Registration date' },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (row) => (
        <span className={`badge ${row.attendance === 'Checked In' ? 'badge-emerald' : 'badge-ghost'}`}>
          {row.attendance === 'Checked In' ? '✓ Checked In' : 'Pending'}
        </span>
      ),
    },
  ];

  const detailSponsorsData = detailSponsors.map((s, i) => ({
    ...s,
    sl: i + 1,
  }));

  const detailSponsorColumns = [
    { key: 'sl', label: 'SL' },
    { key: 'sponsor_name', label: 'Sponsor Name' },
    {
      key: 'amount_contributed',
      label: 'Amount Contributed',
      render: (row) => `₹${row.amount_contributed.toLocaleString('en-IN')}`,
    },
  ];

  const detailExpensesData = detailExpenses.map((e, i) => ({
    ...e,
    sl: i + 1,
  }));

  const detailExpenseColumns = [
    { key: 'sl', label: 'SL' },
    { key: 'budget_head', label: 'Budget Head' },
    { key: 'description', label: 'Description' },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => `₹${row.amount.toLocaleString('en-IN')}`,
    },
  ];

  return (
    <div className="page-events">
      <div className="page-header">
        <div>
          <h2>Event Management</h2>
          <p className="page-subtitle">Create, edit, and manage college events</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancel' : '+ Create Event'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card slide-in">
          <div className="card-header">
            <h3>{editId ? 'Edit Event' : 'Create New Event'}</h3>
            <span className="badge badge-blue">{editId ? 'UPDATE' : 'INSERT'}</span>
          </div>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Event Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Annual Tech Summit" />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Venue (FK → Venues)</label>
              <select required value={form.venue_id} onChange={e => setForm({ ...form, venue_id: e.target.value })}>
                <option value="">Select Venue…</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name} (Capacity: {v.capacity})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Base Budget (₹)</label>
              <input type="number" required min="0" value={form.base_budget} onChange={e => setForm({ ...form, base_budget: e.target.value })} placeholder="e.g., 50000" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editId ? 'Update Event' : 'Create Event'}</button>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={eventsWithVenue} emptyMessage="No events found. Create your first event!" />

      {detailEvent && (
        <div className="card detail-card slide-in">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>📋 {detailEvent.name} — Details</h3>
              <span className="badge badge-blue">{detailRegs.length} Registrations</span>
              <span className="badge badge-emerald">{detailSponsors.length} Sponsors</span>
              <span className="badge badge-purple">{detailExpenses.length} Expenses</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowDetail(null)}>Close</button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-light)', background: '#f8fafc', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${detailTab === 'registrations' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setDetailTab('registrations')}
            >
              👥 Registrations ({detailRegs.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${detailTab === 'sponsors' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setDetailTab('sponsors')}
            >
              🤝 Sponsors ({detailSponsors.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${detailTab === 'expenses' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setDetailTab('expenses')}
            >
              💰 Expenses ({detailExpenses.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${detailTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setDetailTab('all')}
            >
              📑 Show All Tables
            </button>
          </div>

          <div style={{ padding: '1.25rem' }}>
            {(detailTab === 'registrations' || detailTab === 'all') && (
              <div style={{ marginBottom: detailTab === 'all' ? '2.5rem' : 0 }}>
                <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                    👥 Registrations ({detailRegs.length})
                  </h4>
                  <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                    Columns: Student Name • Roll no • Registration date
                  </span>
                </div>
                <DataTable
                  columns={detailRegColumns}
                  data={detailRegsData}
                  emptyMessage="No registrations found for this event."
                />
              </div>
            )}

            {(detailTab === 'sponsors' || detailTab === 'all') && (
              <div style={{ marginBottom: detailTab === 'all' ? '2.5rem' : 0 }}>
                <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                    🤝 Sponsors ({detailSponsors.length})
                  </h4>
                </div>
                <DataTable
                  columns={detailSponsorColumns}
                  data={detailSponsorsData}
                  emptyMessage="No sponsors registered for this event."
                />
              </div>
            )}

            {(detailTab === 'expenses' || detailTab === 'all') && (
              <div>
                <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                    💰 Expenses ({detailExpenses.length})
                  </h4>
                </div>
                <DataTable
                  columns={detailExpenseColumns}
                  data={detailExpensesData}
                  emptyMessage="No expenses recorded for this event."
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card schema-card">
        <div className="card-header">
          <h3>📐 Schema: Events Table</h3>
        </div>
        <pre className="sql-block">{`CREATE TABLE Events (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    name      VARCHAR(255) NOT NULL,
    date      DATE NOT NULL,
    venue_id  INT NOT NULL,
    base_budget DECIMAL(12,2) DEFAULT 0,
    FOREIGN KEY (venue_id) REFERENCES Venues(id)
);`}</pre>
      </div>
    </div>
  );
}
