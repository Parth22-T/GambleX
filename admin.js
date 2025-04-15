const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    getDashboardStats, 
    getUsers, 
    getTransactions, 
    getGameStats, 
    getSettings, 
    saveSettings, 
    deleteUser, 
    deleteTransaction,
    getMySQLStatus,
    getCDNStatus,
    getServerStatus
} = require('../controllers/admin');

// Add admin middleware
const adminOnly = require('../middleware/admin');

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(adminOnly);

// Dashboard routes
router.get('/dashboard', getDashboardStats);

// User management routes
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

// Transaction management routes
router.get('/transactions', getTransactions);
router.delete('/transactions/:id', deleteTransaction);

// Game stats routes
router.get('/games/stats', getGameStats);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings/:type', saveSettings);

// Status routes
router.get('/mysql/status', getMySQLStatus);
router.get('/cdn/status', getCDNStatus);
router.get('/server/status', getServerStatus);

module.exports = router;
