import { useTrackData } from '../hooks/useTrackData';
import { PillarCard } from '../components/PillarCard';
import { LoadingFallback } from '../../../components/LoadingFallback';

export function TrackOverviewPage() {
  const { trackName, trackDescription, pillars, isLoading, error, refetch } = useTrackData();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{error}</p>
          <button type="button" onClick={() => refetch()} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalRequiredNodes = pillars.reduce((sum, p) => sum + p.requiredNodeCount, 0);
  const totalCompletedRequired = pillars.reduce((sum, p) => sum + p.completedRequiredCount, 0);
  const overallPercent = totalRequiredNodes > 0 ? Math.round((totalCompletedRequired / totalRequiredNodes) * 100) : 0;
  const totalSkillsCount = pillars.reduce((sum, p) => sum + p.totalNodeCount, 0);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.trackTitle}>{trackName || 'Track Overview'}</h1>
          <span style={styles.overallPercentBadge}>
            {overallPercent}% Complete
          </span>
        </div>

        {trackDescription && <p style={styles.trackDescription}>{trackDescription}</p>}

        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{pillars.length}</span>
            <span style={styles.statLabel}>Pillars</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{totalSkillsCount}</span>
            <span style={styles.statLabel}>Total Skills</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statNumber}>
              {totalCompletedRequired}/{totalRequiredNodes}
            </span>
            <span style={styles.statLabel}>Required Skills Completed</span>
          </div>
        </div>
      </header>

      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Pillars</h2>
        <span style={styles.sectionSubtitle}>
          Explore pillars freely. Progression unlocks sequentially within each skill branch.
        </span>
      </div>

      <div style={styles.pillarsGrid}>
        {pillars.map((pillar) => (
          <PillarCard key={pillar.pillar_id} pillar={pillar} />
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1080px',
    margin: '0 auto',
    padding: '32px 20px 60px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '28px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  trackTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  overallPercentBadge: {
    fontSize: '14px',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  trackDescription: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: 0,
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statNumber: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  statDivider: {
    width: '1px',
    height: '28px',
    backgroundColor: 'var(--border-color)',
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  pillarsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  errorCard: {
    padding: '32px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  errorText: {
    color: 'var(--status-error)',
    fontSize: '15px',
    margin: 0,
  },
  retryButton: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
  },
};
