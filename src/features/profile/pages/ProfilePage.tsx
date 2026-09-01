import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useDashboardData } from '../../dashboard/hooks/useDashboardData';
import { LoadingFallback } from '../../../components/LoadingFallback';

export function ProfilePage() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const {
    trackName,
    trackDescription,
    overallCompletionPercent,
    completedRequiredSkills,
    totalRequiredSkills,
    isLoading: dashboardLoading,
  } = useDashboardData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  if (authLoading || dashboardLoading) {
    return <LoadingFallback />;
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Member';

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.pageTitle}>Account Settings</h1>
        <p style={styles.pageSubtitle}>
          Manage your personal learner profile, track enrollment, and session.
        </p>
      </header>

      <div style={styles.contentGrid}>
        {/* User Identity Card */}
        <section style={styles.card} aria-labelledby="identity-heading">
          <h2 id="identity-heading" style={styles.cardTitle}>
            👤 Learner Profile
          </h2>

          <div style={styles.fieldList}>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Email Address</span>
              <span style={styles.fieldValue}>{user?.email || 'Unknown'}</span>
            </div>

            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Account UUID</span>
              <code style={styles.uuidCode}>{user?.id || '—'}</code>
            </div>

            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Member Since</span>
              <span style={styles.fieldValue}>{memberSince}</span>
            </div>
          </div>
        </section>

        {/* Enrolled Track Card */}
        <section style={styles.card} aria-labelledby="track-heading">
          <div style={styles.cardHeaderWithAction}>
            <h2 id="track-heading" style={styles.cardTitle}>
              🎓 Active Learning Track
            </h2>
            <Link
              to="/onboarding/goal"
              style={styles.changeTrackBtn}
              className="focus-ring"
            >
              Change Track
            </Link>
          </div>

          <div style={styles.trackCardContent}>
            <div>
              <h3 style={styles.trackName}>{trackName || 'No Active Track Enrolled'}</h3>
              {trackDescription && (
                <p style={styles.trackDesc}>{trackDescription}</p>
              )}
            </div>

            <div style={styles.progressContainer}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Track Progress</span>
                <span style={styles.progressPct}>{overallCompletionPercent}%</span>
              </div>
              <div style={styles.progressBarBg}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${overallCompletionPercent}%`,
                  }}
                />
              </div>
              <span style={styles.progressSubtext}>
                {completedRequiredSkills} of {totalRequiredSkills} Required Skills Completed
              </span>
            </div>
          </div>
        </section>

        {/* Session Security Card */}
        <section style={styles.card} aria-labelledby="security-heading">
          <h2 id="security-heading" style={styles.cardTitle}>
            🔒 Session & Security
          </h2>
          <p style={styles.securityNotice}>
            Signed in with Supabase Authentication. Logging out will clear your local
            credentials session.
          </p>
          <div>
            <button
              onClick={handleLogout}
              style={styles.signOutButton}
              type="button"
              className="focus-ring"
            >
              Sign Out of Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '36px 24px 64px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  contentGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  cardHeaderWithAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  fieldList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLabel: {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
  },
  fieldValue: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  uuidCode: {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-primary)',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    display: 'inline-block',
    wordBreak: 'break-all',
  },
  trackCardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  trackName: {
    fontSize: '17px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  trackDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: '4px 0 0 0',
    lineHeight: 1.5,
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'var(--bg-primary)',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  progressPct: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--accent-primary)',
  },
  progressBarBg: {
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '100px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--accent-primary)',
    borderRadius: '100px',
    transition: 'width 0.3s ease',
  },
  progressSubtext: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  changeTrackBtn: {
    minHeight: '36px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--accent-primary)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: 'var(--radius-md)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  securityNotice: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: 1.5,
  },
  signOutButton: {
    minHeight: '40px',
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
