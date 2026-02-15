const express = require('express');
const { getBalances, getHistory, withdraw } = require('../controllers/walletController');
const { checkHoldStatus } = require('../middleware/checkHoldStatus');

const router = express.Router();
router.get('/balances', getBalances);
router.get('/history', getHistory);
router.post('/withdraw', checkHoldStatus, withdraw);

module.exports = router;
