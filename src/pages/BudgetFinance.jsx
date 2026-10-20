import { useState } from 'react';
import { useApp } from '../context/AppContext';
import DataTable from '../components/DataTable';

export default function BudgetFinance() {
  const { db, refresh, refreshKey, addToast } = useApp();
  const events = db.getEvents();
  const sponsors = db.getSponsors();
  const expenses = db.getExpenses();
  const participants = db.getParticipants();

  const [sponsorForm, setSponsorForm] = useState({ event_id: '', sponsor_name: '', amount_contributed: '' });
  const [expenseForm, setExpenseForm] = useState({ event_id: '', budget_head: '', amount: '', description: '' });
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const budgetHeads = ['Marketing', 'Food', 'Logistics', 'Decoration', 'Prizes', 'Travel', 'Miscellaneous'];

  const handleAddSponsor = async (e) => {
    e.preventDefault();
    try {
      await db.addSponsor({
        event_id: parseInt(sponsorForm.event_id),
        sponsor_name: sponsorForm.sponsor_name,
        amount_contributed: parseFloat(sponsorForm.amount_contributed),
      });
      addToast(`Sponsor "${sponsorForm.sponsor_name}" added successfully.`);
      setSponsorForm({ event_id: '', sponsor_name: '', amount_contributed: '' });
      setShowSponsorForm(false);
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await db.addExpense({
        event_id: parseInt(expenseForm.event_id),
        budget_head: expenseForm.budget_head,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
      });
      addToast(`Expense of ₹${expenseForm.amount} added under "${expenseForm.budget_head}".`);
      setExpenseForm({ event_id: '', budget_head: '', amount: '', description: '' });
      setShowExpenseForm(false);
      refresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Enrich sponsor data with event name (JOIN)
  const sponsorData = sponsors.map(s => {
    const ev = events.find(e => e.id === s.event_id);
    return { ...s, event_name: ev ? ev.name : 'Deleted Event' };
  });

  // Enrich expense data with event name (JOIN)
  const expenseData = expenses.map(ex => {
    const ev = events.find(e => e.id === ex.event_id);
    return { ...ex, event_name: ev ? ev.name : 'Deleted Event' };
  });

  const sponsorColumns = [
    { key: 'id', label: 'ID' },
    { key: 'event_name', label: 'Event' },
    { key: 'sponsor_name', label: 'Sponsor' },
    { key: 'amount_contributed', label: 'Amount', render: (row) => `₹${row.amount_contributed.toLocaleString('en-IN')}` },
  ];

  const expenseColumns = [
    { key: 'id', label: 'ID' },
    { key: 'event_name', label: 'Event' },
    { key: 'budget_head', label: 'Category', render: (row) => <span className={`category-badge cat-${row.budget_head.toLowerCase()}`}>{row.budget_head}</span> },
    { key: 'amount', label: 'Amount', render: (row) => `₹${row.amount.toLocaleString('en-IN')}` },
    { key: 'description', label: 'Description' },
  ];

  // Financial summary
  const summary = db.getFinancialSummary();

  return (
    <div className="page-budget">
      <div className="page-header">
        <div>
          <h2>Budget & Finance</h2>
          <p className="page-subtitle">Manage sponsors (income) and expenses (outgoing) for events</p>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="finance-cards">
        {summary.map((s, i) => {
          const pct = s.total_budget > 0 ? Math.round((s.total_expenses / s.total_budget) * 100) : 0;
          const isOver = s.remaining_budget < 0;
          return (
            <div className={`finance-card ${isOver ? 'over-budget' : ''}`} key={i}>
              <h4>{s.event_name}</h4>
              <div className="finance-card-grid">
                <div className="fc-item">
                  <span className="fc-label">Base Budget</span>
                  <span className="fc-value">₹{s.base_budget.toLocaleString('en-IN')}</span>
                </div>
                <div className="fc-item">
                  <span className="fc-label">+ Sponsors</span>
                  <span className="fc-value income">₹{s.total_sponsorship.toLocaleString('en-IN')}</span>
                </div>
                <div className="fc-item">
                  <span className="fc-label">Total Budget</span>
                  <span className="fc-value">₹{s.total_budget.toLocaleString('en-IN')}</span>
                </div>
                <div className="fc-item">
                  <span className="fc-label">Expenses</span>
                  <span className="fc-value expense">₹{s.total_expenses.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="fc-remaining">
                <span>Remaining</span>
                <span className={isOver ? 'text-danger' : 'text-success'}>
                  ₹{s.remaining_budget.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${pct > 80 ? 'danger' : pct > 50 ? 'warning' : 'safe'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sponsors Section */}
      <div className="card">
        <div className="card-header">
          <h3>💰 Sponsors (Income)</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowSponsorForm(!showSponsorForm)}>
            {showSponsorForm ? 'Cancel' : '+ Add Sponsor'}
          </button>
        </div>
        {showSponsorForm && (
          <form onSubmit={handleAddSponsor} className="form-grid inline-form slide-in">
            <div className="form-group">
              <label>Event</label>
              <select required value={sponsorForm.event_id} onChange={e => setSponsorForm({ ...sponsorForm, event_id: e.target.value })}>
                <option value="">Select Event…</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Sponsor Name</label>
              <input type="text" required value={sponsorForm.sponsor_name} onChange={e => setSponsorForm({ ...sponsorForm, sponsor_name: e.target.value })} placeholder="e.g., Microsoft" />
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" required min="1" value={sponsorForm.amount_contributed} onChange={e => setSponsorForm({ ...sponsorForm, amount_contributed: e.target.value })} placeholder="e.g., 25000" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add Sponsor</button>
            </div>
          </form>
        )}
        <DataTable columns={sponsorColumns} data={sponsorData} emptyMessage="No sponsors added yet." />
      </div>

      {/* Expenses Section */}
      <div className="card">
        <div className="card-header">
          <h3>📊 Expenses (Outgoing)</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowExpenseForm(!showExpenseForm)}>
            {showExpenseForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>
        {showExpenseForm && (
          <form onSubmit={handleAddExpense} className="form-grid inline-form slide-in">
            <div className="form-group">
              <label>Event</label>
              <select required value={expenseForm.event_id} onChange={e => setExpenseForm({ ...expenseForm, event_id: e.target.value })}>
                <option value="">Select Event…</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Budget Head</label>
              <select required value={expenseForm.budget_head} onChange={e => setExpenseForm({ ...expenseForm, budget_head: e.target.value })}>
                <option value="">Select Category…</option>
                {budgetHeads.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" required min="1" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="e.g., 5000" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" required value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="e.g., Printing of event banners" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add Expense</button>
            </div>
          </form>
        )}
        <DataTable columns={expenseColumns} data={expenseData} emptyMessage="No expenses recorded yet." />
      </div>
    </div>
  );
}
