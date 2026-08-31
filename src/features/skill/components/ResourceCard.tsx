import { ResourceItem, ResourceTag } from '../types/skill.types';

interface ResourceCardProps {
  resource: ResourceItem;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const getTagBadge = (tag: ResourceTag) => {
    switch (tag) {
      case 'start_here':
        return <span style={{ ...styles.tagBadge, ...styles.startHereTag }}>Start Here</span>;
      case 'alternative':
        return <span style={{ ...styles.tagBadge, ...styles.alternativeTag }}>Alternative</span>;
      case 'practice':
        return <span style={{ ...styles.tagBadge, ...styles.practiceTag }}>Practice</span>;
      case 'reference':
        return <span style={{ ...styles.tagBadge, ...styles.referenceTag }}>Reference</span>;
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.badgeRow}>
          {getTagBadge(resource.tag)}
          <span style={styles.typeBadge}>{resource.type}</span>
        </div>

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.titleLink}
        >
          <span style={styles.titleText}>{resource.title}</span>
          <span style={styles.externalIcon} aria-hidden="true">
            ↗
          </span>
        </a>
      </div>

      {resource.why && <p style={styles.whyText}>{resource.why}</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px 20px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tagBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  startHereTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
  },
  alternativeTag: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
  },
  practiceTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#60A5FA',
    border: '1px solid rgba(59, 130, 246, 0.3)',
  },
  referenceTag: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
  },
  typeBadge: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'capitalize',
  },
  titleLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
  },
  titleText: {
    transition: 'color 0.15s ease',
  },
  externalIcon: {
    fontSize: '14px',
    color: 'var(--accent-primary)',
  },
  whyText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
  },
};
