const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  transactionID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'userID'
    }
  },
  type: {
    type: DataTypes.ENUM('Deposit', 'Withdraw', 'Win', 'Bet'),
    allowNull: false
  },
  game: {
    type: DataTypes.STRING,
    allowNull: true
  },
  details: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
    defaultValue: 'Completed'
  },
  paymentMethodID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'PaymentMethods',
      key: 'paymentMethodID'
    }
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userID'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['date'] }
  ]
});

module.exports = Transaction;
