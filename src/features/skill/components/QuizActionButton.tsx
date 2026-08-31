import { useNavigate } from 'react-router-dom';
import { NodeStatus } from '../../track/types/track.types';

interface QuizActionButtonProps {
  nodeId: string;
  status: NodeStatus;
  isLocked: boolean;
}

export function QuizActionButton({ nodeId, status, isLocked }: QuizActionButtonProps) {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    if (isLocked) return;
    navigate(`/app/node/${encodeURIComponent(nodeId)}/quiz`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.infoArea}>
        <h2 style={styles.sectionHeading}>Quiz Checkpoint</h2>
        <p style={styles.subtext}>
          Demonstrate progressive mastery with 5 questions (4/5 required to pass).
        </p>
      </div>

      <div style={styles.actionArea}>
        {isLocked ? (
          <div style={styles.lockedContainer}>
            <button type="button" disabled style={styles.disabledButton} title="Complete prerequisites to unlock">
              🔒 Quiz Locked
            </button>
            <span style={styles.lockedHint}>Complete all required prerequisites above to unlock the quiz.</span>
          </div>
        ) : status === 'completed' ? (
          <div style={styles.completedContainer}>
            <button type="button" onClick={handleStartQuiz} style={styles.retakeButton}>
              Completed ✓ — Retake Quiz
            </button>
            <span style={styles.completedHint}>You have already passed this quiz. Retakes will never remove completed status.</span>
          </div>
        ) : (
          <div style={styles.unlockedContainer}>
            <button type="button" onClick={handleStartQuiz} style={styles.startButton}>
              Start Quiz →
            </button>
            <span style={styles.unlockedHint}>Unlimited retries. Passing unlocks dependent skill nodes.</span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    padding: '24px 28px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    flexWrap: 'wrap',
  },
  infoArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '240px',
  },
  sectionHeading: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtext: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: '1.4',
  },
  actionArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  lockedContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  disabledButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'not-allowed',
  },
  lockedHint: {
    fontSize: '12px',
    color: '#F59E0B',
  },
  unlockedContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  startButton: {
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  unlockedHint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  completedContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  retakeButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--accent-primary)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  completedHint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
};
