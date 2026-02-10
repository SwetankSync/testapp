const express = require('express');
const { getDownline, getFullTree, getTreeStats } = require('../controllers/treeController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
router.get('/downline', requireRole('MEMBER', 'ADMIN'), getDownline);
router.get('/full', requireRole('ADMIN'), getFullTree);
router.get('/stats', requireRole('ADMIN'), getTreeStats);

module.exports = router;
