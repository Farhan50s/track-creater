import { ResourceItem } from '../types/skill.types';
import { ResourceCard } from './ResourceCard';

interface ResourceSectionProps {
  resources: ResourceItem[];
}

export function ResourceSection({ resources }: ResourceSectionProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.sectionHeading}>Curated Resources</h2>
        <span style={styles.subtext}>Hand-picked references and practice material</span>
      </div>

      {resources.length === 0 ? (
        <p style={styles.emptyText}>No external resources attached to this skill node.</p>
      ) : (
        <div style={styles.resourceList}>
          {resources.map((resource) => (
            <ResourceCard key={resource.resource_id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px 28px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionHeading: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: 0,
  },
  subtext: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  resourceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
};
