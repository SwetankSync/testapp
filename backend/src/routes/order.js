const express = require('express');
const { submitOrder } = require('../controllers/orderController');

const router = express.Router();
router.post('/submit', submitOrder);

module.exports = router;
