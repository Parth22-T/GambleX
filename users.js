const express = require('express');
const { getBalance, updateBalance } = require('../controllers/users');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/balance')
  .get(getBalance)
  .put(updateBalance);

module.exports = router;
