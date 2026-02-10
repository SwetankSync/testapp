const db = require('../db');

async function getTeamTree(req, res, next) {
  try {
    const rootId = req.query.userId || req.user.id;
    const rootResult = await db.query('SELECT id, member_code, full_name, sponsor_id, status FROM users WHERE id = $1', [rootId]);
    if (!rootResult.rowCount) return res.status(404).json({ message: 'User not found' });

    const root = rootResult.rows[0];
    const downline = await db.query(
      `WITH RECURSIVE tree AS (
         SELECT id, member_code, full_name, sponsor_id, status, 0 as depth
         FROM users WHERE id = $1
         UNION ALL
         SELECT u.id, u.member_code, u.full_name, u.sponsor_id, u.status, t.depth + 1
         FROM users u
         JOIN tree t ON u.sponsor_id = t.id
       )
       SELECT * FROM tree ORDER BY depth ASC, full_name ASC`,
      [root.id],
    );

    return res.json({ root, nodes: downline.rows });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getTeamTree };
