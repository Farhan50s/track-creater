import { useDashboardData } from '../hooks/useDashboardData';
import { TrackSummaryBanner } from '../components/TrackSummaryBanner';
import { RecommendedActionCard } from '../components/RecommendedActionCard';
import { ActiveLearningSection } from '../components/ActiveLearningSection';
import { TrackCompletedCard } from '../components/TrackCompletedCard';
import { LoadingFallback } from '../../../components/LoadingFallback';
import { Link } from 'react-router-dom';

export function HomePage() {
  const {
    trackName,
    trackDescription,
    overallCompletionPercent,
    completedRequiredSkills,
    totalRequiredSkills,
    pillars,
    activePillars,
    recommendedAction,
    isLoading,
    error,
    refetch,
  } = useDashboardData();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (error || !trackName) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{error || 'No active track found.'}</p>
          <div style={styles.errorActions}>
            <Link to="/onboarding/goal" style={styles.onboardingLink}>
              Enroll in a Track
            </Link>
            <button type="button" onClick={() => refetch()} style={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isTrackCompleted = overallCompletionPercent === 100;

  return (
    <div style={styles.container}>
      {/* 1. Track Summary Banner */}
      <TrackSummaryBanner
        trackName={trackName}
        trackDescription={trackDescription}
        overallCompletionPercent={overallCompletionPercent}
        completedRequiredSkills={completedRequiredSkills}
        totalRequiredSkills={totalRequiredSkills}
        activePillarsCount={activePillars.length}
        totalPillarsCount={pillars.length}
      />

      {/* 2. Primary Recommendation Hero Card (or Track Completed celebration) */}
      {isTrackCompleted ? (
        <TrackCompletedCard trackName={trackName} />
      ) : (
        recommendedAction && <RecommendedActionCard recommendation={recommendedAction} />
      )}

      {/* 3. Active Learning Panel (Parallel Pillars) */}
      <ActiveLearningSection pillars={pillars} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '32px 20px 80px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  errorCard: {
    padding: '36px',
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
  onboardingLink: {
    color: 'var(--accent-primary)',
    fontWeight: '600',
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
