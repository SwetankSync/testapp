const express = require('express');
const { runMonthlyHold } = require('../controllers/maintenanceController');

const router = express.Router();
router.post('/hold/run', runMonthlyHold);

module.exports = router;
