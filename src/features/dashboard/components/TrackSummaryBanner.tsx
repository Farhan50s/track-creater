import { Link } from 'react-router-dom';

interface TrackSummaryBannerProps {
  trackName: string;
  trackDescription: string;
  overallCompletionPercent: number;
  completedRequiredSkills: number;
  totalRequiredSkills: number;
  activePillarsCount: number;
  totalPillarsCount: number;
}

export function TrackSummaryBanner({
  trackName,
  trackDescription,
  overallCompletionPercent,
  completedRequiredSkills,
  totalRequiredSkills,
  activePillarsCount,
  totalPillarsCount,
}: TrackSummaryBannerProps) {
  return (
    <div style={styles.banner}>
      <div style={styles.headerRow}>
        <div style={styles.titleArea}>
          <span style={styles.trackLabel}>Active Track</span>
          <h1 style={styles.title}>{trackName}</h1>
          {trackDescription && <p style={styles.description}>{trackDescription}</p>}
        </div>

        <div style={styles.progressArea}>
          <div style={styles.progressPercentRow}>
            <span style={styles.percentNumber}>{overallCompletionPercent}%</span>
            <span style={styles.percentLabel}>Required Mastery</span>
          </div>
          <div style={styles.progressBarBg}>
            <div
              style={{
                ...styles.progressBarFill,
                width: `${overallCompletionPercent}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div style={styles.footerRow}>
        <div style={styles.chipsRow}>
          <span style={styles.chip}>
            🎯 {completedRequiredSkills} of {totalRequiredSkills} Required Skills Completed
          </span>
          <span style={styles.chip}>
            🏛 {activePillarsCount} of {totalPillarsCount} Pillars Active
          </span>
        </div>

        <Link to="/app/track" style={styles.viewTrackLink}>
          View Full Track Overview →
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '32px 28px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '24px',
    flexWrap: 'wrap',
  },
  titleArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    minWidth: '260px',
  },
  trackLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
    maxWidth: '520px',
  },
  progressArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '200px',
    alignItems: 'flex-end',
  },
  progressPercentRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  percentNumber: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'var(--accent-primary)',
    lineHeight: '1',
  },
  percentLabel: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  progressBarBg: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--accent-primary)',
    transition: 'width 0.3s ease',
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
    flexWrap: 'wrap',
  },
  chipsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  chip: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
  },
  viewTrackLink: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--accent-primary)',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  },
};
