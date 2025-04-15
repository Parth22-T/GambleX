const { sequelize } = require('../config/database');
const User = require('./User');
const Transaction = require('./Transaction');
const Bet = require('./Bet');
const Game = require('./Game');
const GameStats = require('./GameStats');
const Promotion = require('./Promotion');
const UserPromotion = require('./UserPromotion');
const PaymentMethod = require('./PaymentMethod');

// Define associations
User.hasMany(Transaction, { foreignKey: 'userID' });
Transaction.belongsTo(User, { foreignKey: 'userID' });

User.hasMany(Bet, { foreignKey: 'userID' });
Bet.belongsTo(User, { foreignKey: 'userID' });

User.hasMany(PaymentMethod, { foreignKey: 'userID' });
PaymentMethod.belongsTo(User, { foreignKey: 'userID' });

User.hasMany(UserPromotion, { foreignKey: 'userID' });
UserPromotion.belongsTo(User, { foreignKey: 'userID' });

Promotion.hasMany(UserPromotion, { foreignKey: 'promotionID' });
UserPromotion.belongsTo(Promotion, { foreignKey: 'promotionID' });

Game.hasMany(Bet, { foreignKey: 'gameID' });
Bet.belongsTo(Game, { foreignKey: 'gameID' });

Game.hasOne(GameStats, { foreignKey: 'gameID' });
GameStats.belongsTo(Game, { foreignKey: 'gameID' });

PaymentMethod.hasMany(Transaction, { foreignKey: 'paymentMethodID' });
Transaction.belongsTo(PaymentMethod, { foreignKey: 'paymentMethodID' });

// Add relationship between Transaction and Bet
Transaction.hasMany(Bet, { foreignKey: 'transactionID' });
Bet.belongsTo(Transaction, { foreignKey: 'transactionID' });

// Sync all models with database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
    return true;
  } catch (error) {
    console.error('Error synchronizing models:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  User,
  Transaction,
  Bet,
  Game,
  GameStats,
  Promotion,
  UserPromotion,
  PaymentMethod,
  syncDatabase
};
