import { useState } from 'react';
import { TrackWithScope } from '../types/onboarding.types';

interface GoalSelectionCardProps {
  track: TrackWithScope;
  isActiveTrack?: boolean;
  hasEnrolledTrack?: boolean;
  isSwitching?: boolean;
  onSelect: (trackId: string) => void;
  onSwitchTrack?: (trackId: string) => void;
}

export function GoalSelectionCard({
  track,
  isActiveTrack = false,
  hasEnrolledTrack = false,
  isSwitching = false,
  onSelect,
  onSwitchTrack,
}: GoalSelectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isActiveTrack) return;
    if (hasEnrolledTrack && onSwitchTrack) {
      onSwitchTrack(track.track_id);
    } else {
      onSelect(track.track_id);
    }
  };

  return (
    <div
      style={{
        ...styles.card,
        borderColor: isActiveTrack
          ? 'var(--accent-primary)'
          : isHovered
          ? 'rgba(16, 185, 129, 0.4)'
          : 'var(--border-color)',
        backgroundColor: isActiveTrack
          ? 'rgba(16, 185, 129, 0.04)'
          : isHovered
          ? 'var(--bg-surface-hover)'
          : 'var(--bg-surface)',
        boxShadow: isActiveTrack
          ? '0 0 16px rgba(16, 185, 129, 0.12)'
          : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${isActiveTrack ? 'Current Active Track: ' : hasEnrolledTrack ? 'Switch to ' : 'Select '}${track.name}`}
    >
      <div style={styles.content}>
        <div style={styles.headerRow}>
          <div style={styles.titleGroup}>
            <h2 style={styles.trackTitle}>{track.name}</h2>
            {isActiveTrack && (
              <span style={styles.activeTrackBadge}>
                ★ Active Track
              </span>
            )}
          </div>
          <span style={styles.scopeBadge}>
            {track.pillarCount} {track.pillarCount === 1 ? 'Pillar' : 'Pillars'} · {track.nodeCount} {track.nodeCount === 1 ? 'Skill' : 'Skills'}
          </span>
        </div>

        <p style={styles.description}>{track.description}</p>
      </div>

      <div style={styles.actionContainer}>
        {isActiveTrack ? (
          <button
            type="button"
            style={styles.activeTrackButton}
            disabled
            tabIndex={-1}
          >
            ✓ Current Track
          </button>
        ) : hasEnrolledTrack ? (
          <button
            type="button"
            style={styles.switchButton}
            tabIndex={-1}
            disabled={isSwitching}
          >
            {isSwitching ? 'Switching...' : 'Switch to Track →'}
          </button>
        ) : (
          <button
            type="button"
            style={styles.selectButton}
            tabIndex={-1}
          >
            Select Goal →
          </button>
        )}
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
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    flexWrap: 'wrap',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  trackTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  activeTrackBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '9999px',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  scopeBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    whiteSpace: 'nowrap',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
  },
  actionContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  selectButton: {
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    pointerEvents: 'none',
  },
  switchButton: {
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#09090b',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    pointerEvents: 'none',
  },
  activeTrackButton: {
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--accent-primary)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: 'var(--radius-md)',
    cursor: 'default',
    pointerEvents: 'none',
  },
};
