const db = require('../db');

async function listExpenses(_req, res, next) {
  try {
    const result = await db.query('SELECT * FROM expenses ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function createExpense(req, res, next) {
  const { title, amount, mode, kind, notes } = req.body;
  if (!title || !amount || !mode || !kind) {
    return res.status(400).json({ message: 'title, amount, mode, kind are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO expenses (title, amount, mode, kind, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [title, Number(amount), mode, kind, notes || null, req.user.id],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listExpenses, createExpense };
