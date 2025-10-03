import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// API functions for emails
export const emailsApi = {
  // Search emails with query
  searchEmails: async (query) => {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: { q: query }
    });
    return response.data.emails || [];
  },

  // Get all emails (search with wildcard)
  getAllEmails: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emails/search`, {
        params: { q: '*' }
      });
      return response.data.emails || [];
    } catch (error) {
      // If wildcard search fails, try empty query
      console.warn('Wildcard search failed, trying alternative...');
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { q: 'from:*' }
      });
      return response.data.emails || [];
    }
  },

  // Trigger backend email sync (syncs IMAP and updates classifiers)
  triggerRefresh: async (accountId) => {
    const response = await axios.post(`${API_BASE_URL}/emails/refresh`, { accountId });
    return response.data;
  },
};

