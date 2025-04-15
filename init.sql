-- Create the casino database if it doesn't exist
CREATE DATABASE IF NOT EXISTS casino_db;
USE casino_db;

-- Create User table
CREATE TABLE IF NOT EXISTS Users (
  userID INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  isGoogleUser BOOLEAN DEFAULT FALSE,
  isAdmin BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Game table
CREATE TABLE IF NOT EXISTS Games (
  gameID INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('slots', 'roulette', 'blackjack', 'poker', 'baccarat', 'sports', 'plinko', 'mines') NOT NULL,
  provider VARCHAR(100),
  description TEXT,
  minBet DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  maxBet DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
  rtp DECIMAL(5, 2),
  volatility ENUM('low', 'medium', 'high'),
  imageURL VARCHAR(255),
  isActive BOOLEAN DEFAULT TRUE,
  launchDate TIMESTAMP,
  lastPlayed TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_provider (provider),
  INDEX idx_isActive (isActive)
);

-- Create GameStats table
CREATE TABLE IF NOT EXISTS GameStats (
  statID INT AUTO_INCREMENT PRIMARY KEY,
  gameID INT NOT NULL UNIQUE,
  totalBets INT DEFAULT 0,
  totalWins INT DEFAULT 0,
  totalLosses INT DEFAULT 0,
  totalWagered DECIMAL(15, 2) DEFAULT 0.00,
  totalPaidOut DECIMAL(15, 2) DEFAULT 0.00,
  winRate DECIMAL(5, 2) DEFAULT 0.00,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gameID) REFERENCES Games(gameID) ON DELETE CASCADE,
  INDEX idx_gameID (gameID)
);

-- Create PaymentMethod table
CREATE TABLE IF NOT EXISTS PaymentMethods (
  paymentMethodID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  type ENUM('credit_card', 'debit_card', 'e-wallet', 'bank_transfer', 'crypto') NOT NULL,
  provider VARCHAR(100),
  accountNumber VARCHAR(255),
  holderName VARCHAR(100),
  expiryDate DATE,
  isDefault BOOLEAN DEFAULT FALSE,
  isVerified BOOLEAN DEFAULT FALSE,
  addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastUsed TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
  INDEX idx_userID (userID),
  INDEX idx_type (type),
  INDEX idx_isDefault (isDefault)
);

-- Create Transaction table
CREATE TABLE IF NOT EXISTS Transactions (
  transactionID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  type ENUM('Deposit', 'Withdraw') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Completed',
  paymentMethodID INT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
  FOREIGN KEY (paymentMethodID) REFERENCES PaymentMethods(paymentMethodID) ON DELETE SET NULL,
  INDEX idx_userID (userID),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_date (date)
);

-- Create Bet table
CREATE TABLE IF NOT EXISTS Bets (
  betID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  gameID INT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  betOn VARCHAR(100),
  result VARCHAR(100),
  match VARCHAR(100),
  selection VARCHAR(100),
  odds DECIMAL(10, 2),
  riskLevel ENUM('low', 'medium', 'high'),
  balls INT,
  mines INT,
  gemsFound INT,
  multiplier DECIMAL(10, 2),
  outcome VARCHAR(100),
  status ENUM('Won', 'Lost', 'Pending') NOT NULL,
  winAmount DECIMAL(15, 2),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
  FOREIGN KEY (gameID) REFERENCES Games(gameID) ON DELETE CASCADE,
  INDEX idx_userID (userID),
  INDEX idx_gameID (gameID),
  INDEX idx_status (status),
  INDEX idx_date (date)
);

-- Create Promotion table
CREATE TABLE IF NOT EXISTS Promotions (
  promotionID INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type ENUM('deposit_bonus', 'free_spins', 'cashback', 'loyalty') NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  minDeposit DECIMAL(10, 2) DEFAULT 0.00,
  maxReward DECIMAL(12, 2),
  wagerRequirement INT DEFAULT 0,
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_isActive (isActive),
  INDEX idx_endDate (endDate)
);

-- Create UserPromotion table
CREATE TABLE IF NOT EXISTS UserPromotions (
  userPromotionID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  promotionID INT NOT NULL,
  redeemedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP,
  status ENUM('active', 'completed', 'expired') DEFAULT 'active',
  bonusBalance DECIMAL(10, 2) DEFAULT 0.00,
  wagerProgress DECIMAL(10, 2) DEFAULT 0.00,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
  FOREIGN KEY (promotionID) REFERENCES Promotions(promotionID) ON DELETE CASCADE,
  UNIQUE KEY unique_user_promotion (userID, promotionID),
  INDEX idx_userID (userID),
  INDEX idx_promotionID (promotionID),
  INDEX idx_status (status)
);

-- Insert default admin user (password: admin123)
INSERT INTO Users (username, email, password, balance, isAdmin, createdAt, updatedAt)
VALUES ('admin', 'admin@example.com', '$2a$10$rrCvVFKBHHCv5K1hLJ7OXO8VRS.F.NZ3h.UGUfP.7YXoHT/xnUPfS', 10000.00, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE username = 'admin';

-- Insert initial game types
INSERT INTO Games (name, type, minBet, maxBet, isActive, createdAt, updatedAt)
VALUES 
('Roulette', 'roulette', 1.00, 1000.00, TRUE, NOW(), NOW()),
('Slot Machine', 'slots', 1.00, 500.00, TRUE, NOW(), NOW()),
('Sports Betting', 'sports', 5.00, 2000.00, TRUE, NOW(), NOW()),
('Plinko', 'plinko', 1.00, 500.00, TRUE, NOW(), NOW()),
('Mines', 'mines', 1.00, 500.00, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Initialize game stats for each game
INSERT INTO GameStats (gameID, totalBets, totalWins, totalLosses, totalWagered, totalPaidOut, winRate, lastUpdated, createdAt, updatedAt)
SELECT gameID, 0, 0, 0, 0.00, 0.00, 0.00, NOW(), NOW(), NOW()
FROM Games
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Insert sample promotions
INSERT INTO Promotions (code, name, description, type, value, minDeposit, maxReward, wagerRequirement, startDate, endDate, isActive, createdAt, updatedAt)
VALUES 
('WELCOME100', 'Welcome Bonus', '100% bonus on your first deposit', 'deposit_bonus', 100.00, 10.00, 500.00, 20, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE, NOW(), NOW()),
('FREESPINS50', 'Free Spins', '50 free spins on slot games', 'free_spins', 50.00, 0.00, 100.00, 10, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();
