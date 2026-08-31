interface DefinitionSectionProps {
  definition: string;
  whyItMatters: string;
}

export function DefinitionSection({ definition, whyItMatters }: DefinitionSectionProps) {
  return (
    <div style={styles.container}>
      <div style={styles.block}>
        <h2 style={styles.sectionHeading}>What is it?</h2>
        <p style={styles.definitionText}>{definition}</p>
      </div>

      <div style={styles.block}>
        <h2 style={styles.sectionHeading}>Why does it matter?</h2>
        <p style={styles.whyText}>{whyItMatters}</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '24px 28px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
  },
  block: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionHeading: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: 0,
  },
  definitionText: {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    lineHeight: '1.6',
    margin: 0,
  },
  whyText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: 0,
  },
};
