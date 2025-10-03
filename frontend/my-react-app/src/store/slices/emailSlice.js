import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedEmailIndex: null,
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'date', // 'date', 'sender', 'subject'
  sortOrder: 'desc', // 'asc', 'desc'
  viewMode: 'list', // 'list', 'compact', 'card'
};

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    setSelectedEmail: (state, action) => {
      state.selectedEmailIndex = action.payload;
    },
    clearSelectedEmail: (state) => {
      state.selectedEmailIndex = null;
    },
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.selectedEmailIndex = null; // Clear selection when changing category
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    resetEmailState: (state) => {
      return initialState;
    },
  },
});

export const {
  setSelectedEmail,
  clearSelectedEmail,
  setCategory,
  setSearchQuery,
  clearSearch,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  setViewMode,
  resetEmailState,
} = emailSlice.actions;

export default emailSlice.reducer;

