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
          <span style={styles.completedIcon} title="Completed">
            ✓
          </span>
        );
      case 'in_progress':
        return (
          <span style={styles.inProgressIcon} title="In Progress">
            ◐
          </span>
        );
      case 'not_started':
      default:
        return (
          <span style={styles.notStartedIcon} title="Not Started">
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
      aria-label={`Skill: ${node.name}, ${node.classification}, ${node.status.replace('_', ' ')}${node.is_locked ? ', locked' : ''}`}
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

          {node.is_locked && node.unmet_prerequisite_names && node.unmet_prerequisite_names.length > 0 && (
            <div style={styles.lockHint}>
              Requires: {node.unmet_prerequisite_names.join(', ')}
            </div>
          )}
        </div>
      </div>

      <div style={styles.rightCol}>
        <div style={styles.metaRow}>
          <span style={styles.depthBadge}>{node.recommended_depth}</span>
          <span style={styles.timeBadge}>{node.estimated_time_minutes}m</span>
          {getClassificationBadge(node.classification)}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    gap: '16px',
    outline: 'none',
  },
  leftCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flex: 1,
    minWidth: 0,
  },
  statusCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    flexShrink: 0,
  },
  completedIcon: {
    color: '#10B981',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  inProgressIcon: {
    color: '#F59E0B',
    fontSize: '16px',
  },
  notStartedIcon: {
    color: 'var(--text-muted)',
    fontSize: '16px',
  },
  contentCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
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
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  currentFocusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  lockBadge: {
    fontSize: '11px',
    fontWeight: '500',
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    color: 'var(--text-secondary)',
  },
  lockHint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rightCol: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  depthBadge: {
    fontSize: '11px',
    textTransform: 'capitalize',
    color: 'var(--text-secondary)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
  },
  timeBadge: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
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
};
