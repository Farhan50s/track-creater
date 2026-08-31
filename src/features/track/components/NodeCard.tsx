import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkillNodeWithMeta, SkillNodeClassification, NodeStatus } from '../types/track.types';

interface NodeCardProps {
  node: SkillNodeWithMeta;
}

export function NodeCard({ node }: NodeCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    navigate(`/app/node/${encodeURIComponent(node.node_id)}`);
  };

  const getStatusIcon = (status: NodeStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span style={styles.completedIcon} title="Completed" aria-hidden="true">
            ✓
          </span>
        );
      case 'in_progress':
        return (
          <span style={styles.inProgressIcon} title="In Progress" aria-hidden="true">
            ◐
          </span>
        );
      case 'not_started':
      default:
        return (
          <span style={styles.notStartedIcon} title="Not Started" aria-hidden="true">
            ○
          </span>
        );
    }
  };

  const getClassificationBadge = (classification: SkillNodeClassification) => {
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

  const accessibleStatusText =
    node.status === 'completed'
      ? 'Completed'
      : node.status === 'in_progress'
      ? 'In Progress'
      : 'Not Started';

  const accessibleLockText = node.is_locked
    ? `, Locked: requires completion of ${node.unmet_prerequisites.length} prerequisites`
    : '';

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Skill: ${node.name}, ${node.classification}, status: ${accessibleStatusText}${accessibleLockText}`}
      style={{
        ...styles.card,
        opacity: node.is_locked ? 0.75 : 1,
        borderColor: node.is_current_focus
          ? 'var(--accent-primary)'
          : isHovered
          ? 'var(--border-color-hover)'
          : 'var(--border-color)',
        backgroundColor: node.is_current_focus
          ? 'rgba(16, 185, 129, 0.04)'
          : isHovered
          ? 'var(--bg-surface-hover)'
          : 'var(--bg-surface)',
        boxShadow: node.is_current_focus ? '0 0 0 1px var(--accent-primary)' : 'none',
      }}
    >
      <div style={styles.leftCol}>
        <div style={styles.statusCol}>{getStatusIcon(node.status)}</div>

        <div style={styles.contentCol}>
          <div style={styles.titleRow}>
            <span style={styles.nodeName}>{node.name}</span>
            {node.is_current_focus && (
              <span style={styles.currentFocusBadge}>
                🎯 Current Focus
              </span>
            )}
            {node.is_locked && (
              <span style={styles.lockBadge} title="Progression Locked — exploration permitted">
                🔒 Locked
              </span>
            )}
          </div>

          <div style={styles.metaRow}>
            {getClassificationBadge(node.classification)}
            <span style={styles.metaDivider}>•</span>
            <span style={styles.depthText}>
              {node.recommended_depth.charAt(0).toUpperCase() + node.recommended_depth.slice(1)}
            </span>
            <span style={styles.metaDivider}>•</span>
            <span style={styles.timeText}>{node.estimated_time_minutes} min</span>

            {node.is_locked && node.unmet_prerequisites.length > 0 && (
              <span style={styles.unmetText}>
                (Requires prerequisite)
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={styles.rightCol}>
        <span style={styles.arrowIcon} aria-hidden="true">→</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '52px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    gap: '12px',
    maxWidth: '100%',
  },
  leftCol: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },
  statusCol: {
    paddingTop: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
  },
  completedIcon: {
    color: 'var(--accent-primary)',
    fontWeight: '800',
    fontSize: '15px',
  },
  inProgressIcon: {
    color: 'var(--status-warning)',
    fontWeight: '700',
    fontSize: '16px',
  },
  notStartedIcon: {
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  contentCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  nodeName: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  currentFocusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    padding: '1px 6px',
    borderRadius: 'var(--radius-sm)',
    whiteSpace: 'nowrap',
  },
  lockBadge: {
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
    padding: '1px 6px',
    borderRadius: 'var(--radius-sm)',
    whiteSpace: 'nowrap',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    fontSize: '12px',
  },
  metaDivider: {
    color: 'var(--border-color)',
  },
  depthText: {
    color: 'var(--text-muted)',
  },
  timeText: {
    color: 'var(--text-muted)',
  },
  unmetText: {
    color: 'var(--status-warning)',
    fontSize: '11px',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '1px 6px',
    borderRadius: 'var(--radius-sm)',
    textTransform: 'capitalize',
    letterSpacing: '0.02em',
  },
  requiredBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
  },
  recommendedBadge: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    color: 'var(--accent-teal)',
    border: '1px solid rgba(20, 184, 166, 0.25)',
  },
  optionalBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.12)',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(156, 163, 175, 0.25)',
  },
  specializationBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    color: 'var(--status-warning)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
  },
  rightCol: {
    display: 'flex',
    alignItems: 'center',
  },
  arrowIcon: {
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
};
