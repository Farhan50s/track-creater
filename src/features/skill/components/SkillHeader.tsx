import { NodeStatus, SkillNodeClassification, SkillNodeDepth } from '../../track/types/track.types';

interface SkillHeaderProps {
  name: string;
  status: NodeStatus;
  classification: SkillNodeClassification;
  recommendedDepth: SkillNodeDepth;
  estimatedTimeMinutes: number;
}

export function SkillHeader({
  name,
  status,
  classification,
  recommendedDepth,
  estimatedTimeMinutes,
}: SkillHeaderProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <span style={{ ...styles.statusBadge, ...styles.completedStatus }}>
            <span style={styles.statusDot}>✓</span> Completed
          </span>
        );
      case 'in_progress':
        return (
          <span style={{ ...styles.statusBadge, ...styles.inProgressStatus }}>
            <span style={styles.statusDot}>◐</span> In Progress
          </span>
        );
      case 'not_started':
      default:
        return (
          <span style={{ ...styles.statusBadge, ...styles.notStartedStatus }}>
            <span style={styles.statusDot}>○</span> Not Started
          </span>
        );
    }
  };

  const getClassificationBadge = () => {
    switch (classification) {
      case 'required':
        return <span style={{ ...styles.badge, ...styles.requiredBadge }}>Required</span>;
      case 'recommended':
        return <span style={{ ...styles.badge, ...styles.recommendedBadge }}>Recommended</span>;
      case 'optional':
        return <span style={{ ...styles.badge, ...styles.optionalBadge }}>Optional</span>;
      case 'specialization':
        return <span style={{ ...styles.badge, ...styles.specializationBadge }}>Specialization</span>;
    }
  };

  return (
    <div style={styles.header}>
      <div style={styles.topRow}>
        <div style={styles.titleArea}>
          <h1 style={styles.title}>{name}</h1>
        </div>
        <div style={styles.statusArea}>{getStatusBadge()}</div>
      </div>

      <div style={styles.metaRow}>
        {getClassificationBadge()}
        <span style={styles.metaBadge}>{recommendedDepth} depth</span>
        <span style={styles.metaBadge}>{estimatedTimeMinutes} mins estimated</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px 28px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  titleArea: {
    flex: 1,
    minWidth: '240px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    margin: 0,
    lineHeight: '1.25',
  },
  statusArea: {
    flexShrink: 0,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    whiteSpace: 'nowrap',
  },
  statusDot: {
    fontSize: '14px',
  },
  completedStatus: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  inProgressStatus: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#F59E0B',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  notStartedStatus: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: 'var(--radius-sm)',
    textTransform: 'capitalize',
  },
  requiredBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  recommendedBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#60A5FA',
    border: '1px solid rgba(59, 130, 246, 0.3)',
  },
  optionalBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    color: '#94A3B8',
    border: '1px solid rgba(148, 163, 184, 0.25)',
  },
  specializationBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    color: '#C084FC',
    border: '1px solid rgba(168, 85, 247, 0.3)',
  },
  metaBadge: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    padding: '3px 10px',
    borderRadius: 'var(--radius-sm)',
    textTransform: 'capitalize',
  },
};
