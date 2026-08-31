import { Link } from 'react-router-dom';
import { PillarProgressSummary } from '../types/dashboard.types';

interface ActivePillarCardProps {
  pillar: PillarProgressSummary;
}

export function ActivePillarCard({ pillar }: ActivePillarCardProps) {
  const getFocusBadge = () => {
    if (pillar.currentFocusNodeName) {
      return (
        <div style={styles.focusChip}>
          <span style={styles.focusIcon}>🎯</span>
          <span style={styles.focusLabel}>Current Focus:</span>
          <strong style={styles.focusNodeName}>{pillar.currentFocusNodeName}</strong>
        </div>
      );
    }
    if (pillar.completionPercent === 100) {
      return (
        <div style={{ ...styles.focusChip, ...styles.completedChip }}>
          <span>✅</span>
          <span style={styles.focusLabel}>Core Requirements Completed</span>
        </div>
      );
    }
    return (
      <div style={{ ...styles.focusChip, ...styles.blockedChip }}>
        <span>🔒</span>
        <span style={styles.focusLabel}>Blocked by prerequisite</span>
      </div>
    );
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleArea}>
          <h3 style={styles.title}>{pillar.name}</h3>
          <span style={styles.skillCountBadge}>
            {pillar.totalSkillCount} total skills ({pillar.requiredCount} required)
          </span>
        </div>
        <span style={styles.percentText}>{pillar.completionPercent}%</span>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressBarBg}>
        <div style={{ ...styles.progressBarFill, width: `${pillar.completionPercent}%` }} />
      </div>

      {/* Current Focus Chip */}
      {getFocusBadge()}

      {/* Footer link to pillar tree */}
      <div style={styles.footer}>
        <span style={styles.metaText}>
          {pillar.completedRequiredCount} of {pillar.requiredCount} required completed
        </span>
        <Link
          to={`/app/track/${encodeURIComponent(pillar.pillarId)}`}
          style={styles.exploreLink}
        >
          Explore Tree →
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    transition: 'border-color 0.15s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  titleArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  skillCountBadge: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  percentText: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--accent-primary)',
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--accent-primary)',
    transition: 'width 0.25s ease',
  },
  focusChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    flexWrap: 'wrap',
  },
  completedChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: 'var(--accent-primary)',
  },
  blockedChip: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    color: '#F59E0B',
  },
  focusIcon: {
    fontSize: '14px',
  },
  focusLabel: {
    color: 'var(--text-secondary)',
  },
  focusNodeName: {
    color: 'var(--text-primary)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)',
  },
  metaText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  exploreLink: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--accent-primary)',
    textDecoration: 'none',
  },
};
