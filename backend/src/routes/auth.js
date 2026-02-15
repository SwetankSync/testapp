const express = require('express');
const { register, login, validateSponsor, forgotPassword } = require('../controllers/authController');

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/validate-sponsor/:id', validateSponsor);
router.post('/forgot-password', forgotPassword);

module.exports = router;
