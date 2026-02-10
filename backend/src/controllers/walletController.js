const db = require('../db');

async function getBalances(req, res, next) {
  try {
    const result = await db.query(
      `WITH wallet_types AS (
         SELECT unnest(ARRAY['INCENTIVE','REPURCHASE','BONUS','HOLD','AVAILABLE'])::wallet_type AS wallet_type
       )
       SELECT wt.wallet_type, COALESCE(w.balance, 0) AS balance
       FROM wallet_types wt
       LEFT JOIN wallets w
         ON w.user_id = $1
        AND w.wallet_type = wt.wallet_type
       ORDER BY wt.wallet_type`,
      [req.user.id],
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function getHistory(req, res, next) {
  try {
    const result = await db.query('SELECT * FROM sp_ledger WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200', [req.user.id]);
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function withdraw(req, res, next) {
  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const hold = await client.query('SELECT is_hold_active FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
    if (!hold.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }
    if (hold.rows[0].is_hold_active) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Hold active. Withdrawal blocked.' });
    }

    const available = await client.query("SELECT balance FROM wallets WHERE user_id = $1 AND wallet_type = 'AVAILABLE' FOR UPDATE", [req.user.id]);
    const balance = available.rowCount ? Number(available.rows[0].balance) : 0;
    if (balance < Number(amount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    await client.query("UPDATE wallets SET balance = balance - $2, updated_at = NOW() WHERE user_id = $1 AND wallet_type = 'AVAILABLE'", [req.user.id, Number(amount)]);
    await client.query('INSERT INTO withdrawal_requests (user_id, amount) VALUES ($1,$2)', [req.user.id, Number(amount)]);
    await client.query(
      `INSERT INTO sp_ledger (user_id, transaction_type, amount, notes)
       VALUES ($1, 'WITHDRAWAL', $2, 'Withdrawal request created')`,
      [req.user.id, Number(amount)],
    );

    await client.query('COMMIT');
    return res.status(201).json({ message: 'Withdrawal request submitted' });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
}

module.exports = { getBalances, getHistory, withdraw };
