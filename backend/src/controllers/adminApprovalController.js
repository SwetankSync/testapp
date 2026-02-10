const db = require('../db');
const { processUplineTreeEffects, upsertWallet } = require('../services/spDistribution');
const { sendActivationNotification } = require('../services/notifications');

async function listPendingOrders(_req, res, next) {
  try {
    const result = await db.query(
      `SELECT pr.id, pr.user_id, u.member_code, u.full_name, pr.sp_requested, pr.screenshot_url, pr.payment_reference, pr.created_at
       FROM payment_requests pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.status = 'PENDING'
       ORDER BY pr.created_at ASC`,
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function approveOrder(req, res, next) {
  const paymentRequestId = req.params.paymentRequestId || req.body.paymentRequestId;
  if (!paymentRequestId) return res.status(400).json({ message: 'paymentRequestId is required' });

  const adminId = req.user.id;
  const client = await db.getClient();

  try {
    await client.query('BEGIN');
    const payment = await client.query(
      `SELECT pr.*, u.status, u.personal_sp_30d, u.member_code, u.phone
       FROM payment_requests pr
       INNER JOIN users u ON u.id = pr.user_id
       WHERE pr.id = $1 AND pr.status = 'PENDING'
       FOR UPDATE`,
      [paymentRequestId],
    );

    if (!payment.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pending payment request not found' });
    }

    const row = payment.rows[0];
    const spRequested = Number(row.sp_requested);
    const activationSP = row.status === 'RED' ? Math.min(spRequested, 50) : 0;
    const overflowSP = row.status === 'RED' ? Math.max(spRequested - 50, 0) : spRequested;

    await client.query('UPDATE payment_requests SET status = $2, approved_by = $3, approved_at = NOW() WHERE id = $1', [paymentRequestId, 'APPROVED', adminId]);

    await client.query(
      `UPDATE users
       SET status = CASE WHEN status = 'RED' AND $2 >= 50 THEN 'GREEN' ELSE status END,
           personal_sp_30d = personal_sp_30d + $2,
           updated_at = NOW()
       WHERE id = $1`,
      [row.user_id, activationSP > 0 ? activationSP : spRequested],
    );

    if (activationSP > 0) {
      await client.query(
        `INSERT INTO sp_ledger (user_id, transaction_type, sp_amount, notes)
         VALUES ($1, 'ID_ACTIVATION', $2, 'Auto activation after reaching 50 SP')`,
        [row.user_id, activationSP],
      );
    }

    if (overflowSP > 0) {
      await upsertWallet(client, row.user_id, 'REPURCHASE', overflowSP);
      await upsertWallet(client, row.user_id, 'AVAILABLE', overflowSP);
      await client.query(
        `INSERT INTO sp_ledger (user_id, transaction_type, sp_amount, amount, notes)
         VALUES ($1, 'OVERFLOW_TO_REPURCHASE', $2, $2, 'Overflow moved to repurchase wallet')`,
        [row.user_id, overflowSP],
      );
    }

    await client.query(
      `INSERT INTO sp_ledger (user_id, transaction_type, sp_amount, notes)
       VALUES ($1, 'SP_PURCHASE', $2, 'Manual payment verified by admin')`,
      [row.user_id, spRequested],
    );

    await processUplineTreeEffects({ client, purchaserId: row.user_id, purchaseSP: spRequested });
    await client.query('COMMIT');

    if (activationSP > 0) {
      await sendActivationNotification({ phone: row.phone, memberCode: row.member_code });
    }

    return res.json({ message: 'Order approved', activationSP, overflowSP });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
}

module.exports = { listPendingOrders, approveOrder };
