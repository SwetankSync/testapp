const db = require('../db');

async function getDownline(req, res, next) {
  try {
    const userId = req.query.userId || req.user.id;
    const result = await db.query('SELECT id, member_code, full_name, status, sponsor_id, created_at FROM users WHERE sponsor_id = $1 ORDER BY created_at DESC', [userId]);
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function getFullTree(_req, res, next) {
  try {
    const result = await db.query('SELECT id, member_code, full_name, status, sponsor_id, path FROM users ORDER BY path ASC');
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function getTreeStats(_req, res, next) {
  try {
    const result = await db.query(
      `SELECT
        COUNT(*)::int AS registrations,
        COUNT(*) FILTER (WHERE status = 'GREEN')::int AS active,
        COUNT(*) FILTER (WHERE status = 'RED')::int AS inactive
      FROM users WHERE role = 'MEMBER'`,
    );
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getDownline, getFullTree, getTreeStats };
