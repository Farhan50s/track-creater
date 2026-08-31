import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizQuestion } from '../types/quiz.types';
import { QuizOption } from './QuizOption';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelectOption: (optionIndex: number) => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  nodeId: string;
}

export function QuizQuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onSelectOption,
  onNext,
  onSubmit,
  isSubmitting,
  nodeId,
}: QuizQuestionCardProps) {
  const navigate = useNavigate();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasSelectedAnswer = selectedAnswer !== null;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleExitQuiz = () => {
    // Abandoning quiz does NOT create any attempt record in database
    navigate(`/app/node/${encodeURIComponent(nodeId)}`);
  };

  return (
    <div style={styles.card}>
      {/* Top Header Row with Exit button */}
      <div style={styles.topRow}>
        <div style={styles.stepInfo}>
          <span style={styles.stepCounter}>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <div style={styles.progressBarBg}>
            <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowExitConfirm(true)}
          style={styles.exitButton}
          title="Exit Quiz"
        >
          ✕ Exit
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showExitConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Exit Checkpoint?</h3>
            <p style={styles.modalText}>
              Are you sure you want to exit? Your current answers will be discarded and no score will be recorded.
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                style={styles.modalCancelButton}
              >
                Continue Quiz
              </button>
              <button
                type="button"
                onClick={handleExitQuiz}
                style={styles.modalConfirmButton}
              >
                Exit Without Saving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Text */}
      <div style={styles.questionArea}>
        <h2 style={styles.questionText}>{question.question_text}</h2>
      </div>

      {/* Options Group */}
      <div style={styles.optionsList} role="radiogroup" aria-label="Question choices">
        {question.options.map((optionText, idx) => (
          <QuizOption
            key={idx}
            index={idx}
            text={optionText}
            isSelected={selectedAnswer === idx}
            onSelect={() => onSelectOption(idx)}
            disabled={isSubmitting}
          />
        ))}
      </div>

      {/* Bottom Action Row */}
      <div style={styles.bottomRow}>
        <div style={styles.hintArea}>
          {!hasSelectedAnswer && (
            <span style={styles.hintText}>Select an answer to proceed</span>
          )}
        </div>

        <div style={styles.actionArea}>
          {isLastQuestion ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!hasSelectedAnswer || isSubmitting}
              style={{
                ...styles.primaryActionButton,
                ...(!hasSelectedAnswer || isSubmitting ? styles.disabledActionButton : {}),
              }}
            >
              {isSubmitting ? 'Grading Checkpoint...' : 'Submit Checkpoint ✓'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!hasSelectedAnswer}
              style={{
                ...styles.primaryActionButton,
                ...(!hasSelectedAnswer ? styles.disabledActionButton : {}),
              }}
            >
              Next Question →
            </button>
          )}
        </div>
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
    position: 'relative',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  stepInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    maxWidth: '300px',
  },
  stepCounter: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--accent-primary)',
    transition: 'width 0.25s ease',
  },
  exitButton: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  questionArea: {
    padding: '4px 0',
  },
  questionText: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.45',
    margin: 0,
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)',
  },
  hintArea: {
    flex: 1,
  },
  hintText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  actionArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  primaryActionButton: {
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  disabledActionButton: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(4px)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 10,
  },
  modalCard: {
    maxWidth: '420px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  modalText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
  },
  modalActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  modalCancelButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  modalConfirmButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: 'var(--status-error)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: '#ffffff',
    cursor: 'pointer',
  },
};
