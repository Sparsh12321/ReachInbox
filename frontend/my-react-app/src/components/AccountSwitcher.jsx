import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAllAccounts, selectActiveAccount } from '../store/slices/accountsSlice';
import { useAccounts } from '../hooks/useAccounts';
import './AccountSwitcher.css';

function AccountSwitcher({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const accounts = useSelector(selectAllAccounts);
  const activeAccount = useSelector(selectActiveAccount);
  const { switchAccount, isSwitching, refetch } = useAccounts();

  // Refresh accounts when dropdown opens
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSwitchAccount = async (accountId) => {
    if (accountId === activeAccount?.id) {
      onClose();
      return;
    }

    try {
      await switchAccount(accountId);
      onClose();
    } catch (error) {
      console.error('Failed to switch account:', error);
    }
  };

  const handleAddAccount = () => {
    onClose();
    // Add query parameter to indicate we're adding a new account
    navigate('/login?addAccount=true');
  };

  if (!isOpen) return null;

  return (
    <div className="account-switcher-dropdown" ref={dropdownRef}>
      {/* Current Account Section */}
      <div className="account-section">
        <div className="section-label">Current Account</div>
        {activeAccount && (
          <div className="account-item current">
            <div className="account-avatar active">
              {activeAccount.avatar || activeAccount.name?.charAt(0).toUpperCase()}
            </div>
            <div className="account-info">
              <div className="account-name">{activeAccount.name}</div>
              <div className="account-email">{activeAccount.email}</div>
            </div>
            <div className="active-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="dropdown-divider"></div>

      {/* All Accounts Section */}
      <div className="account-section">
        <div className="section-label">All Accounts ({accounts.length})</div>
        {isSwitching && (
          <div style={{ 
            padding: '8px 12px', 
            fontSize: '12px', 
            color: 'var(--text-secondary)',
            textAlign: 'center' 
          }}>
            Switching account...
          </div>
        )}
        <div className="accounts-list">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`account-item ${account.id === activeAccount?.id ? 'active' : ''}`}
              onClick={() => handleSwitchAccount(account.id)}
            >
              <div className="account-avatar">
                {account.avatar || account.name?.charAt(0).toUpperCase()}
              </div>
              <div className="account-info">
                <div className="account-name">{account.name}</div>
                <div className="account-email">{account.email}</div>
              </div>
              {account.id === activeAccount?.id && (
                <div className="active-indicator">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="4"></circle>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="dropdown-divider"></div>

      {/* Add Account Button */}
      <div className="account-section">
        <button className="add-account-btn" onClick={handleAddAccount}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span>Add Account</span>
        </button>
      </div>
    </div>
  );
}

export default AccountSwitcher;

