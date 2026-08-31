import { Link } from 'react-router-dom';

interface BreadcrumbsProps {
  currentPillarName: string;
}

export function Breadcrumbs({ currentPillarName }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" style={styles.nav}>
      <ol style={styles.list}>
        <li style={styles.item}>
          <Link to="/app/track" style={styles.link}>
            Track Overview
          </Link>
        </li>
        <li style={styles.separator} aria-hidden="true">
          /
        </li>
        <li style={{ ...styles.item, ...styles.current }} aria-current="page">
          {currentPillarName}
        </li>
      </ol>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    marginBottom: '20px',
  },
  list: {
    display: 'flex',
    alignItems: 'center',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: '8px',
    fontSize: '13px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  separator: {
    color: 'var(--text-muted)',
    fontSize: '12px',
  },
  link: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  },
  current: {
    color: 'var(--text-primary)',
    fontWeight: '500',
  },
};
