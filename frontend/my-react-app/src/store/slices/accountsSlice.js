import { createSlice } from '@reduxjs/toolkit';

// Load active account ID from localStorage
const loadActiveAccountId = () => {
  try {
    return localStorage.getItem('authToken') || null;
  } catch (error) {
    console.error('Failed to load active account ID:', error);
    return null;
  }
};

const initialState = {
  accounts: [],
  activeAccountId: loadActiveAccountId(),
  isLoading: false,
  error: null,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccounts: (state, action) => {
      state.accounts = action.payload.map(account => ({
        ...account,
        isActive: account.id === state.activeAccountId,
      }));
      state.isLoading = false;
    },
    setActiveAccount: (state, action) => {
      const accountId = action.payload;
      state.accounts = state.accounts.map(account => ({
        ...account,
        isActive: account.id === accountId,
      }));
      state.activeAccountId = accountId;
      localStorage.setItem('authToken', accountId);
    },
    addAccountToList: (state, action) => {
      const newAccount = {
        ...action.payload,
        isActive: false,
      };
      // Check if account already exists
      const exists = state.accounts.find(acc => acc.id === newAccount.id);
      if (!exists) {
        state.accounts.push(newAccount);
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setAccounts, 
  setActiveAccount, 
  addAccountToList, 
  setLoading, 
  setError, 
  clearError 
} = accountsSlice.actions;

// Selectors
export const selectAllAccounts = (state) => state.accounts.accounts;
export const selectActiveAccount = (state) => 
  state.accounts.accounts.find(acc => acc.id === state.accounts.activeAccountId);
export const selectActiveAccountId = (state) => state.accounts.activeAccountId;
export const selectAccountsLoading = (state) => state.accounts.isLoading;
export const selectAccountsError = (state) => state.accounts.error;

export default accountsSlice.reducer;

