import React, { useState } from 'react';

function EmailList({ emails, selectedEmail, onSelectEmail, onRefresh }) {
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map((_, idx) => idx));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectEmail = (idx, e) => {
    e.stopPropagation();
    if (selectedEmails.includes(idx)) {
      setSelectedEmails(selectedEmails.filter(i => i !== idx));
    } else {
      setSelectedEmails([...selectedEmails, idx]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Basic HTML -> text sanitization for preview: strip tags, decode common entities, collapse whitespace
  const sanitizePreview = (html) => {
    if (!html) return '';
    let text = html
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&(amp|#38);/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&apos;/gi, "'");
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength).trim() + '…' : text;
  };

  const handleRefreshClick = async () => {
    if (isRefreshing || !onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="email-list">
      <div className="email-list-header">
        <div className="email-list-actions">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="email-checkbox"
          />
          <button 
            className={`action-btn ${isRefreshing ? 'refreshing' : ''}`} 
            title="Refresh" 
            onClick={handleRefreshClick}
            disabled={isRefreshing}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
          <button className="action-btn" title="More">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
        {selectedEmails.length > 0 && (
          <div className="selected-actions">
            <button className="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete
            </button>
            <button className="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Mark as read
            </button>
            <button className="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              Star
            </button>
          </div>
        )}
      </div>

      <div className="email-list-body">
        {emails.length === 0 ? (
          <div className="no-emails">
            <p>No emails found</p>
          </div>
        ) : (
          emails.map((email, idx) => (
            <div
              key={idx}
              className={`email-item ${selectedEmail === idx ? 'selected' : ''} ${selectedEmails.includes(idx) ? 'checked' : ''}`}
              onClick={() => onSelectEmail(idx)}
            >
              <div className="email-item-left">
                <input
                  type="checkbox"
                  checked={selectedEmails.includes(idx)}
                  onChange={(e) => handleSelectEmail(idx, e)}
                  className="email-checkbox"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="star-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </span>
              </div>

              <div className="email-item-content">
                <div className="email-sender">
                  {email.from?.split('<')[0]?.trim() || email.from || '(Unknown Sender)'}
                </div>
                <div className="email-subject-preview">
                  <span className="email-subject">
                    {email.subject || '(No Subject)'}
                  </span>
                  <span className="email-preview">
                    {' - ' + truncateText(sanitizePreview(email.body), 100)}
                  </span>
                </div>
              </div>

              <div className="email-item-right">
                {email.label && (
                  <span className={`email-label label-${email.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {email.label}
                  </span>
                )}
                <span className="email-date">{formatDate(email.date)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EmailList;
