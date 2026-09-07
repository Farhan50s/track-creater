import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkillNodeWithMeta, SkillNodeClassification, NodeStatus } from '../types/track.types';
import { DEPTH_THEMES } from '../../../utils/depthTheme';

interface NodeCardProps {
  node: SkillNodeWithMeta;
}

export function NodeCard({ node }: NodeCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const theme = DEPTH_THEMES[4];

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

  // Determine dynamic border and shadow styling
  const getCardStyle = () => {
    if (node.is_current_focus) {
      return {
        borderColor: 'var(--accent-primary)',
        backgroundColor: 'rgba(16, 185, 129, 0.06)',
        boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)',
      };
    }
    if (isHovered) {
      return {
        borderColor: 'rgba(168, 85, 247, 0.8)', // hover:border-purple-500/80
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        boxShadow: '0 0 15px rgba(168, 85, 247, 0.15)', // hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]
      };
    }
    return {
      borderColor: 'rgba(88, 28, 135, 0.4)', // border-purple-900/40
      backgroundColor: 'rgba(2, 6, 23, 0.7)', // bg-slate-950/70
      boxShadow: 'none',
    };
  };

  const cardDynamicStyles = getCardStyle();

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
      className="border border-purple-900/40 bg-slate-950/70 hover:border-purple-500/80 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] node-card-l4"
      style={{
        ...styles.card,
        opacity: node.is_locked ? 0.75 : 1,
        ...cardDynamicStyles,
      }}
    >
      <div style={styles.leftCol}>
        <div style={styles.statusCol}>{getStatusIcon(node.status)}</div>

        <div style={styles.contentCol}>
          <div style={styles.titleRow}>
            <span style={styles.nodeName}>{node.name}</span>

            {/* Level 4 Skill Indicator */}
            <span
              className={`${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText} text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold`}
              style={styles.levelBadge}
            >
              L4 Skill
            </span>

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
    minHeight: '56px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
    paddingTop: '3px',
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
    fontSize: '14.5px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  levelBadge: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: 'rgba(88, 28, 135, 0.4)',
    color: '#d8b4fe',
    border: '1px solid rgba(107, 33, 168, 0.5)',
    padding: '1px 6px',
    borderRadius: '4px',
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
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
  },
  recommendedBadge: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    color: 'var(--accent-teal)',
  },
  optionalBadge: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    color: 'var(--text-secondary)',
  },
  specializationBadge: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    color: '#a855f7',
  },
  rightCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '4px',
  },
  arrowIcon: {
    color: 'var(--text-muted)',
    fontSize: '16px',
    transition: 'transform 0.15s ease',
  },
};
