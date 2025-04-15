const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GameStats = sequelize.define('GameStats', {
  statID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  gameID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Games',
      key: 'gameID'
    },
    unique: true
  },
  totalBets: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalWins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalLosses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalWagered: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  totalPaidOut: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  winRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['gameID'], unique: true }
  ]
});

module.exports = GameStats;
