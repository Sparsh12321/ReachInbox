import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// API functions for authentication
export const authApi = {
  // Login user with IMAP credentials
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      imap_user: credentials.email,
      imap_pass: credentials.password
    });
    
    return {
      user: {
        id: response.data.account._id,
        email: response.data.account.imap_user,
        name: response.data.account.imap_user.split('@')[0],
      },
      token: response.data.account._id,
      account: response.data.account
    };
  },

  // Register user (same as login for IMAP)
  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      imap_user: userData.email,
      imap_pass: userData.password
    });
    
    return {
      user: {
        id: response.data.account._id,
        email: response.data.account.imap_user,
        name: userData.fullName || response.data.account.imap_user.split('@')[0],
      },
      token: response.data.account._id,
      account: response.data.account
    };
  },

  // Get current user from stored account
  getCurrentUser: async () => {
    const accountId = localStorage.getItem('authToken');
    if (!accountId) {
      throw new Error('No account ID found');
    }

    const accountsResponse = await axios.get(`${API_BASE_URL}/accounts`);
    const account = accountsResponse.data.accounts.find(acc => acc._id === accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }

    return {
      id: account._id,
      email: account.imap_user,
      name: account.imap_user.split('@')[0]
    };
  },

  // Logout
  logout: async () => {
    localStorage.removeItem('authToken');
    return true;
  }
};

