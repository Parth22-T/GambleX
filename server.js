const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import database connection and models
const { sequelize, syncDatabase } = require('./models/index');

// Import route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const betRoutes = require('./routes/bets');
const adminRoutes = require('./routes/admin');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'index.html'));
  });
}

// Connect to MySQL database
sequelize.authenticate()
  .then(() => {
    console.log('MySQL Database Connected');
    return syncDatabase();
  })
  .then(() => {
    console.log('Database models synchronized');
  })
  .catch(err => console.error('MySQL Connection Error:', err));

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
