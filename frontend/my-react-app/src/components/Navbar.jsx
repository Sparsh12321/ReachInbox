import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { toggleSidebar, toggleNotifications, toggleSettings } from '../store/slices/uiSlice';
import { selectActiveAccount } from '../store/slices/accountsSlice';
import AccountSwitcher from './AccountSwitcher';

function Navbar({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { logout, user } = useAuth();
  
  // Redux state
  const { sidebarCollapsed, showNotifications, showSettings } = useSelector(
    (state) => state.ui
  );
  const activeAccount = useSelector(selectActiveAccount);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className="menu-btn" 
          title="Menu"
          onClick={() => dispatch(toggleSidebar())}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="logo-text">ReachInbox</span>
        </div>
      </div>

      <div className="navbar-center">
        <form className="search-container" onSubmit={handleSearch}>
          <button type="submit" className="search-icon" title="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search in mail..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="navbar-right">
        <button 
          className={`icon-btn ${showNotifications ? 'active' : ''}`}
          title="Notifications"
          onClick={() => dispatch(toggleNotifications())}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <button 
          className={`icon-btn ${showSettings ? 'active' : ''}`}
          title="Settings"
          onClick={() => dispatch(toggleSettings())}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-6.364 0L3.636 17.364M20.364 3.636l-4.243 4.243m-6.364 6.364L3.636 3.636"></path>
          </svg>
        </button>
        <button className="icon-btn" title="Help">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
        <button className="icon-btn" title="Logout" onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
        <div className="user-avatar-container">
          <div 
            className={`user-avatar ${showAccountSwitcher ? 'active' : ''}`}
            title={activeAccount?.email || user?.email || 'User'}
            onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
          >
            {activeAccount?.avatar || activeAccount?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <AccountSwitcher 
            isOpen={showAccountSwitcher}
            onClose={() => setShowAccountSwitcher(false)}
          />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
