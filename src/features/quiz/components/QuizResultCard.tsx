import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QuizAttemptResult, QuizSkillContext } from '../types/quiz.types';

interface QuizResultCardProps {
  result: QuizAttemptResult;
  skillContext: QuizSkillContext;
  onRetry: () => void;
}

export function QuizResultCard({ result, skillContext, onRetry }: QuizResultCardProps) {
  const isPassed = result.passed; // score >= 4
  const [showReview, setShowReview] = useState(!isPassed); // Default open on fail, closed on pass
  const nextTargetUrl = skillContext.nextNodeId
    ? `/app/node/${encodeURIComponent(skillContext.nextNodeId)}`
    : `/app/track/${encodeURIComponent(skillContext.pillarId)}`;

  const reviewItems = result.review || [];

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

      {/* Post-Quiz Explanation Review Section */}
      {reviewItems.length > 0 && (
        <div style={styles.reviewWrapper}>
          <button
            type="button"
            onClick={() => setShowReview((prev) => !prev)}
            style={styles.reviewToggleBtn}
          >
            <span>{showReview ? '▼' : '►'} Question-by-Question Review & Explanations ({reviewItems.length})</span>
            <span style={styles.reviewToggleBadge}>
              {result.score} / 5 Correct
            </span>
          </button>

          {showReview && (
            <div style={styles.reviewList}>
              {reviewItems.map((item, qIdx) => {
                const isCorrect = item.is_correct;
                return (
                  <div key={item.question_id || qIdx} style={styles.reviewItemCard}>
                    <div style={styles.reviewItemHeader}>
                      <span style={isCorrect ? styles.qStatusCorrect : styles.qStatusIncorrect}>
                        {isCorrect ? '✓ Correct' : '✗ Missed'}
                      </span>
                      <span style={styles.qNumber}>Question {qIdx + 1} of 5</span>
                    </div>

                    <p style={styles.reviewQuestionText}>{item.question_text}</p>

                    <div style={styles.reviewOptionsList}>
                      {item.options.map((optText, optIdx) => {
                        const isUserChoice = optIdx === item.selected_index;
                        const isActualCorrect = optIdx === item.correct_index;

                        let optStyle = styles.reviewOptionNeutral;
                        let badgeText: string | null = null;
                        let badgeStyle = styles.optBadgeNeutral;

                        if (isUserChoice && isActualCorrect) {
                          optStyle = styles.reviewOptionCorrect;
                          badgeText = 'Your Choice (Correct)';
                          badgeStyle = styles.optBadgeSuccess;
                        } else if (isUserChoice && !isActualCorrect) {
                          optStyle = styles.reviewOptionIncorrect;
                          badgeText = 'Your Choice (Incorrect)';
                          badgeStyle = styles.optBadgeDanger;
                        } else if (!isUserChoice && isActualCorrect) {
                          optStyle = styles.reviewOptionCorrectAnswer;
                          badgeText = 'Correct Answer';
                          badgeStyle = styles.optBadgeSuccess;
                        }

                        return (
                          <div key={optIdx} style={optStyle}>
                            <div style={styles.optionContentRow}>
                              <span style={styles.optionLetter}>
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span style={styles.optionText}>{optText}</span>
                            </div>
                            {badgeText && (
                              <span style={badgeStyle}>{badgeText}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {item.explanation && (
                      <div style={styles.explanationBox}>
                        <div style={styles.explanationHeader}>💡 Explanation:</div>
                        <div style={styles.explanationText}>{item.explanation}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    padding: '36px 28px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
    alignItems: 'center',
    maxWidth: '680px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
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
    padding: '20px 32px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: 'var(--radius-md)',
    width: '100%',
    maxWidth: '400px',
  },
  scoreContainerFailed: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '20px 32px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 'var(--radius-md)',
    width: '100%',
    maxWidth: '400px',
  },
  scoreRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  scoreNumber: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'var(--accent-primary)',
    letterSpacing: '-0.02em',
  },
  scoreNumberFailed: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: '-0.02em',
  },
  scoreLabel: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
  },
  completionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: '4px 12px',
    borderRadius: '9999px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '460px',
  },
  primaryActionLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    backgroundColor: 'var(--accent-primary)',
    color: '#09090b',
    textDecoration: 'none',
    borderRadius: 'var(--radius-md)',
    fontWeight: '700',
    fontSize: '15px',
    transition: 'all 0.2s ease',
  },
  secondaryActionRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  secondaryActionLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 18px',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
  retakeQuizButton: {
    padding: '10px 18px',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  retryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '15px',
    transition: 'all 0.2s ease',
  },

  // Review Sheet Styles
  reviewWrapper: {
    width: '100%',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '24px',
    textAlign: 'left',
  },
  reviewToggleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  reviewToggleBadge: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '16px',
  },
  reviewItemCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '18px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
  },
  reviewItemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qStatusCorrect: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  qStatusIncorrect: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  qNumber: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  reviewQuestionText: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    margin: '4px 0 8px 0',
  },
  reviewOptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  reviewOptionNeutral: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  reviewOptionCorrect: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid #10b981',
    fontSize: '14px',
    color: '#10b981',
    fontWeight: '600',
  },
  reviewOptionIncorrect: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid #ef4444',
    fontSize: '14px',
    color: '#ef4444',
    fontWeight: '600',
  },
  reviewOptionCorrectAnswer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    border: '1px dashed #10b981',
    fontSize: '14px',
    color: '#10b981',
    fontWeight: '500',
  },
  optionContentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  optionLetter: {
    fontWeight: '700',
    color: 'inherit',
    opacity: 0.8,
  },
  optionText: {
    color: 'inherit',
    lineHeight: '1.4',
  },
  optBadgeNeutral: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  optBadgeSuccess: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    marginLeft: '8px',
  },
  optBadgeDanger: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    marginLeft: '8px',
  },
  explanationBox: {
    marginTop: '6px',
    padding: '12px 14px',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(51, 65, 85, 0.6)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    color: '#cbd5e1',
    lineHeight: '1.5',
  },
  explanationHeader: {
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: '4px',
  },
  explanationText: {
    color: '#94a3b8',
  },
};
