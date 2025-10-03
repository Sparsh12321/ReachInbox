import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// API functions for account management
export const accountsApi = {
  // Get all accounts
  getAllAccounts: async () => {
    const response = await axios.get(`${API_BASE_URL}/accounts`);
    return response.data.accounts.map(account => ({
      id: account._id,
      name: account.imap_user.split('@')[0],
      email: account.imap_user,
      avatar: account.imap_user.charAt(0).toUpperCase(),
      isActive: false,
    }));
  },

  // Switch to a different account
  switchAccount: async (accountId) => {
    const response = await axios.post(`${API_BASE_URL}/switch-account`, {
      accountId
    });
    return {
      account: response.data.account,
      message: response.data.message
    };
  },

  // Add new account (same as login)
  addAccount: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      imap_user: credentials.email,
      imap_pass: credentials.password
    });
    
    return {
      id: response.data.account._id,
      name: credentials.email.split('@')[0],
      email: credentials.email,
      avatar: credentials.email.charAt(0).toUpperCase(),
      isActive: false,
    };
  }
};

