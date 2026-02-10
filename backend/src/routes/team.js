const express = require('express');
const { getTeamTree } = require('../controllers/teamController');

const router = express.Router();
router.get('/tree', getTeamTree);

module.exports = router;
