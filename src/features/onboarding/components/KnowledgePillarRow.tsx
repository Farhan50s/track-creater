import { PillarItem, PillarSelfReportLevel } from '../types/onboarding.types';

interface KnowledgePillarRowProps {
  pillar: PillarItem;
  selectedLevel: PillarSelfReportLevel;
  onChange: (level: PillarSelfReportLevel) => void;
}

const LEVELS: { value: PillarSelfReportLevel; label: string }[] = [
  { value: 'dont_know', label: "Don't know" },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function KnowledgePillarRow({ pillar, selectedLevel, onChange }: KnowledgePillarRowProps) {
  return (
    <div style={styles.container}>
      <div style={styles.infoSection}>
        <h2 style={styles.pillarName}>{pillar.name}</h2>
        <p style={styles.description}>{pillar.description}</p>
      </div>

      <div style={styles.optionsGrid} role="radiogroup" aria-label={`Knowledge level for ${pillar.name}`}>
        {LEVELS.map((level) => {
          const isSelected = selectedLevel === level.value;
          return (
            <button
              key={level.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(level.value)}
              style={{
                ...styles.optionButton,
                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-primary)',
                color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isSelected ? '600' : '400',
              }}
            >
              {level.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '20px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-surface)',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pillarName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  description: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    margin: 0,
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: '8px',
  },
  optionButton: {
    padding: '10px 8px',
    fontSize: '13px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
    outline: 'none',
  },
};
