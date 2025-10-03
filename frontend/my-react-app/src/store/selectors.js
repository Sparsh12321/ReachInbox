// UI Selectors
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectTheme = (state) => state.ui.theme;
export const selectShowNotifications = (state) => state.ui.showNotifications;
export const selectShowSettings = (state) => state.ui.showSettings;

// Email Selectors
export const selectSelectedEmailIndex = (state) => state.email.selectedEmailIndex;
export const selectSelectedCategory = (state) => state.email.selectedCategory;
export const selectSearchQuery = (state) => state.email.searchQuery;
export const selectSortBy = (state) => state.email.sortBy;
export const selectSortOrder = (state) => state.email.sortOrder;
export const selectViewMode = (state) => state.email.viewMode;

// User Preferences Selectors
export const selectEmailsPerPage = (state) => state.userPreferences.emailsPerPage;
export const selectAutoRefresh = (state) => state.userPreferences.autoRefresh;
export const selectRefreshInterval = (state) => state.userPreferences.refreshInterval;
export const selectShowEmailPreview = (state) => state.userPreferences.showEmailPreview;
export const selectCompactView = (state) => state.userPreferences.compactView;
export const selectMarkAsReadOnOpen = (state) => state.userPreferences.markAsReadOnOpen;
export const selectLanguage = (state) => state.userPreferences.language;
export const selectNotificationSettings = (state) => state.userPreferences.notifications;

// Combined selectors
export const selectEmailState = (state) => state.email;
export const selectUIState = (state) => state.ui;
export const selectUserPreferences = (state) => state.userPreferences;

