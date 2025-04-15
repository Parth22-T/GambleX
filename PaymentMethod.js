const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PaymentMethod = sequelize.define('PaymentMethod', {
  paymentMethodID: {
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
    type: DataTypes.ENUM('credit_card', 'debit_card', 'e-wallet', 'bank_transfer', 'crypto'),
    allowNull: false
  },
  provider: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  accountNumber: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  holderName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  addedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userID'] },
    { fields: ['type'] },
    { fields: ['isDefault'] }
  ]
});

module.exports = PaymentMethod;
