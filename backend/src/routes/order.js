const express = require('express');
const { submitOrder, myOrders } = require('../controllers/orderController');

const router = express.Router();
router.post('/submit', submitOrder);
router.get('/my', myOrders);

module.exports = router;
