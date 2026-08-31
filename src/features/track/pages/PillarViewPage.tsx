import { useParams, Link } from 'react-router-dom';
import { usePillarTree } from '../hooks/usePillarTree';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ExpandableTree } from '../components/ExpandableTree';
import { LoadingFallback } from '../../../components/LoadingFallback';

export function PillarViewPage() {
  const { pillarId } = useParams<{ pillarId: string }>();
  const {
    pillarName,
    pillarDescription,
    topics,
    currentFocusNodeId,
    completionPercent,
    totalNodeCount,
    requiredNodeCount,
    completedRequiredCount,
    isLoading,
    error,
    refetch,
  } = usePillarTree(pillarId);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (error || !pillarName) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{error || 'Pillar not found'}</p>
          <div style={styles.errorActions}>
            <Link to="/app/track" style={styles.backLink}>
              ← Back to Track Overview
            </Link>
            <button type="button" onClick={() => refetch()} style={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentFocusNode = topics
    .flatMap((t) => t.all_nodes)
    .find((n) => n.node_id === currentFocusNodeId);

  return (
    <div style={styles.container}>
      <Breadcrumbs currentPillarName={pillarName} />

      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.titleColumn}>
            <span style={styles.pillarTag}>Pillar</span>
            <h1 style={styles.pillarTitle}>{pillarName}</h1>
          </div>
          <span style={styles.percentBadge}>{completionPercent}% Complete</span>
        </div>

        {pillarDescription && <p style={styles.pillarDescription}>{pillarDescription}</p>}

        <div style={styles.progressRow}>
          <div style={styles.progressBarBg}>
            <div style={{ ...styles.progressBarFill, width: `${completionPercent}%` }} />
          </div>
          <div style={styles.progressStats}>
            <span>
              {completedRequiredCount} of {requiredNodeCount} required skills completed
            </span>
            <span>{totalNodeCount} total skills in pillar</span>
          </div>
        </div>

        {currentFocusNode && (
          <div style={styles.focusBanner}>
            <span style={styles.focusLabel}>🎯 Suggested Starting / Current Focus:</span>
            <Link to={`/app/node/${encodeURIComponent(currentFocusNode.node_id)}`} style={styles.focusLink}>
              {currentFocusNode.name} →
            </Link>
          </div>
        )}
      </header>

      <main style={styles.main}>
        <ExpandableTree topics={topics} />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '920px',
    margin: '0 auto',
    padding: '32px 20px 60px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  titleColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pillarTag: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  pillarTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  percentBadge: {
    fontSize: '14px',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  pillarDescription: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
  },
  progressRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '8px',
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
  progressStats: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--text-muted)',
    flexWrap: 'wrap',
    gap: '8px',
  },
  focusBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    flexWrap: 'wrap',
  },
  focusLabel: {
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  focusLink: {
    color: 'var(--accent-primary)',
    fontWeight: '600',
    textDecoration: 'none',
  },
  main: {
    width: '100%',
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
  errorActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backLink: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    textDecoration: 'none',
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
