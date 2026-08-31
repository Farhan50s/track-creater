import { Link } from 'react-router-dom';
import { RecommendationResult, RecommendationType } from '../types/dashboard.types';

interface RecommendedActionCardProps {
  recommendation: RecommendationResult;
}

export function RecommendedActionCard({ recommendation }: RecommendedActionCardProps) {
  const getBadge = (type: RecommendationType, label: string) => {
    switch (type) {
      case 'recommended_next':
        return (
          <span style={{ ...styles.badge, ...styles.recommendedNextBadge }}>
            🎯 {label}
          </span>
        );
      case 'complete_this_first':
        return (
          <span style={{ ...styles.badge, ...styles.completeFirstBadge }}>
            ⚠️ {label}
          </span>
        );
      case 'optional_next':
        return (
          <span style={{ ...styles.badge, ...styles.optionalNextBadge }}>
            💡 {label}
          </span>
        );
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.contentArea}>
        <div style={styles.badgeRow}>
          {getBadge(recommendation.type, recommendation.label)}
          <span style={styles.pillarBadge}>Pillar: {recommendation.pillarName}</span>
          <span style={styles.timeBadge}>{recommendation.estimatedMinutes} mins</span>
        </div>

        <h2 style={styles.nodeTitle}>{recommendation.nodeName}</h2>
        <p style={styles.reasonText}>{recommendation.reason}</p>
      </div>

      <div style={styles.actionArea}>
        <Link
          to={`/app/node/${encodeURIComponent(recommendation.nodeId)}`}
          style={styles.actionButton}
        >
          Continue Skill →
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    padding: '28px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--accent-primary)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
    flexWrap: 'wrap',
  },
  contentArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
    minWidth: '260px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '12px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: 'var(--radius-sm)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  recommendedNextBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
  },
  completeFirstBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    color: '#F59E0B',
    border: '1px solid rgba(245, 158, 11, 0.4)',
  },
  optionalNextBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    color: '#60A5FA',
    border: '1px solid rgba(59, 130, 246, 0.4)',
  },
  pillarBadge: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    padding: '3px 10px',
    borderRadius: 'var(--radius-sm)',
  },
  timeBadge: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  nodeTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  reasonText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
  },
  actionArea: {
    display: 'flex',
    alignItems: 'center',
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '48px',
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    transition: 'background-color 0.15s ease',
    whiteSpace: 'nowrap',
  },
};
