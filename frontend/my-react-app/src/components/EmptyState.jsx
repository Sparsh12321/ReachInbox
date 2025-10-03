// components/EmptyState.js
export default function EmptyState({ message = "No data", onRetry }) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-content">
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
          style={{ opacity: 0.3, marginBottom: '20px' }}
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <h3 style={{ marginBottom: '10px', color: '#666' }}>{message}</h3>
        <p style={{ color: '#999', marginBottom: '20px' }}>
          Try selecting a different category or refresh to check for new emails
        </p>
        {onRetry && (
          <button 
            onClick={onRetry}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
