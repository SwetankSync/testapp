const express = require('express');
const { listPendingOrders, approveOrder } = require('../controllers/adminApprovalController');

const router = express.Router();
router.get('/orders/pending', listPendingOrders);
router.post('/orders/approve', approveOrder);
router.post('/orders/:paymentRequestId/approve', approveOrder);

module.exports = router;
