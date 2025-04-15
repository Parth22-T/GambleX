// API service for connecting to the backend server
const API_URL = 'http://localhost:5000/api';

// Helper function to handle API requests
async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Add authorization token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers
  };

  // Add body data for non-GET requests
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Something went wrong');
    }

    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API functions
const AuthAPI = {
  // Register a new user
  register: async (userData) => {
    return await apiRequest('/auth/register', 'POST', userData);
  },

  // Login user
  login: async (credentials) => {
    return await apiRequest('/auth/login', 'POST', credentials);
  },

  // Google login/register
  googleAuth: async (googleData) => {
    return await apiRequest('/auth/google', 'POST', googleData);
  },

  // Get current user
  getCurrentUser: async (token) => {
    return await apiRequest('/auth/me', 'GET', null, token);
  },

  // Logout user (client-side only, just for consistency)
  logout: () => {
    localStorage.removeItem('gx_token');
    localStorage.removeItem('gx_user');
  }
};

// User API functions
const UserAPI = {
  // Get user balance
  getBalance: async (token) => {
    return await apiRequest('/users/balance', 'GET', null, token);
  },

  // Update user balance
  updateBalance: async (balanceData, token) => {
    return await apiRequest('/users/balance', 'PUT', balanceData, token);
  }
};

// Transaction API functions
const TransactionAPI = {
  // Get all transactions
  getTransactions: async (token) => {
    return await apiRequest('/transactions', 'GET', null, token);
  },

  // Create new transaction
  createTransaction: async (transactionData, token) => {
    return await apiRequest('/transactions', 'POST', transactionData, token);
  },
  
  // Create a transaction and link it to a bet
  createBetTransaction: async (transactionData, betID, token) => {
    // Add the betID to the transaction data
    const data = { ...transactionData, betID };
    return await apiRequest('/transactions', 'POST', data, token);
  }
};

// Bet API functions
const BetAPI = {
  // Get all bets
  getBets: async (game = null, token) => {
    const endpoint = game ? `/bets?game=${game}` : '/bets';
    return await apiRequest(endpoint, 'GET', null, token);
  },

  // Create new bet
  createBet: async (betData, token) => {
    return await apiRequest('/bets', 'POST', betData, token);
  },
  
  // Create a bet and link it to a transaction
  createBetWithTransaction: async (betData, transactionID, token) => {
    // Add the transactionID to the bet data
    const data = { ...betData, transactionID };
    return await apiRequest('/bets', 'POST', data, token);
  }
};

// Admin API functions
const AdminAPI = {
  // Get dashboard stats
  getDashboardStats: async (token) => {
    return await apiRequest('/admin/dashboard', 'GET', null, token);
  },

  // Get users with pagination
  getUsers: async (token, page = 1, search = '') => {
    const endpoint = `/admin/users?page=${page}${search ? `&search=${search}` : ''}`;
    return await apiRequest(endpoint, 'GET', null, token);
  },

  // Get transactions with pagination
  getTransactions: async (token, page = 1, search = '', type = 'all') => {
    const endpoint = `/admin/transactions?page=${page}${search ? `&search=${search}` : ''}${type !== 'all' ? `&type=${type}` : ''}`;
    return await apiRequest(endpoint, 'GET', null, token);
  },

  // Get game stats
  getGameStats: async (token) => {
    return await apiRequest('/admin/games/stats', 'GET', null, token);
  },

  // Get settings
  getSettings: async (token) => {
    return await apiRequest('/admin/settings', 'GET', null, token);
  },

  // Save settings
  saveSettings: async (token, settingType, settings) => {
    return await apiRequest(`/admin/settings/${settingType}`, 'PUT', settings, token);
  },

  // Delete user
  deleteUser: async (token, userId) => {
    return await apiRequest(`/admin/users/${userId}`, 'DELETE', null, token);
  },

  // Delete transaction
  deleteTransaction: async (token, transactionId) => {
    return await apiRequest(`/admin/transactions/${transactionId}`, 'DELETE', null, token);
  },

  // Get MySQL database status
  getMySQLStatus: async (token) => {
    return await apiRequest('/admin/mysql/status', 'GET', null, token);
  },

  // Get CDN status
  getCDNStatus: async (token) => {
    return await apiRequest('/admin/cdn/status', 'GET', null, token);
  },

  // Get server status
  getServerStatus: async (token) => {
    return await apiRequest('/admin/server/status', 'GET', null, token);
  }
};

// Global balance utility functions
const BalanceUtils = {
  // Update balance across all pages
  updateBalance: async () => {
    const token = localStorage.getItem('gx_token');
    if (!token) return false;
    
    try {
      // Get balance from server
      const response = await UserAPI.getBalance(token);
      
      // Check if response is valid and has balance data
      if (response && response.success && response.data && typeof response.data.balance !== 'undefined') {
        const balance = parseFloat(response.data.balance);
        
        // Update all balance display elements
        const balanceElements = document.querySelectorAll('.balance-display, #user-balance');
        balanceElements.forEach(el => {
          if (el) el.textContent = balance;
        });
        
        // Also update local storage data for games that use it
        const user = JSON.parse(localStorage.getItem('gx_user'));
        if (user && user.username) {
          const key = `gx_data_${user.username}`;
          const userData = JSON.parse(localStorage.getItem(key)) || { balance: 0, transactions: [], bets: [] };
          userData.balance = balance;
          localStorage.setItem(key, JSON.stringify(userData));
        }
        
        console.log('Balance updated successfully:', balance);
        return true;
      } else {
        console.error('Invalid balance data received:', response);
        return false;
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      return false;
    }
  }
};

// Export all API services
const API = {
  Auth: AuthAPI,
  User: UserAPI,
  Transaction: TransactionAPI,
  Bet: BetAPI,
  Admin: AdminAPI,
  Balance: BalanceUtils
};

// For easy access in the browser console during development
window.API = API;
