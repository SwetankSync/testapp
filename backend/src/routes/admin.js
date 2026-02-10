const express = require('express');
const { listPendingOrders, approveOrder, rejectOrder } = require('../controllers/adminApprovalController');

const router = express.Router();
router.get('/orders/pending', listPendingOrders);
router.post('/orders/approve', approveOrder);
router.post('/orders/reject', rejectOrder);
router.post('/orders/:paymentRequestId/approve', approveOrder);
router.post('/orders/:paymentRequestId/reject', rejectOrder);

module.exports = router;
