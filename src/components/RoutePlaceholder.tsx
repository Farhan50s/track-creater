import { useParams } from 'react-router-dom';

interface RoutePlaceholderProps {
  screenName: string;
  routePath: string;
  description?: string;
}

export function RoutePlaceholder({
  screenName,
  routePath,
  description,
}: RoutePlaceholderProps) {
  const params = useParams();
  const paramKeys = Object.keys(params);

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">{screenName}</h1>
        <p className="card-subtitle">Phase 0 Scaffold Placeholder</p>
      </div>

      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
        {description || 'This route is configured as part of the Phase 0 routing shell. Feature implementation will occur in subsequent phases.'}
      </p>

      <div className="route-info-box">
        <div className="route-info-row">
          <span className="route-info-label">Route Path:</span>
          <span className="route-info-value">{routePath}</span>
        </div>
        <div className="route-info-row">
          <span className="route-info-label">Screen:</span>
          <span className="route-info-value">{screenName}</span>
        </div>
        <div className="route-info-row">
          <span className="route-info-label">Phase:</span>
          <span className="route-info-value">Phase 0 — Environment & Scaffold</span>
        </div>
        {paramKeys.length > 0 && (
          <div className="route-info-row">
            <span className="route-info-label">URL Parameters:</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {paramKeys.map((key) => (
                <span key={key} className="params-badge">
                  {key}: <strong>{params[key]}</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
