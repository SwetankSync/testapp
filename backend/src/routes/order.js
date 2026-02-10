const express = require('express');
const { submitOrder, myOrders } = require('../controllers/orderController');

const router = express.Router();
router.post('/submit', submitOrder);
router.post('/create', submitOrder);
router.post('/upload', submitOrder);
router.get('/my', myOrders);

module.exports = router;
