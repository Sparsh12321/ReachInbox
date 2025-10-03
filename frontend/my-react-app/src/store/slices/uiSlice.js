import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapsed: false,
  theme: 'light',
  showNotifications: false,
  showSettings: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleNotifications: (state) => {
      state.showNotifications = !state.showNotifications;
    },
    toggleSettings: (state) => {
      state.showSettings = !state.showSettings;
    },
    closeAllModals: (state) => {
      state.showNotifications = false;
      state.showSettings = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  toggleNotifications,
  toggleSettings,
  closeAllModals,
} = uiSlice.actions;

export default uiSlice.reducer;

