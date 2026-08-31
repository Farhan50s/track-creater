import { Link } from 'react-router-dom';
import { PrerequisiteDetail } from '../types/skill.types';

interface PrerequisitesListProps {
  prerequisites: PrerequisiteDetail[];
}

export function PrerequisitesList({ prerequisites }: PrerequisitesListProps) {
  return (
    <div style={styles.container}>
      <h2 style={styles.sectionHeading}>Prerequisites</h2>

      {prerequisites.length === 0 ? (
        <p style={styles.emptyText}>No prerequisites — this skill can be learned immediately.</p>
      ) : (
        <ul style={styles.list}>
          {prerequisites.map((p) => (
            <li key={p.node_id} style={styles.listItem}>
              <span style={styles.statusIcon} title={p.is_completed ? 'Completed' : 'Incomplete'}>
                {p.is_completed ? '✅' : '⚪'}
              </span>
              <Link to={`/app/node/${encodeURIComponent(p.node_id)}`} style={styles.prereqLink}>
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '24px 28px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
  },
  sectionHeading: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: 0,
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  statusIcon: {
    fontSize: '14px',
    flexShrink: 0,
  },
  prereqLink: {
    color: 'var(--accent-primary)',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'text-decoration 0.15s ease',
  },
};
