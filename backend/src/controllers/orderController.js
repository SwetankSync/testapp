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
       RETURNING id, user_id, sp_requested, status, created_at`,
      [req.user.id, Number(spRequested), screenshotUrl || null, paymentReference || null],
    );
    return res.status(201).json(inserted.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = { submitOrder };
