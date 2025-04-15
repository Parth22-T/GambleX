const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bet = sequelize.define('Bet', {
  betID: {
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
  gameID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Games',
      key: 'gameID'
    }
  },
  transactionID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Transactions',
      key: 'transactionID'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  // For roulette
  betOn: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // For slot machine
  result: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // For sports betting
  match: {
    type: DataTypes.STRING,
    allowNull: true
  },
  selection: {
    type: DataTypes.STRING,
    allowNull: true
  },
  odds: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  // For plinko
  riskLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: true
  },
  balls: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // For mines
  mines: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gemsFound: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Common fields
  multiplier: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  outcome: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Won', 'Lost', 'Pending'),
    allowNull: false
  },
  winAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userID'] },
    { fields: ['gameID'] },
    { fields: ['status'] },
    { fields: ['date'] },
    { fields: ['transactionID'] }
  ]
});

module.exports = Bet;
