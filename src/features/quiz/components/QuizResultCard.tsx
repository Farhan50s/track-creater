import { Link } from 'react-router-dom';
import { QuizAttemptResult, QuizSkillContext } from '../types/quiz.types';

interface QuizResultCardProps {
  result: QuizAttemptResult;
  skillContext: QuizSkillContext;
  onRetry: () => void;
}

export function QuizResultCard({ result, skillContext, onRetry }: QuizResultCardProps) {
  const isPassed = result.passed; // score >= 4
  const nextTargetUrl = skillContext.nextNodeId
    ? `/app/node/${encodeURIComponent(skillContext.nextNodeId)}`
    : `/app/track/${encodeURIComponent(skillContext.pillarId)}`;

  return (
    <div style={styles.card}>
      {isPassed ? (
        /* PASSED STATE (score >= 4) */
        <>
          <div style={styles.header}>
            <span style={styles.celebrationIcon}>🎉</span>
            <h1 style={styles.passedTitle}>Checkpoint Passed!</h1>
            <p style={styles.passedSubtitle}>
              Congratulations! You demonstrated mastery of <strong>{skillContext.name}</strong>.
            </p>
          </div>

          <div style={styles.scoreContainerPassed}>
            <div style={styles.scoreRow}>
              <span style={styles.scoreNumber}>{result.score} / 5</span>
              <span style={styles.scoreLabel}>Correct Answers</span>
            </div>
            <div style={styles.completionBadge}>
              <span>✓</span> Skill Completed
            </div>
          </div>

          <div style={styles.actions}>
            <Link to={nextTargetUrl} style={styles.primaryActionLink}>
              {skillContext.nextNodeId ? (
                <>Continue to Next Skill ({skillContext.nextNodeName || 'Next'}) →</>
              ) : (
                <>Return to Pillar Overview →</>
              )}
            </Link>

            <div style={styles.secondaryActionRow}>
              <Link
                to={`/app/node/${encodeURIComponent(skillContext.nodeId)}`}
                style={styles.secondaryActionLink}
              >
                Review Skill Content
              </Link>
              <button type="button" onClick={onRetry} style={styles.retakeQuizButton}>
                Retake Quiz for Practice
              </button>
            </div>
          </div>
        </>
      ) : (
        /* FAILED STATE (score < 4) */
        <>
          <div style={styles.header}>
            <span style={styles.failIcon}>💡</span>
            <h1 style={styles.failedTitle}>Keep Learning</h1>
            <p style={styles.failedSubtitle}>
              You scored <strong>{result.score} / 5</strong>. A score of 4 or 5 is required to earn completion. Review the material and try again—retries are unlimited!
            </p>
          </div>

          <div style={styles.scoreContainerFailed}>
            <div style={styles.scoreRow}>
              <span style={styles.scoreNumberFailed}>{result.score} / 5</span>
              <span style={styles.scoreLabel}>Correct (4 required to pass)</span>
            </div>
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onRetry} style={styles.retryButton}>
              Retry Quiz Checkpoint ↻
            </button>

            <Link
              to={`/app/node/${encodeURIComponent(skillContext.nodeId)}`}
              style={styles.secondaryActionLink}
            >
              Review Skill Material
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    padding: '40px 32px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
    alignItems: 'center',
    maxWidth: '640px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  celebrationIcon: {
    fontSize: '44px',
  },
  failIcon: {
    fontSize: '44px',
  },
  passedTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--accent-primary)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  failedTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  passedSubtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
    maxWidth: '480px',
  },
  failedSubtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
    maxWidth: '480px',
  },
  scoreContainerPassed: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 48px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    boxSizing: 'border-box',
  },
  scoreContainerFailed: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '24px 48px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    boxSizing: 'border-box',
  },
  scoreRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  scoreNumber: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'var(--accent-primary)',
    lineHeight: '1',
  },
  scoreNumberFailed: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1',
  },
  scoreLabel: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  completionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: 'var(--accent-primary)',
    fontSize: '13px',
    fontWeight: '700',
    padding: '4px 14px',
    borderRadius: 'var(--radius-full)',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
  },
  primaryActionLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'background-color 0.15s ease',
  },
  retryButton: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.15s ease',
  },
  secondaryActionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  secondaryActionLink: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  },
  retakeQuizButton: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};
