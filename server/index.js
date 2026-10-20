import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to format PostgreSQL errors into friendly user messages
function handlePgError(err, res) {
  console.error('[Database Error]', err);
  // PostgreSQL Error Codes:
  // 23505: unique_violation
  // 23503: foreign_key_violation
  // 23514: check_violation
  // 23502: not_null_violation
  if (err.code === '23505') {
    return res.status(409).json({
      error: `UNIQUE Constraint Violation: ${err.detail || err.message}`,
      code: err.code,
    });
  }
  if (err.code === '23503') {
    return res.status(400).json({
      error: `Foreign Key Constraint Violation: ${err.detail || err.message}`,
      code: err.code,
    });
  }
  if (err.code === '23514') {
    return res.status(400).json({
      error: `CHECK Constraint Violation: ${err.detail || err.message}`,
      code: err.code,
    });
  }
  return res.status(500).json({
    error: err.message || 'Internal database server error',
    code: err.code,
  });
}

// 1. Connection Health & DB info
app.get('/api/status', async (req, res) => {
  try {
    const dbRes = await query('SELECT current_database(), current_user, version();');
    res.json({
      connected: true,
      database: dbRes.rows[0].current_database,
      user: dbRes.rows[0].current_user,
      version: dbRes.rows[0].version,
      port: 5432,
    });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// 2. Fetch all tables in one sync call for frontend initialization / refresh
app.get('/api/all-data', async (req, res) => {
  try {
    const [
      venuesRes,
      eventsRes,
      organizersRes,
      participantsRes,
      registrationsRes,
      attendanceRes,
      sponsorsRes,
      expensesRes,
      attendanceReportRes,
      financialSummaryRes,
      expenseByCategoryRes,
    ] = await Promise.all([
      query('SELECT * FROM Venues ORDER BY id ASC;'),
      query('SELECT * FROM Events ORDER BY id ASC;'),
      query('SELECT * FROM Organizers ORDER BY id ASC;'),
      query('SELECT * FROM Participants ORDER BY id ASC;'),
      query('SELECT * FROM Registrations ORDER BY registration_date DESC;'),
      query('SELECT * FROM Attendance ORDER BY check_in_time DESC;'),
      query('SELECT * FROM Sponsors ORDER BY id ASC;'),
      query('SELECT * FROM Expenses ORDER BY id ASC;'),
      query('SELECT * FROM vw_attendance_report;'),
      query('SELECT * FROM vw_financial_summary;'),
      query('SELECT * FROM vw_expense_by_category;'),
    ]);

    res.json({
      venues: venuesRes.rows,
      events: eventsRes.rows.map(e => ({
        ...e,
        date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : e.date,
        base_budget: parseFloat(e.base_budget),
      })),
      organizers: organizersRes.rows,
      participants: participantsRes.rows,
      registrations: registrationsRes.rows.map(r => ({
        ...r,
        registration_date: r.registration_date instanceof Date ? r.registration_date.toISOString().split('T')[0] : r.registration_date,
      })),
      attendance: attendanceRes.rows.map(a => ({
        ...a,
        check_in_time: a.check_in_time instanceof Date ? a.check_in_time.toISOString().replace('T', ' ').substring(0, 19) : a.check_in_time,
      })),
      sponsors: sponsorsRes.rows.map(s => ({
        ...s,
        amount_contributed: parseFloat(s.amount_contributed),
      })),
      expenses: expensesRes.rows.map(ex => ({
        ...ex,
        amount: parseFloat(ex.amount),
      })),
      reports: {
        attendance: attendanceReportRes.rows.map(r => ({
          ...r,
          event_date: r.event_date instanceof Date ? r.event_date.toISOString().split('T')[0] : r.event_date,
          attendance_pct: parseFloat(r.attendance_pct || 0),
          venue_fill_pct: parseFloat(r.venue_fill_pct || 0),
          total_registrations: parseInt(r.total_registrations || 0, 10),
          total_attendance: parseInt(r.total_attendance || 0, 10),
          venue_capacity: parseInt(r.venue_capacity || 0, 10),
        })),
        financial: financialSummaryRes.rows.map(r => ({
          ...r,
          base_budget: parseFloat(r.base_budget || 0),
          total_sponsorship: parseFloat(r.total_sponsorship || 0),
          total_budget: parseFloat(r.total_budget || 0),
          total_expenses: parseFloat(r.total_expenses || 0),
          remaining_budget: parseFloat(r.remaining_budget || 0),
        })),
        expensesByCategory: expenseByCategoryRes.rows.map(r => ({
          category: r.budget_head,
          total: parseFloat(r.total_amount || 0),
          transaction_count: parseInt(r.transaction_count || 0, 10),
          percentage: parseFloat(r.percentage_of_total || 0),
        })),
      },
    });
  } catch (err) {
    handlePgError(err, res);
  }
});

// 3. Events Endpoints
app.post('/api/events', async (req, res) => {
  const { name, date, venue_id, base_budget } = req.body;
  try {
    const result = await query(
      'INSERT INTO Events (name, date, venue_id, base_budget) VALUES ($1, $2, $3, $4) RETURNING *;',
      [name, date, venue_id, base_budget || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handlePgError(err, res);
  }
});

app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { name, date, venue_id, base_budget } = req.body;
  try {
    const result = await query(
      'UPDATE Events SET name = $1, date = $2, venue_id = $3, base_budget = $4 WHERE id = $5 RETURNING *;',
      [name, date, venue_id, base_budget, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    handlePgError(err, res);
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Delete cascading items first or let foreign keys handle it
    await query('DELETE FROM Attendance WHERE event_id = $1;', [id]);
    await query('DELETE FROM Registrations WHERE event_id = $1;', [id]);
    await query('DELETE FROM Sponsors WHERE event_id = $1;', [id]);
    await query('DELETE FROM Expenses WHERE event_id = $1;', [id]);
    const result = await query('DELETE FROM Events WHERE id = $1 RETURNING *;', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully', event: result.rows[0] });
  } catch (err) {
    handlePgError(err, res);
  }
});

// 4. Participants & Organizers
app.post('/api/participants', async (req, res) => {
  const { name, email, roll_number } = req.body;
  try {
    const result = await query(
      'INSERT INTO Participants (name, email, roll_number) VALUES ($1, $2, $3) RETURNING *;',
      [name, email, roll_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handlePgError(err, res);
  }
});

app.post('/api/organizers', async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const result = await query(
      'INSERT INTO Organizers (name, email, role) VALUES ($1, $2, $3) RETURNING *;',
      [name, email, role || 'Faculty Coordinator']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handlePgError(err, res);
  }
});

// 5. Registrations (Composite PK + Venue Capacity Check)
app.post('/api/registrations', async (req, res) => {
  const { event_id, participant_id } = req.body;
  try {
    // Check venue capacity in PostgreSQL
    const capRes = await query(
      `SELECT v.capacity, v.name AS venue_name, COUNT(r.participant_id) AS current_regs
       FROM Events e
       JOIN Venues v ON e.venue_id = v.id
       LEFT JOIN Registrations r ON e.id = r.event_id
       WHERE e.id = $1
       GROUP BY v.capacity, v.name;`,
      [event_id]
    );

    if (capRes.rows.length > 0) {
      const { capacity, current_regs, venue_name } = capRes.rows[0];
      if (parseInt(current_regs, 10) >= parseInt(capacity, 10)) {
        return res.status(400).json({
          error: `Capacity Exceeded: Venue '${venue_name}' is full (${capacity}/${capacity}).`,
        });
      }
    }

    const result = await query(
      'INSERT INTO Registrations (event_id, participant_id, registration_date) VALUES ($1, $2, CURRENT_DATE) RETURNING *;',
      [event_id, participant_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handlePgError(err, res);
  }
});

// 6. Attendance Check-in
app.post('/api/attendance', async (req, res) => {
  const { event_id, participant_id } = req.body;
  try {
    // Check if participant is registered
    const regCheck = await query(
      'SELECT 1 FROM Registrations WHERE event_id = $1 AND participant_id = $2;',
      [event_id, participant_id]
    );
    if (regCheck.rows.length === 0) {
      return res.status(400).json({
        error: `Constraint Violation: Participant ${participant_id} is not registered for Event ${event_id}.`,
      });
    }

    const result = await query(
      'INSERT INTO Attendance (event_id, participant_id, check_in_time) VALUES ($1, $2, NOW()) RETURNING *;',
      [event_id, participant_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handlePgError(err, res);
  }
});

app.delete('/api/attendance/:eventId/:participantId', async (req, res) => {
  const { eventId, participantId } = req.params;
  try {
    await query('DELETE FROM Attendance WHERE event_id = $1 AND participant_id = $2;', [
      eventId,
      participantId,
    ]);
    res.json({ message: 'Check-in removed' });
  } catch (err) {
    handlePgError(err, res);
  }
});

// 7. Sponsors
app.post('/api/sponsors', async (req, res) => {
  const { event_id, sponsor_name, amount_contributed } = req.body;
  try {
    const result = await query(
      'INSERT INTO Sponsors (event_id, sponsor_name, amount_contributed) VALUES ($1, $2, $3) RETURNING *;',
      [event_id, sponsor_name, amount_contributed]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handlePgError(err, res);
  }
});

// 8. Expenses
app.post('/api/expenses', async (req, res) => {
  const { event_id, budget_head, amount, spent_by } = req.body;
  try {
    const result = await query(
      'INSERT INTO Expenses (event_id, budget_head, amount, spent_by) VALUES ($1, $2, $3, $4) RETURNING *;',
      [event_id, budget_head, amount, spent_by || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handlePgError(err, res);
  }
});

// 9. SQL Views (Live Reports directly from PostgreSQL)
app.get('/api/reports/attendance', async (req, res) => {
  try {
    const result = await query('SELECT * FROM vw_attendance_report;');
    res.json(result.rows);
  } catch (err) {
    handlePgError(err, res);
  }
});

app.get('/api/reports/financial', async (req, res) => {
  try {
    const result = await query('SELECT * FROM vw_financial_summary;');
    res.json(result.rows);
  } catch (err) {
    handlePgError(err, res);
  }
});

app.get('/api/reports/expense-categories', async (req, res) => {
  try {
    const result = await query('SELECT * FROM vw_expense_by_category;');
    res.json(result.rows);
  } catch (err) {
    handlePgError(err, res);
  }
});

// 10. Execute Arbitrary SQL Query (for Demo & Testing)
app.post('/api/query', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'SQL query string is required' });

  const start = Date.now();
  try {
    const result = await pool.query(sql);
    const duration = Date.now() - start;
    res.json({
      command: result.command,
      rowCount: result.rowCount,
      rows: result.rows,
      fields: (result.fields || []).map(f => ({ name: f.name, dataTypeID: f.dataTypeID })),
      durationMs: duration,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
      code: err.code,
      position: err.position,
      detail: err.detail,
    });
  }
});

// 11. Reset Database from schema.sql
app.post('/api/reset-db', async (req, res) => {
  try {
    const schemaPath = path.resolve(__dirname, '../schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);
    res.json({ message: 'PostgreSQL database successfully re-seeded from schema.sql' });
  } catch (err) {
    handlePgError(err, res);
  }
});

app.listen(PORT, () => {
  console.log(`CampusHub PostgreSQL API server running on http://localhost:${PORT}`);
});
