import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PillarSummary } from '../types/track.types';

interface PillarCardProps {
  pillar: PillarSummary;
}

export function PillarCard({ pillar }: PillarCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    navigate(`/app/track/${encodeURIComponent(pillar.pillar_id)}`);
  };

  const renderFocusStatus = () => {
    if (pillar.currentFocusNodeName) {
      return (
        <span style={styles.currentFocusText}>
          🎯 Focus: <strong>{pillar.currentFocusNodeName}</strong>
        </span>
      );
    }
    if (pillar.isBlockedByPrereq) {
      return <span style={styles.blockedText}>🔒 Blocked by prerequisites in earlier pillar</span>;
    }
    if (pillar.requiredNodeCount > 0 && pillar.completedRequiredCount === pillar.requiredNodeCount) {
      return <span style={styles.completedText}>✓ Core Requirements Completed</span>;
    }
    return <span style={styles.optionalText}>Explore Specialized Skills</span>;
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
      aria-label={`Pillar: ${pillar.name}, ${pillar.completionPercent}% complete, ${pillar.totalNodeCount} total skills`}
      style={{
        ...styles.card,
        borderColor: isHovered ? 'var(--accent-primary)' : 'var(--border-color)',
        backgroundColor: isHovered ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h2 style={styles.title}>{pillar.name}</h2>
          <span style={styles.scopeBadge}>
            {pillar.totalNodeCount} {pillar.totalNodeCount === 1 ? 'skill' : 'skills'}
          </span>
        </div>
        <p style={styles.description}>{pillar.description}</p>
      </div>

      <div style={styles.progressSection}>
        <div style={styles.progressLabelRow}>
          <span style={styles.progressLabel}>Required Progress</span>
          <span style={styles.progressPercent}>{pillar.completionPercent}%</span>
        </div>

        <div style={styles.progressBarBg}>
          <div
            style={{
              ...styles.progressBarFill,
              width: `${pillar.completionPercent}%`,
            }}
          />
        </div>

        <div style={styles.progressSubtext}>
          {pillar.completedRequiredCount} of {pillar.requiredNodeCount} required skills completed
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.focusContainer}>{renderFocusStatus()}</div>
        <span style={styles.viewLink}>View Tree →</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    gap: '20px',
    outline: 'none',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  scopeBadge: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    whiteSpace: 'nowrap',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  progressLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  progressLabel: {
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  progressPercent: {
    color: 'var(--accent-primary)',
    fontWeight: '700',
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '3px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--accent-primary)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressSubtext: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-color)',
    gap: '12px',
  },
  focusContainer: {
    fontSize: '13px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  currentFocusText: {
    color: 'var(--text-primary)',
  },
  blockedText: {
    color: 'var(--text-muted)',
    fontSize: '12px',
  },
  completedText: {
    color: 'var(--accent-primary)',
    fontWeight: '500',
  },
  optionalText: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
  },
  viewLink: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--accent-primary)',
    whiteSpace: 'nowrap',
  },
};
