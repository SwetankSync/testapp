const express = require('express');
const { listExpenses, createExpense } = require('../controllers/reportController');

const router = express.Router();
router.get('/expenses', listExpenses);
router.post('/expenses', createExpense);

module.exports = router;
