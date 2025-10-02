import React from 'react';

function Sidebar({ selectedCategory, onCategoryChange, emails }) {
  // Calculate counts for each label
  const getLabelCount = (label) => {
    return emails.filter(email => email.label === label).length;
  };

  const menuItems = [
    { 
      id: 'all', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
        </svg>
      ), 
      label: 'All Emails',
      count: emails.length
    },
  ];

  const labelItems = [
    { 
      id: 'Interested', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ), 
      label: 'Interested',
      count: getLabelCount('Interested')
    },
    { 
      id: 'Meeting Booked', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ), 
      label: 'Meeting Booked',
      count: getLabelCount('Meeting Booked')
    },
    { 
      id: 'Not Interested', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      ), 
      label: 'Not Interested',
      count: getLabelCount('Not Interested')
    },
    { 
      id: 'Spam', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      ), 
      label: 'Spam',
      count: getLabelCount('Spam')
    },
    { 
      id: 'Out of Office', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ), 
      label: 'Out of Office',
      count: getLabelCount('Out of Office')
    },
    { 
      id: 'Unclassified', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      ), 
      label: 'Unclassified',
      count: getLabelCount('Unclassified')
    },
  ];

  return (
    <div className="sidebar">
      <button className="compose-btn">
        <span className="compose-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </span>
        Compose
      </button>

      <div className="sidebar-section">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-item ${selectedCategory === item.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
            {item.count !== undefined && <span className="sidebar-count">{item.count}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-divider"></div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Labels</div>
        {labelItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-item ${selectedCategory === item.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
            {item.count > 0 && <span className="sidebar-count">{item.count}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
