const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { listNotices, adminListNotices, createNotice, updateNotice } = require('../controllers/noticeController');

const router = express.Router();

router.get('/', listNotices);
router.get('/admin', requireAuth, requireRole('ADMIN'), adminListNotices);
router.post('/admin', requireAuth, requireRole('ADMIN'), createNotice);
router.patch('/admin/:noticeId', requireAuth, requireRole('ADMIN'), updateNotice);

module.exports = router;
