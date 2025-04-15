const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Game = sequelize.define('Game', {
  gameID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('slots', 'roulette', 'blackjack', 'poker', 'baccarat', 'sports', 'plinko', 'mines'),
    allowNull: false
  },
  provider: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  minBet: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1.00
  },
  maxBet: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1000.00
  },
  rtp: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  volatility: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: true
  },
  imageURL: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  launchDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastPlayed: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['type'] },
    { fields: ['provider'] },
    { fields: ['isActive'] }
  ]
});

module.exports = Game;
