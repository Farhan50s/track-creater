import { PillarProgressSummary } from '../types/dashboard.types';
import { ActivePillarCard } from './ActivePillarCard';

interface ActiveLearningSectionProps {
  pillars: PillarProgressSummary[];
}

export function ActiveLearningSection({ pillars }: ActiveLearningSectionProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Active Learning</h2>
        <span style={styles.subtitle}>
          Progressing in parallel across pillars with independent focus nodes
        </span>
      </div>

      <div style={styles.grid}>
        {pillars.map((pillar) => (
          <ActivePillarCard key={pillar.pillarId} pillar={pillar} />
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
};
