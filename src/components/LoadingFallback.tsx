export function LoadingFallback() {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading view...</p>
    </div>
  );
}
