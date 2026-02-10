const db = require('../db');

async function getDashboardStats(req, res, next) {
  try {
    const stats = await db.query(
      `SELECT
         (SELECT COUNT(*)::int FROM users WHERE role='MEMBER') AS registrations,
         (SELECT COUNT(*)::int FROM users WHERE role='MEMBER' AND status='GREEN') AS active,
         (SELECT COUNT(*)::int FROM payment_requests WHERE user_id = $1) AS total_orders,
         (SELECT COALESCE(SUM(sp_requested),0) FROM payment_requests WHERE user_id = $1 AND status='APPROVED') AS approved_sp,
         (SELECT COALESCE(balance,0) FROM wallets WHERE user_id = $1 AND wallet_type='AVAILABLE') AS available_balance`,
      [req.user.id],
    );
    return res.json(stats.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getDashboardStats };
