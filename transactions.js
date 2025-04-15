const express = require('express');
const { getTransactions, createTransaction } = require('../controllers/transactions');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

module.exports = router;
