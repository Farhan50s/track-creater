import { useState } from 'react';
import { TrackWithScope } from '../types/onboarding.types';

interface GoalSelectionCardProps {
  track: TrackWithScope;
  onSelect: (trackId: string) => void;
}

export function GoalSelectionCard({ track, onSelect }: GoalSelectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        borderColor: isHovered ? 'var(--accent-primary)' : 'var(--border-color)',
        backgroundColor: isHovered ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(track.track_id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(track.track_id);
        }
      }}
      aria-label={`Select ${track.name} goal`}
    >
      <div style={styles.content}>
        <div style={styles.headerRow}>
          <h2 style={styles.trackTitle}>{track.name}</h2>
          <span style={styles.scopeBadge}>
            {track.pillarCount} {track.pillarCount === 1 ? 'Pillar' : 'Pillars'} · {track.nodeCount} {track.nodeCount === 1 ? 'Skill' : 'Skills'}
          </span>
        </div>

        <p style={styles.description}>{track.description}</p>
      </div>

      <div style={styles.actionContainer}>
        <button
          type="button"
          style={styles.selectButton}
          tabIndex={-1} // Handled by parent card click
        >
          Select Goal →
        </button>
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
    transition: 'all 0.15s ease',
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
  trackTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
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
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    pointerEvents: 'none',
  },
};
