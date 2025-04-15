const express = require('express');
const { register, login, googleAuth, getMe, logout } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router;
