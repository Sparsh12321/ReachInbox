import { createSlice } from '@reduxjs/toolkit';

// Load preferences from localStorage
const loadPreferences = () => {
  try {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return null;
  }
};

const initialState = loadPreferences() || {
  emailsPerPage: 20,
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  showEmailPreview: true,
  compactView: false,
  markAsReadOnOpen: true,
  language: 'en',
  notifications: {
    desktop: false,
    sound: false,
    newEmail: true,
  },
};

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    setEmailsPerPage: (state, action) => {
      state.emailsPerPage = action.payload;
      localStorage.setItem('userPreferences', JSON.stringify(state));
    },
    setAutoRefresh: (state, action) => {
      state.autoRefresh = action.payload;
      localStorage.setItem('userPreferences', JSON.stringify(state));
    },
    setRefreshInterval: (state, action) => {
      state.refreshInterval = action.payload;
      localStorage.setItem('userPreferences', JSON.stringify(state));
    },
    toggleEmailPreview: (state) => {
      state.showEmailPreview = !state.showEmailPreview;
      localStorage.setItem('userPreferences', JSON.stringify(state));
    },
    toggleCompactView: (state) => {
      state.compactView = !state.compactView;
      localStorage.setItem('userPreferences', JSON.stringify(state));
    },
    setMarkAsReadOnOpen: (state, action) => {
      state.markAsReadOnOpen = action.payload;
      localStorage.setItem('userPreferences', JSON.stringify(state));
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('userPreferences', JSON.stringify(state));
    },
    updateNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
      localStorage.setItem('userPreferences', JSON.stringify(state));
    },
    resetPreferences: (state) => {
      const defaults = {
        emailsPerPage: 20,
        autoRefresh: true,
        refreshInterval: 30000,
        showEmailPreview: true,
        compactView: false,
        markAsReadOnOpen: true,
        language: 'en',
        notifications: {
          desktop: false,
          sound: false,
          newEmail: true,
        },
      };
      localStorage.setItem('userPreferences', JSON.stringify(defaults));
      return defaults;
    },
  },
});

export const {
  setEmailsPerPage,
  setAutoRefresh,
  setRefreshInterval,
  toggleEmailPreview,
  toggleCompactView,
  setMarkAsReadOnOpen,
  setLanguage,
  updateNotificationSettings,
  resetPreferences,
} = userPreferencesSlice.actions;

export default userPreferencesSlice.reducer;

