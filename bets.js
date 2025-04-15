const express = require('express');
const { getBets, createBet } = require('../controllers/bets');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getBets)
  .post(createBet);

module.exports = router;
