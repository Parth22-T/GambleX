const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');
const { User, Game, GameStats, Promotion } = require('../models');
const bcrypt = require('bcryptjs');

// Function to initialize the database
async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Sync all models with the database
    await sequelize.sync({ alter: true });
    console.log('Database schema synchronized');
    
    // Check if admin user exists
    const adminExists = await User.findOne({
      where: { username: 'admin' }
    });
    
    // Create admin user if it doesn't exist
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        balance: 10000.00,
        isAdmin: true
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    // Initialize game types
    const gameTypes = [
      { name: 'Roulette', type: 'roulette', minBet: 1.00, maxBet: 1000.00 },
      { name: 'Slot Machine', type: 'slots', minBet: 1.00, maxBet: 500.00 },
      { name: 'Sports Betting', type: 'sports', minBet: 5.00, maxBet: 2000.00 },
      { name: 'Plinko', type: 'plinko', minBet: 1.00, maxBet: 500.00 },
      { name: 'Mines', type: 'mines', minBet: 1.00, maxBet: 500.00 }
    ];
    
    for (const gameType of gameTypes) {
      const [game, created] = await Game.findOrCreate({
        where: { type: gameType.type },
        defaults: {
          name: gameType.name,
          minBet: gameType.minBet,
          maxBet: gameType.maxBet,
          isActive: true
        }
      });
      
      if (created) {
        console.log(`Game type '${gameType.name}' created`);
        
        // Create game stats for new game
        await GameStats.create({
          gameID: game.gameID,
          totalBets: 0,
          totalWins: 0,
          totalLosses: 0,
          totalWagered: 0.00,
          totalPaidOut: 0.00,
          winRate: 0.00
        });
        console.log(`Game stats for '${gameType.name}' initialized`);
      } else {
        console.log(`Game type '${gameType.name}' already exists`);
        
        // Check if game stats exist
        const statsExist = await GameStats.findOne({
          where: { gameID: game.gameID }
        });
        
        if (!statsExist) {
          await GameStats.create({
            gameID: game.gameID,
            totalBets: 0,
            totalWins: 0,
            totalLosses: 0,
            totalWagered: 0.00,
            totalPaidOut: 0.00,
            winRate: 0.00
          });
          console.log(`Game stats for '${gameType.name}' initialized`);
        }
      }
    }
    
    // Initialize promotions
    const promotions = [
      {
        code: 'WELCOME100',
        name: 'Welcome Bonus',
        description: '100% bonus on your first deposit',
        type: 'deposit_bonus',
        value: 100.00,
        minDeposit: 10.00,
        maxReward: 500.00,
        wagerRequirement: 20,
        isActive: true
      },
      {
        code: 'FREESPINS50',
        name: 'Free Spins',
        description: '50 free spins on slot games',
        type: 'free_spins',
        value: 50.00,
        minDeposit: 0.00,
        maxReward: 100.00,
        wagerRequirement: 10,
        isActive: true
      }
    ];
    
    for (const promo of promotions) {
      const [promotion, created] = await Promotion.findOrCreate({
        where: { code: promo.code },
        defaults: {
          name: promo.name,
          description: promo.description,
          type: promo.type,
          value: promo.value,
          minDeposit: promo.minDeposit,
          maxReward: promo.maxReward,
          wagerRequirement: promo.wagerRequirement,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          isActive: promo.isActive
        }
      });
      
      if (created) {
        console.log(`Promotion '${promo.name}' created`);
      } else {
        console.log(`Promotion '${promo.name}' already exists`);
      }
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Run the initialization
initializeDatabase();
