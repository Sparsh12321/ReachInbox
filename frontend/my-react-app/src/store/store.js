import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import emailReducer from './slices/emailSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';
import accountsReducer from './slices/accountsSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    email: emailReducer,
    userPreferences: userPreferencesReducer,
    accounts: accountsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

