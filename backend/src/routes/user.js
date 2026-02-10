const express = require('express');
const { getProfile, uploadKyc } = require('../controllers/userController');

const router = express.Router();
router.get('/profile', getProfile);
router.post('/kyc', uploadKyc);

module.exports = router;
