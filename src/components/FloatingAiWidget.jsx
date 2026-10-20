import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function FloatingAiWidget({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const { dbStatus, db } = useApp();
  const stats = db.getDashboardStats();

  return (
    <>
      {/* Floating Pill Button */}
      <button
        className="floating-ai-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Campus AI Assistant"
      >
        <span className="ai-icon">✨</span>
        <span className="ai-text">Campus Mela AI</span>
        <span className="ai-status-dot"></span>
      </button>

      {/* Popup Drawer/Modal */}
      {isOpen && (
        <div className="ai-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img src="/logo.png" alt="Campus Mela" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Campus Mela Assistant</h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Track the Fest, Manage the Rest</span>
                </div>
              </div>
              <button className="ai-close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="ai-modal-body">
              {/* Quick stats pill */}
              <div className="ai-stat-banner">
                <div>
                  <span className="ai-stat-number">{stats.totalEvents}</span>
                  <span className="ai-stat-label">Events</span>
                </div>
                <div>
                  <span className="ai-stat-number">{stats.uniqueParticipants}</span>
                  <span className="ai-stat-label">Participants</span>
                </div>
                <div>
                  <span className="ai-stat-number">{dbStatus?.connected ? 'Postgres 18' : 'Offline'}</span>
                  <span className="ai-stat-label">Database</span>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '1rem 0 0.5rem' }}>
                Ask or explore relational queries and database views:
              </p>

              <div className="ai-quick-actions">
                <button
                  className="ai-action-chip"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('reports');
                  }}
                >
                  📊 View Financial Summary View
                </button>
                <button
                  className="ai-action-chip"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('postgres');
                  }}
                >
                  🐘 Open PostgreSQL SQL Console
                </button>
                <button
                  className="ai-action-chip"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('attendance');
                  }}
                >
                  🕒 Check Sankalp 2026 Attendance
                </button>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>Database Integrity Tip:</span>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  The <code>Registrations</code> table uses a <strong>Composite Primary Key (event_id, participant_id)</strong> to prevent duplicate ticket allocations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
