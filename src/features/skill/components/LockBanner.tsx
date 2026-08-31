import { Link } from 'react-router-dom';
import { PrerequisiteDetail } from '../types/skill.types';

interface LockBannerProps {
  prerequisites: PrerequisiteDetail[];
}

export function LockBanner({ prerequisites }: LockBannerProps) {
  const incompleteCount = prerequisites.filter((p) => !p.is_completed).length;

  return (
    <div style={styles.banner} role="alert">
      <div style={styles.headerRow}>
        <span style={styles.lockIcon}>🔒</span>
        <span style={styles.title}>
          Progression Locked ({incompleteCount} prerequisite{incompleteCount === 1 ? '' : 's'} remaining)
        </span>
      </div>

      <div style={styles.content}>
        <span style={styles.instruction}>Complete these first:</span>
        <ul style={styles.list}>
          {prerequisites.map((p) => (
            <li key={p.node_id} style={styles.listItem}>
              {p.is_completed ? (
                <span style={styles.completedPrereq}>
                  <span style={styles.checkIcon}>✅</span> {p.name}
                </span>
              ) : (
                <Link to={`/app/node/${encodeURIComponent(p.node_id)}`} style={styles.incompletePrereqLink}>
                  <span style={styles.crossIcon}>❌</span> {p.name} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.35)',
    borderRadius: 'var(--radius-md)',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  lockIcon: {
    fontSize: '16px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#FBBF24',
    letterSpacing: '-0.01em',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '24px',
  },
  instruction: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  listItem: {
    fontSize: '13px',
  },
  completedPrereq: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-muted)',
    textDecoration: 'line-through',
  },
  incompletePrereqLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#F59E0B',
    fontWeight: '600',
    textDecoration: 'underline',
  },
  checkIcon: {
    fontSize: '12px',
  },
  crossIcon: {
    fontSize: '12px',
  },
};
