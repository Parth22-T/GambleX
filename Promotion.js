const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  promotionID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('deposit_bonus', 'free_spins', 'cashback', 'loyalty'),
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  minDeposit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  maxReward: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  wagerRequirement: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['code'], unique: true },
    { fields: ['isActive'] },
    { fields: ['endDate'] }
  ]
});

module.exports = Promotion;
