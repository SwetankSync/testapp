const express = require('express');
const { distribute } = require('../controllers/calculationController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.post('/distribute', requireAuth, requireRole('ADMIN'), distribute);

module.exports = router;
