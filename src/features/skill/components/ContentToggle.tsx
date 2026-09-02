import { useState } from 'react';
import { MarkdownRenderer } from '../../../components/MarkdownRenderer';

interface ContentToggleProps {
  quickOverview: string;
  deepDive: string | null;
}

export function ContentToggle({ quickOverview, deepDive }: ContentToggleProps) {
  const [isDeepDiveExpanded, setIsDeepDiveExpanded] = useState(false);
  const hasDeepDive = Boolean(deepDive && deepDive.trim().length > 0);

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.sectionHeading}>Skill Content</h2>
        {hasDeepDive && (
          <button
            type="button"
            onClick={() => setIsDeepDiveExpanded((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsDeepDiveExpanded((prev) => !prev);
              }
            }}
            style={styles.toggleButton}
            aria-expanded={isDeepDiveExpanded}
            aria-controls="skill-deep-dive-section"
            aria-label={isDeepDiveExpanded ? 'Collapse deep dive section' : 'Expand deep dive section'}
          >
            {isDeepDiveExpanded ? '▾ Collapse Deep Dive' : '▸ Expand Deep Dive'}
          </button>
        )}
      </div>

      <div style={styles.quickOverviewSection}>
        <h3 style={styles.subHeading}>Quick Overview</h3>
        <div style={styles.contentBody}>
          <MarkdownRenderer content={quickOverview} />
        </div>
      </div>

      {hasDeepDive && isDeepDiveExpanded && (
        <div id="skill-deep-dive-section" style={styles.deepDiveSection}>
          <h3 style={styles.subHeading}>Deep Dive</h3>
          <div style={styles.contentBody}>
            <MarkdownRenderer content={deepDive!} />
          </div>
        </div>
      )}
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
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  sectionHeading: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: 0,
  },
  toggleButton: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--accent-primary)',
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  quickOverviewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  deepDiveSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
  },
  subHeading: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  },
  contentBody: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
};
