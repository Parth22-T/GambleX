// gameUtils.js - Standardized utilities for game transactions and bets
const GameUtils = {
  // Place a bet and record it in the database
  placeBet: async function(betData) {
    const token = localStorage.getItem('gx_token');
    if (!token) {
      console.error('User not logged in');
      return { success: false, error: 'User not logged in' };
    }

    try {
      // First create the transaction for the bet amount
      const transactionResponse = await API.Transaction.createTransaction({ 
        type: 'Bet', 
        amount: betData.amount, 
        game: betData.game,
        details: `Bet on ${betData.game}`
      }, token);

      // Store transaction ID for later use
      const transactionID = transactionResponse.data.transactionID;
      
      // Update UI balance immediately after transaction
      await API.Balance.updateBalance();
      
      return { 
        success: true, 
        transaction: transactionResponse.data,
        transactionID: transactionID
      };
    } catch (error) {
      console.error(`Error placing bet for ${betData.game}:`, error);
      return { success: false, error: error.message || 'Failed to place bet' };
    }
  },

  // Record a completed bet (win or loss) in the database
  recordBet: async function(betData, transactionID = null) {
    const token = localStorage.getItem('gx_token');
    if (!token) {
      console.error('User not logged in');
      return { success: false, error: 'User not logged in' };
    }

    try {
      // Create the bet record in the database with transaction ID if available
      let betResponse;
      if (transactionID) {
        betResponse = await API.Bet.createBetWithTransaction(betData, transactionID, token);
      } else {
        betResponse = await API.Bet.createBet(betData, token);
      }
      
      // If it's a win, create a Win transaction
      if (betData.status === 'Won' && betData.winAmount > 0) {
        // Link the win transaction to the bet if possible
        await API.Transaction.createBetTransaction({ 
          type: 'Win', 
          amount: betData.winAmount, 
          game: betData.game,
          details: `Won on ${betData.game}`
        }, betResponse.data.betID, token);
      }
      
      // Update UI balance
      await API.Balance.updateBalance();
      
      return { 
        success: true, 
        bet: betResponse.data
      };
    } catch (error) {
      console.error(`Error recording bet for ${betData.game}:`, error);
      return { success: false, error: error.message || 'Failed to record bet' };
    }
  },

  // Get user balance from server
  getBalance: async function() {
    const token = localStorage.getItem('gx_token');
    if (!token) return 0;
    
    try {
      const response = await API.User.getBalance(token);
      return response.data.balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  },

  // Update all balance displays on the page
  updateBalanceDisplay: async function() {
    return await API.Balance.updateBalance();
  }
};

// For easy access in the browser
window.GameUtils = GameUtils;
