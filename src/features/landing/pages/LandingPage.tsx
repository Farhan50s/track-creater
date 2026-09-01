import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection} aria-labelledby="hero-heading">
        <div style={styles.badgeWrapper}>
          <span style={styles.roleBadge}>Role-Aligned Technical Mastery</span>
        </div>

        <h1 id="hero-heading" style={styles.heroHeadline}>
          Master Technical Skills Through Structured, Verified Progression
        </h1>

        <p style={styles.heroSubhead}>
          Explore curriculum trees freely. Unlock official branches by demonstrating
          mastery through server-verified checkpoints.
        </p>

        <div style={styles.ctaGroup}>
          <Link
            to={user ? '/app' : '/signup'}
            style={styles.primaryCta}
            className="focus-ring"
          >
            {user ? 'Go to Dashboard' : 'Start Learning'}
            <span style={{ marginLeft: '6px' }}>→</span>
          </Link>

          {!user && (
            <Link
              to="/login"
              style={styles.secondaryCta}
              className="focus-ring"
            >
              Sign In
            </Link>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={styles.featuresSection} aria-label="Platform Highlights">
        <div style={styles.featuresGrid}>
          {/* Card 1 */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🗺️</div>
            <h2 style={styles.featureTitle}>Interactive Skill Trees</h2>
            <p style={styles.featureDescription}>
              Hierarchical visual roadmaps structured into core pillars, topics, and skill nodes.
              Freely explore advanced concepts while tracking your unlocked progression path.
            </p>
          </div>

          {/* Card 2 */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🛡️</div>
            <h2 style={styles.featureTitle}>Server-Graded Checkpoints</h2>
            <p style={styles.featureDescription}>
              Validated quizzes sampled dynamically from verified question pools. Answer keys
              remain strictly isolated on the server with deterministic 80% passing thresholds.
            </p>
          </div>

          {/* Card 3 */}
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h2 style={styles.featureTitle}>Self-Paced Exploration</h2>
            <p style={styles.featureDescription}>
              Read concise overviews, technical deep dives, and curated resources at your own
              rhythm. Unlock dependent branches automatically as you certify mastery.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <footer style={styles.footerSection}>
        <p style={styles.footerText}>
          Track Creator &copy; {new Date().getFullYear()} &mdash; Built on Progressive Mastery Architecture.
        </p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px 64px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '64px',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '840px',
    margin: '0 auto',
    gap: '20px',
  },
  badgeWrapper: {
    display: 'inline-flex',
  },
  roleBadge: {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '4px 12px',
    borderRadius: '100px',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
  },
  heroHeadline: {
    fontSize: 'clamp(28px, 5vw, 44px)',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: 1.18,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroSubhead: {
    fontSize: 'clamp(16px, 2.5vw, 19px)',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    maxWidth: '680px',
    margin: 0,
  },
  ctaGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '12px',
  },
  primaryCta: {
    minHeight: '48px',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    borderRadius: 'var(--radius-md)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.15s ease',
  },
  secondaryCta: {
    minHeight: '48px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  featuresSection: {
    width: '100%',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.15s ease, border-color 0.15s ease',
  },
  featureIcon: {
    fontSize: '28px',
    lineHeight: 1,
    marginBottom: '4px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  featureDescription: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    margin: 0,
  },
  footerSection: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '28px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    margin: 0,
  },
};
