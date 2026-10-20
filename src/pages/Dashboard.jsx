import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { db, refreshKey } = useApp();
  const stats = db.getDashboardStats();
  const eventsWithVenue = db.getEventsWithVenue();
  const financialSummary = db.getFinancialSummary();
  const recentRegs = db.getRegistrations().slice(-5).reverse();
  const participants = db.getParticipants();
  const events = db.getEvents();

  const cards = [
    {
      label: 'Active Events',
      value: stats.totalEvents,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>
        </svg>
      ),
      color: 'var(--accent-blue)',
      bg: 'var(--accent-blue-bg)',
    },
    {
      label: 'Registered Students',
      value: stats.uniqueParticipants,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: 'var(--accent-emerald)',
      bg: 'var(--accent-emerald-bg)',
    },
    {
      label: 'Total Sponsorships',
      value: `₹${stats.totalSponsorship.toLocaleString('en-IN')}`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      color: 'var(--accent-amber)',
      bg: 'var(--accent-amber-bg)',
    },
    {
      label: 'Total Expenses',
      value: `₹${stats.totalExpenses.toLocaleString('en-IN')}`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      color: 'var(--accent-rose)',
      bg: 'var(--accent-rose-bg)',
    },
  ];

  return (
    <div className="page-dashboard">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="page-subtitle">Overview of all college events, registrations, and finances</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card, i) => (
          <div className="stat-card" key={i} style={{ '--card-accent': card.color, '--card-bg': card.bg }}>
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Upcoming Events</h3>
            <span className="badge badge-blue">{eventsWithVenue.length} events</span>
          </div>
          <div className="card-body">
            {eventsWithVenue.map(e => {
              const regs = db.getRegistrationsByEvent(e.id).length;
              return (
                <div className="event-row" key={e.id}>
                  <div className="event-info">
                    <span className="event-name">{e.name}</span>
                    <span className="event-meta">{e.venue_name} • {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="event-stats">
                    <span className="badge badge-ghost">{regs} registered</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Financial Overview</h3>
            <span className="badge badge-emerald">Budget</span>
          </div>
          <div className="card-body">
            {financialSummary.map((f, i) => {
              const pct = f.total_budget > 0 ? Math.round((f.total_expenses / f.total_budget) * 100) : 0;
              return (
                <div className="finance-row" key={i}>
                  <div className="finance-info">
                    <span className="finance-name">{f.event_name}</span>
                    <span className="finance-meta">
                      Spent ₹{f.total_expenses.toLocaleString('en-IN')} of ₹{f.total_budget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${pct > 80 ? 'danger' : pct > 50 ? 'warning' : 'safe'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="progress-label">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Registrations</h3>
            <span className="badge badge-purple">Latest</span>
          </div>
          <div className="card-body">
            {recentRegs.map((r, i) => {
              const p = participants.find(pp => pp.id === r.participant_id);
              const ev = events.find(ee => ee.id === r.event_id);
              return (
                <div className="recent-row" key={i}>
                  <div className="avatar">{p ? p.name.charAt(0) : '?'}</div>
                  <div className="recent-info">
                    <span className="recent-name">{p ? p.name : 'Unknown'}</span>
                    <span className="recent-meta">
                      {ev ? ev.name : 'Unknown'} • {r.registration_date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
