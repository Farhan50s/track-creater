import { Link } from 'react-router-dom';

interface QuizStartCardProps {
  skillName: string;
  nodeId: string;
  onStart: () => void;
}

export function QuizStartCard({ skillName, nodeId, onStart }: QuizStartCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.badge}>Skill Checkpoint</span>
        <h1 style={styles.title}>{skillName}</h1>
        <p style={styles.subtitle}>
          Verify your understanding with a short knowledge check. Passing this checkpoint marks the skill as completed and unlocks dependent nodes.
        </p>
      </div>

      <div style={styles.rulesContainer}>
        <div style={styles.ruleItem}>
          <span style={styles.ruleIcon}>📝</span>
          <div style={styles.ruleContent}>
            <span style={styles.ruleTitle}>5 Questions</span>
            <span style={styles.ruleDesc}>Selected at random from the skill question pool</span>
          </div>
        </div>

        <div style={styles.ruleItem}>
          <span style={styles.ruleIcon}>🎯</span>
          <div style={styles.ruleContent}>
            <span style={styles.ruleTitle}>4 / 5 Required to Pass</span>
            <span style={styles.ruleDesc}>Score 4 or 5 correct answers to earn completion</span>
          </div>
        </div>

        <div style={styles.ruleItem}>
          <span style={styles.ruleIcon}>🔄</span>
          <div style={styles.ruleContent}>
            <span style={styles.ruleTitle}>Unlimited Retries</span>
            <span style={styles.ruleDesc}>No penalties for retaking. Review material anytime</span>
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <button type="button" onClick={onStart} style={styles.startButton}>
          Start Quiz Checkpoint →
        </button>
        <Link to={`/app/node/${encodeURIComponent(nodeId)}`} style={styles.backLink}>
          ← Back to Skill Overview
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    padding: '36px 32px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: '3px 10px',
    borderRadius: 'var(--radius-sm)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: 0,
  },
  rulesContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    padding: '20px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  ruleIcon: {
    fontSize: '20px',
    flexShrink: 0,
    marginTop: '2px',
  },
  ruleContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  ruleTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  ruleDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  startButton: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  backLink: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  },
};
