const db = require('../db');

async function submitOrder(req, res, next) {
  const { spRequested, screenshotUrl, paymentReference } = req.body;
  if (!spRequested || Number(spRequested) <= 0) {
    return res.status(400).json({ message: 'spRequested must be greater than 0' });
  }

  try {
    const inserted = await db.query(
      `INSERT INTO payment_requests (user_id, sp_requested, screenshot_url, payment_reference)
       VALUES ($1,$2,$3,$4)
       RETURNING id, user_id, sp_requested, status, screenshot_url, payment_reference, created_at`,
      [req.user.id, Number(spRequested), screenshotUrl || null, paymentReference || null],
    );
    return res.status(201).json(inserted.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function myOrders(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, sp_requested, screenshot_url, payment_reference, status, approved_at, created_at
       FROM payment_requests
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id],
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

module.exports = { submitOrder, myOrders };
