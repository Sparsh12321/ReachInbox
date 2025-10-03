// components/EmptyState.js
export default function EmptyState({ message = "No data", onRetry }) {
  return (
    <div className="loading-container">
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Refresh</button>}
    </div>
  );
}
