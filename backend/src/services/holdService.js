const db = require('../db');
const { sendHoldNotification } = require('./notifications');

async function evaluateAndApplyMonthlyHold() {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const members = await client.query(
      `SELECT id, member_code, phone, personal_sp_30d, is_hold_active
       FROM users
       WHERE role = 'MEMBER'
       FOR UPDATE`,
    );

    for (const user of members.rows) {
      const personal = Number(user.personal_sp_30d || 0);

      if (personal < 50) {
        await client.query('UPDATE users SET is_hold_active = TRUE, personal_sp_30d = 0, updated_at = NOW() WHERE id = $1', [user.id]);

        await client.query(
          `INSERT INTO hold_events (user_id, reason)
           VALUES ($1, $2)`,
          [user.id, 'Monthly 50 SP personal business not achieved'],
        );

        const incomeWallets = await client.query(
          `SELECT wallet_type, balance FROM wallets
           WHERE user_id = $1 AND wallet_type IN ('INCENTIVE', 'REPURCHASE', 'BONUS')
           FOR UPDATE`,
          [user.id],
        );

        let moved = 0;
        for (const row of incomeWallets.rows) {
          const bal = Number(row.balance || 0);
          if (bal <= 0) continue;
          moved += bal;
          await client.query('UPDATE wallets SET balance = 0, updated_at = NOW() WHERE user_id = $1 AND wallet_type = $2', [user.id, row.wallet_type]);
        }

        if (moved > 0) {
          await client.query(
            `INSERT INTO wallets (user_id, wallet_type, balance)
             VALUES ($1, 'HOLD', $2)
             ON CONFLICT (user_id, wallet_type)
             DO UPDATE SET balance = wallets.balance + EXCLUDED.balance, updated_at = NOW()`,
            [user.id, moved],
          );

          await client.query(
            `INSERT INTO sp_ledger (user_id, transaction_type, amount, notes)
             VALUES ($1, 'HOLD_TRANSFER', $2, 'Income transferred to HOLD due to monthly SP shortfall')`,
            [user.id, moved],
          );
        }

        await sendHoldNotification({ phone: user.phone, memberCode: user.member_code, reason: 'Monthly target not met' });
      } else if (user.is_hold_active) {
        const holdWallet = await client.query(
          `SELECT balance FROM wallets
           WHERE user_id = $1 AND wallet_type = 'HOLD'
           FOR UPDATE`,
          [user.id],
        );

        const holdBalance = holdWallet.rowCount ? Number(holdWallet.rows[0].balance || 0) : 0;

        if (holdBalance > 0) {
          await client.query(
            `INSERT INTO wallets (user_id, wallet_type, balance)
             VALUES ($1, 'AVAILABLE', $2)
             ON CONFLICT (user_id, wallet_type)
             DO UPDATE SET balance = wallets.balance + EXCLUDED.balance, updated_at = NOW()`,
            [user.id, holdBalance],
          );

          await client.query('UPDATE wallets SET balance = 0, updated_at = NOW() WHERE user_id = $1 AND wallet_type = $2', [user.id, 'HOLD']);

          await client.query(
            `INSERT INTO sp_ledger (user_id, transaction_type, amount, notes)
             VALUES ($1, 'HOLD_RELEASE', $2, 'Hold released after meeting personal monthly target')`,
            [user.id, holdBalance],
          );
        }

        await client.query('UPDATE users SET is_hold_active = FALSE, personal_sp_30d = 0, updated_at = NOW() WHERE id = $1', [user.id]);
        await client.query(
          `UPDATE hold_events
           SET released = TRUE, hold_released_at = NOW()
           WHERE user_id = $1 AND released = FALSE`,
          [user.id],
        );
      } else {
        await client.query('UPDATE users SET personal_sp_30d = 0, updated_at = NOW() WHERE id = $1', [user.id]);
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  evaluateAndApplyMonthlyHold,
};
