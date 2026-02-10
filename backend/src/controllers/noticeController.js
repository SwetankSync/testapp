const db = require('../db');

async function listNotices(_req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, title, body, is_published, published_at, created_at
       FROM notices
       WHERE is_published = TRUE
       ORDER BY COALESCE(published_at, created_at) DESC`,
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function adminListNotices(_req, res, next) {
  try {
    const result = await db.query('SELECT * FROM notices ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function createNotice(req, res, next) {
  const { title, body, isPublished = true } = req.body;
  if (!title || !body) return res.status(400).json({ message: 'title and body are required' });

  try {
    const result = await db.query(
      `INSERT INTO notices (title, body, is_published, published_at, created_by)
       VALUES ($1, $2, $3, CASE WHEN $3 THEN NOW() ELSE NULL END, $4)
       RETURNING id, title, body, is_published, published_at, created_at`,
      [title, body, Boolean(isPublished), req.user.id],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function updateNotice(req, res, next) {
  const { noticeId } = req.params;
  const { title, body, isPublished } = req.body;

  try {
    const result = await db.query(
      `UPDATE notices
       SET title = COALESCE($2, title),
           body = COALESCE($3, body),
           is_published = COALESCE($4, is_published),
           published_at = CASE WHEN COALESCE($4, is_published) THEN COALESCE(published_at, NOW()) ELSE NULL END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, body, is_published, published_at, updated_at`,
      [noticeId, title || null, body || null, typeof isPublished === 'boolean' ? isPublished : null],
    );

    if (!result.rowCount) return res.status(404).json({ message: 'Notice not found' });
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listNotices,
  adminListNotices,
  createNotice,
  updateNotice,
};
