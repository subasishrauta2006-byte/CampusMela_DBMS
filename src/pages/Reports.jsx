import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';

// Color palette for pie chart
const PIE_COLORS = [
  '#6366f1', '#f43f5e', '#10b981', '#f59e0b',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

function PieChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  if (total === 0) return <p className="text-muted">No expense data available.</p>;

  let cumAngle = 0;
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;

  const slices = data.map((d, i) => {
    const angle = (d.total / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const color = PIE_COLORS[i % PIE_COLORS.length];

    return { pathData, color, label: d.category, value: d.total, pct: Math.round((d.total / total) * 100) };
  });

  return (
    <div className="pie-chart-container">
      <svg viewBox={`0 0 ${size} ${size}`} className="pie-chart">
        {slices.map((s, i) => (
          <path key={i} d={s.pathData} fill={s.color} stroke="var(--bg-primary)" strokeWidth="2">
            <title>{s.label}: ₹{s.value.toLocaleString('en-IN')} ({s.pct}%)</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r="40" fill="var(--bg-primary)" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontWeight="700">
          ₹{total.toLocaleString('en-IN')}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-secondary)" fontSize="9">
          Total Spend
        </text>
      </svg>
      <div className="pie-legend">
        {slices.map((s, i) => (
          <div className="legend-item" key={i}>
            <span className="legend-color" style={{ background: s.color }} />
            <span className="legend-label">{s.label}</span>
            <span className="legend-value">₹{s.value.toLocaleString('en-IN')} ({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports() {
  const { db, refreshKey } = useApp();

  const attendanceReport = db.getAttendanceReport();
  const financialSummary = db.getFinancialSummary();
  const expenseByCategory = db.getExpenseByCategory();

  // --- Attendance Report Columns ---
  const attColumns = [
    { key: 'event_name', label: 'Event Name' },
    { key: 'event_date', label: 'Date', render: (r) => new Date(r.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { key: 'venue_name', label: 'Venue' },
    { key: 'venue_capacity', label: 'Venue Capacity' },
    { key: 'total_registrations', label: 'Registrations' },
    { key: 'total_attendance', label: 'Attendance' },
    {
      key: 'attendance_pct', label: 'Attendance %',
      render: (r) => (
        <div className="pct-cell">
          <div className="mini-bar"><div className={`mini-fill ${r.attendance_pct > 70 ? 'good' : r.attendance_pct > 40 ? 'mid' : 'low'}`} style={{ width: `${r.attendance_pct}%` }} /></div>
          <span>{r.attendance_pct}%</span>
        </div>
      ),
    },
    {
      key: 'venue_fill_pct', label: '% Venue Full',
      render: (r) => (
        <span className={`badge ${r.venue_fill_pct > 80 ? 'badge-rose' : r.venue_fill_pct > 50 ? 'badge-amber' : 'badge-emerald'}`}>
          {r.venue_fill_pct}%
        </span>
      ),
    },
  ];

  // --- Financial Summary Columns ---
  const finColumns = [
    { key: 'event_name', label: 'Event Name' },
    { key: 'base_budget', label: 'Base Budget', render: (r) => `₹${r.base_budget.toLocaleString('en-IN')}` },
    { key: 'total_sponsorship', label: '+ Sponsorships', render: (r) => <span className="text-success">₹{r.total_sponsorship.toLocaleString('en-IN')}</span> },
    { key: 'total_budget', label: 'Total Budget', render: (r) => <strong>₹{r.total_budget.toLocaleString('en-IN')}</strong> },
    { key: 'total_expenses', label: 'Total Expenses', render: (r) => <span className="text-danger">₹{r.total_expenses.toLocaleString('en-IN')}</span> },
    {
      key: 'remaining_budget', label: 'Remaining',
      render: (r) => (
        <span className={r.remaining_budget >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>
          ₹{r.remaining_budget.toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  // --- Expense by Category Columns ---
  const catColumns = [
    {
      key: 'category', label: 'Budget Head',
      render: (r) => <span className={`category-badge cat-${r.category.toLowerCase()}`}>{r.category}</span>,
    },
    { key: 'total', label: 'Total Amount', render: (r) => `₹${r.total.toLocaleString('en-IN')}` },
    {
      key: 'percentage', label: '% of Total',
      render: (r) => {
        const grand = expenseByCategory.reduce((s, c) => s + c.total, 0);
        const pct = grand > 0 ? Math.round((r.total / grand) * 100) : 0;
        return (
          <div className="pct-cell">
            <div className="mini-bar"><div className="mini-fill mid" style={{ width: `${pct}%` }} /></div>
            <span>{pct}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-reports">
      <div className="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p className="page-subtitle">SQL aggregate queries visualized — JOINs, GROUP BY, SUM, COUNT</p>
        </div>
      </div>

      {/* Report 1: Attendance */}
      <div className="card report-card">
        <div className="card-header">
          <h3>📊 Attendance Report</h3>
          <span className="badge badge-blue">JOIN + GROUP BY</span>
        </div>
        <pre className="sql-block">{`SELECT e.name, v.name AS venue, v.capacity,
       COUNT(DISTINCT r.participant_id) AS registrations,
       COUNT(DISTINCT a.participant_id) AS attendance,
       ROUND(COUNT(a.participant_id)*100.0 / NULLIF(COUNT(r.participant_id),0), 1) AS pct
FROM Events e
JOIN Venues v ON e.venue_id = v.id
LEFT JOIN Registrations r ON e.id = r.event_id
LEFT JOIN Attendance a ON e.id = a.event_id
GROUP BY e.id, e.name, v.name, v.capacity;`}</pre>
        <DataTable columns={attColumns} data={attendanceReport} />
      </div>

      {/* Report 2: Financial Summary */}
      <div className="card report-card">
        <div className="card-header">
          <h3>💰 Financial Summary Report</h3>
          <span className="badge badge-emerald">AGGREGATES + MATH</span>
        </div>
        <pre className="sql-block">{`SELECT e.name,
       e.base_budget,
       COALESCE(SUM(s.amount_contributed), 0) AS sponsorships,
       e.base_budget + COALESCE(SUM(s.amount_contributed), 0) AS total_budget,
       COALESCE(SUM(ex.amount), 0) AS total_expenses,
       (e.base_budget + COALESCE(SUM(s.amount_contributed),0) - COALESCE(SUM(ex.amount),0)) AS remaining
FROM Events e
LEFT JOIN Sponsors s ON e.id = s.event_id
LEFT JOIN Expenses ex ON e.id = ex.event_id
GROUP BY e.id, e.name, e.base_budget;`}</pre>
        <DataTable columns={finColumns} data={financialSummary} />
      </div>

      {/* Report 3: Expense by Category */}
      <div className="card report-card">
        <div className="card-header">
          <h3>📈 Expense by Category</h3>
          <span className="badge badge-amber">GROUP BY budget_head</span>
        </div>
        <pre className="sql-block">{`SELECT budget_head, SUM(amount) AS total_amount
FROM Expenses
GROUP BY budget_head
ORDER BY total_amount DESC;`}</pre>
        <div className="category-report-layout">
          <PieChart data={expenseByCategory} />
          <div className="category-table-wrapper">
            <DataTable columns={catColumns} data={expenseByCategory} />
          </div>
        </div>
      </div>
    </div>
  );
}
