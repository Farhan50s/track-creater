import { Link } from 'react-router-dom';

interface TrackCompletedCardProps {
  trackName: string;
}

export function TrackCompletedCard({ trackName }: TrackCompletedCardProps) {
  return (
    <div style={styles.card}>
      <span style={styles.icon}>🎓</span>
      <h2 style={styles.title}>All Core Requirements Completed!</h2>
      <p style={styles.text}>
        You have achieved 100% mastery across all required skills in <strong>{trackName}</strong>. You can now explore specialized branches, optional design patterns, and recommended tooling to deepen your expertise.
      </p>
      <Link to="/app/track" style={styles.button}>
        Explore Optional & Specialization Skills →
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    padding: '36px 28px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    borderRadius: 'var(--radius-lg)',
  },
  icon: {
    fontSize: '44px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--accent-primary)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  text: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '560px',
    margin: 0,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    marginTop: '8px',
  },
};
