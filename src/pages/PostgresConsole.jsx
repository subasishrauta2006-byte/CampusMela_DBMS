import { useState } from 'react';
import { useApp } from '../context/AppContext';

const PRESET_QUERIES = [
  {
    name: 'Financial Summary View',
    sql: 'SELECT * FROM vw_financial_summary;',
    desc: 'Aggregates base budget, total sponsorships, total expenses and remaining balance per event',
  },
  {
    name: 'Attendance Report View',
    sql: 'SELECT * FROM vw_attendance_report;',
    desc: 'Joins Events, Venues, Registrations and Attendance with percentage fill metrics',
  },
  {
    name: 'Expenses by Budget Head',
    sql: 'SELECT * FROM vw_expense_by_category;',
    desc: 'GROUP BY budget_head with percentage contribution to total expenditure',
  },
  {
    name: 'Event Participants with Check-in',
    sql: 'SELECT * FROM vw_event_participants LIMIT 10;',
    desc: 'Detailed view of student registrations and check-in status',
  },
  {
    name: 'All Registered Tables in PostgreSQL',
    sql: `SELECT table_name, (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count 
FROM information_schema.tables t 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;`,
    desc: 'System catalog query showing all public user tables',
  },
  {
    name: 'Test Composite PK Violation',
    sql: `INSERT INTO Registrations (event_id, participant_id, registration_date)
VALUES (1, 1, CURRENT_DATE);`,
    desc: 'Will fail because (event_id=1, participant_id=1) already exists in Registrations',
  },
  {
    name: 'Test Foreign Key Violation',
    sql: `INSERT INTO Events (name, date, venue_id, base_budget)
VALUES ('Invalid Event', '2026-12-31', 9999, 10000);`,
    desc: 'Will fail because venue_id 9999 does not exist in Venues table',
  },
  {
    name: 'Test CHECK Constraint Violation',
    sql: `INSERT INTO Events (name, date, venue_id, base_budget)
VALUES ('Negative Budget Event', '2026-12-31', 1, -5000);`,
    desc: 'Will fail because base_budget must be >= 0',
  },
];

export default function PostgresConsole() {
  const { db, refresh, addToast, dbStatus } = useApp();
  const [sql, setSql] = useState('SELECT * FROM vw_financial_summary;');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleRunQuery = async (queryText = sql) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await db.executeSql(queryText);
      setResult(res);
      addToast(`Query executed in ${res.durationMs}ms (${res.rowCount || res.rows.length} rows)`);
      refresh();
    } catch (err) {
      setError(err.message);
      addToast(`PostgreSQL Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDb = async () => {
    if (!window.confirm('Are you sure you want to re-seed the PostgreSQL database with original sample data?')) {
      return;
    }
    setResetting(true);
    try {
      await db.resetDatabase();
      addToast('PostgreSQL database successfully re-seeded from schema.sql!');
      refresh();
      handleRunQuery('SELECT * FROM Events;');
    } catch (err) {
      addToast(`Reset failed: ${err.message}`, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="page-postgres">
      <div className="page-header">
        <div>
          <h2>🐘 PostgreSQL Database Console</h2>
          <p className="page-subtitle">
            Live interactive SQL terminal connected to PostgreSQL 18 (database: <code>campushub</code>)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            onClick={handleResetDb}
            disabled={resetting}
            title="Re-run schema.sql to restore clean sample data"
          >
            {resetting ? 'Resetting...' : '🔄 Re-seed Database'}
          </button>
        </div>
      </div>

      {/* Database Connection Status Card */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(30, 41, 59, 0.7)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: dbStatus?.connected ? '#10b981' : '#ef4444',
                boxShadow: dbStatus?.connected ? '0 0 10px #10b981' : '0 0 10px #ef4444',
              }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#f1f5f9' }}>
                {dbStatus?.connected ? 'Connected to PostgreSQL' : 'PostgreSQL Offline (Using Local Cache)'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Host: <code>localhost:5432</code> &nbsp;|&nbsp; Database: <code>{dbStatus?.database || 'campushub'}</code> &nbsp;|&nbsp; User: <code>{dbStatus?.user || 'postgres'}</code>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-success" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              Port 5432
            </span>
            <span className="badge badge-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              8 Relational Tables
            </span>
            <span className="badge badge-purple" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              4 SQL Views
            </span>
          </div>
        </div>
      </div>

      {/* Preset Queries */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3>⚡ Preset Demonstration Queries</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', padding: '1rem' }}>
          {PRESET_QUERIES.map((item, idx) => (
            <button
              key={idx}
              className="btn btn-secondary"
              style={{
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                padding: '0.75rem 1rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(15, 23, 42, 0.6)',
              }}
              onClick={() => {
                setSql(item.sql);
                handleRunQuery(item.sql);
              }}
            >
              <span style={{ fontWeight: 600, color: '#38bdf8' }}>{item.name}</span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Editor */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>SQL Query Editor</h3>
          <button
            className="btn btn-primary"
            onClick={() => handleRunQuery()}
            disabled={loading || !sql.trim()}
          >
            {loading ? 'Executing...' : '▶ Execute SQL (Ctrl+Enter)'}
          </button>
        </div>
        <div style={{ padding: '1rem' }}>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === 'Enter') {
                handleRunQuery();
              }
            }}
            rows={4}
            style={{
              width: '100%',
              background: '#090d16',
              color: '#38bdf8',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.95rem',
              padding: '0.85rem',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              outline: 'none',
              resize: 'vertical',
            }}
            placeholder="Type your SQL query here... e.g. SELECT * FROM Events;"
          />
        </div>
      </div>

      {/* Results or Error Output */}
      {error && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid #ef4444',
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️ PostgreSQL Error</span>
          </div>
          <div style={{ fontFamily: 'Consolas, monospace', fontSize: '0.9rem', color: '#fca5a5' }}>
            {error}
          </div>
        </div>
      )}

      {result && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Query Results ({result.rows?.length || 0} rows)</h3>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Execution time: <strong>{result.durationMs}ms</strong>
            </span>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
            {result.rows && result.rows.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(result.rows[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} style={{ fontFamily: 'Consolas, monospace', fontSize: '0.85rem' }}>
                          {val === null ? <span style={{ color: '#64748b' }}>NULL</span> : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                Query executed successfully. 0 rows returned. (Command: {result.command})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
