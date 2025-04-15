const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserPromotion = sequelize.define('UserPromotion', {
  userPromotionID: {
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
  promotionID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Promotions',
      key: 'promotionID'
    }
  },
  redeemedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'expired'),
    defaultValue: 'active'
  },
  bonusBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  wagerProgress: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userID'] },
    { fields: ['promotionID'] },
    { fields: ['status'] },
    { fields: ['userID', 'promotionID'], unique: true }
  ]
});

module.exports = UserPromotion;
