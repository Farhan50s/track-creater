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

  const reviewItems = result.review || [];
  const correctCount = reviewItems.filter((r) => r.is_correct).length;

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
              You scored <strong>{result.score} / 5</strong>. A score of 4 or 5 is required to earn completion. Review guided cues below—correct answers remain locked until mastery!
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

      {/* Review Section */}
      {reviewItems.length > 0 ? (
        <div style={styles.reviewContainer}>
          <div style={styles.reviewHeaderRow}>
            <div>
              <h3 style={styles.reviewHeading}>
                {isPassed ? 'Question Review & Explanations' : 'Guided Remediation Review'}
              </h3>
              <p style={styles.reviewSubhead}>
                {isPassed
                  ? 'All explanation cards and answer keys unlocked.'
                  : 'Answers are hidden to foster active recall. Review guided cues before retrying.'}
              </p>
            </div>
            <span style={styles.reviewBadge}>
              {correctCount} of {reviewItems.length} Correct
            </span>
          </div>

          <div style={styles.reviewList}>
            {reviewItems.map((item, idx) => {
              const isItemCorrect = item.is_correct;

              return (
                <div
                  key={item.question_id || idx}
                  style={{
                    ...styles.reviewCard,
                    borderColor: isItemCorrect
                      ? 'rgba(16, 185, 129, 0.35)'
                      : 'rgba(244, 63, 94, 0.35)',
                    backgroundColor: isItemCorrect
                      ? 'rgba(6, 78, 59, 0.18)'
                      : 'rgba(136, 19, 55, 0.18)',
                  }}
                >
                  <div style={styles.qTitleRow}>
                    <span
                      style={{
                        ...styles.qTag,
                        backgroundColor: isItemCorrect ? '#065f46' : '#9f1239',
                        color: isItemCorrect ? '#d1fae5' : '#ffe4e6',
                      }}
                    >
                      Q{idx + 1}
                    </span>
                    <p style={styles.qText}>{item.question_text}</p>
                  </div>

                  <div style={styles.optionsList}>
                    {item.options.map((opt, optIdx) => {
                      const isUserChoice = item.selected_index === optIdx;
                      const isActualCorrect = item.correct_index === optIdx;

                      let badge = null;
                      let optionItemStyle = { ...styles.optionItemNeutral };

                      if (isPassed) {
                        // PASSED STATE: Full Answer Key Unlocked
                        if (isActualCorrect) {
                          badge = (
                            <span style={styles.correctBadge}>✓ Correct Answer</span>
                          );
                          optionItemStyle = {
                            ...styles.optionItemNeutral,
                            borderColor: 'rgba(16, 185, 129, 0.6)',
                            backgroundColor: 'rgba(6, 78, 59, 0.35)',
                            color: '#a7f3d0',
                            fontWeight: '600',
                          };
                        } else if (isUserChoice && !isActualCorrect) {
                          badge = (
                            <span style={styles.incorrectBadge}>✗ Your Choice</span>
                          );
                          optionItemStyle = {
                            ...styles.optionItemNeutral,
                            borderColor: 'rgba(244, 63, 94, 0.6)',
                            backgroundColor: 'rgba(136, 19, 55, 0.35)',
                            color: '#fecdd3',
                            fontWeight: '600',
                          };
                        }
                      } else {
                        // FAILED / REMEDIATION STATE: No Answer Spoiling
                        if (isItemCorrect && isUserChoice) {
                          badge = (
                            <span style={styles.correctBadge}>✓ Correct</span>
                          );
                          optionItemStyle = {
                            ...styles.optionItemNeutral,
                            borderColor: 'rgba(16, 185, 129, 0.6)',
                            backgroundColor: 'rgba(6, 78, 59, 0.35)',
                            color: '#a7f3d0',
                            fontWeight: '600',
                          };
                        } else if (!isItemCorrect && isUserChoice) {
                          // Flag ONLY the user's incorrect choice in rose
                          badge = (
                            <span style={styles.incorrectBadge}>✗ Your Choice</span>
                          );
                          optionItemStyle = {
                            ...styles.optionItemNeutral,
                            borderColor: 'rgba(244, 63, 94, 0.6)',
                            backgroundColor: 'rgba(136, 19, 55, 0.35)',
                            color: '#fecdd3',
                            fontWeight: '600',
                          };
                        }
                        // Other options remain completely neutral with NO green badge!
                      }

                      return (
                        <div key={optIdx} style={optionItemStyle}>
                          <span style={styles.optionLabel}>{opt}</span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback / Remediation Box */}
                  {isPassed ? (
                    /* UNLOCKED FULL EXPLANATION */
                    item.explanation && (
                      <div style={styles.explanationBox}>
                        <span style={styles.explanationPrefix}>💡 Explanation: </span>
                        <span style={styles.explanationContent}>{item.explanation}</span>
                      </div>
                    )
                  ) : (
                    /* GUIDED REMEDIATION BOX (NO SPOILERS) */
                    !isItemCorrect && (
                      <div style={styles.remediationBox}>
                        <div style={styles.remediationHeader}>
                          <span style={styles.remediationIcon}>🔍</span>
                          <span style={styles.remediationTitle}>
                            Concept to Review:{' '}
                            <strong style={styles.remediationConcept}>
                              {extractConceptHint(item.question_text, skillContext.name)}
                            </strong>
                          </span>
                        </div>
                        <p style={styles.remediationDescription}>
                          Revisit the definitions, code examples, and architecture guidelines in the lesson before re-attempting this checkpoint.
                        </p>
                        <div style={styles.remediationActionRow}>
                          <Link
                            to={`/app/node/${encodeURIComponent(skillContext.nodeId)}`}
                            style={styles.remediationLink}
                          >
                            Jump to Lesson Section →
                          </Link>
                        </div>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={styles.noReviewFallback}>
          Review data not available for this attempt.
        </div>
      )}
    </div>
  );
}

function extractConceptHint(questionText: string, skillName: string): string {
  const clean = questionText.trim();
  // Remove common question prefixes
  const stripped = clean
    .replace(/^(which of the following|what is the primary|what is the purpose of|how does|why is|what does|in|when using)\s+/i, '')
    .replace(/\?$/, '');

  if (stripped.length > 0 && stripped.length < 80) {
    return stripped.charAt(0).toUpperCase() + stripped.slice(1);
  }
  return `${skillName} Core Principles`;
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

  // Review Styles
  reviewContainer: {
    width: '100%',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '24px',
    textAlign: 'left',
  },
  reviewHeaderRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '16px',
    gap: '12px',
    flexWrap: 'wrap',
  },
  reviewHeading: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  reviewSubhead: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '4px 0 0 0',
  },
  reviewBadge: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    whiteSpace: 'nowrap',
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  reviewCard: {
    padding: '18px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  qTitleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  qTag: {
    fontSize: '12px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    flexShrink: 0,
    marginTop: '2px',
  },
  qText: {
    fontSize: '14.5px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    margin: 0,
    textAlign: 'left',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '28px',
  },
  optionItemNeutral: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '13px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: 'var(--text-secondary)',
  },
  optionLabel: {
    textAlign: 'left',
    lineHeight: '1.4',
  },
  correctBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#34d399',
    marginLeft: 'auto',
    paddingLeft: '8px',
    whiteSpace: 'nowrap',
  },
  incorrectBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#fb7185',
    marginLeft: 'auto',
    paddingLeft: '8px',
    whiteSpace: 'nowrap',
  },

  // Explanation Box (Passed state)
  explanationBox: {
    marginTop: '4px',
    marginLeft: '28px',
    padding: '12px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    border: '1px solid rgba(51, 65, 85, 0.7)',
    fontSize: '13px',
    color: '#cbd5e1',
    textAlign: 'left',
    lineHeight: '1.5',
  },
  explanationPrefix: {
    fontWeight: '700',
    color: '#fbbf24',
  },
  explanationContent: {
    color: '#cbd5e1',
  },

  // Remediation Guide Box (Failed state)
  remediationBox: {
    marginTop: '4px',
    marginLeft: '28px',
    padding: '14px 16px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(71, 85, 105, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
  },
  remediationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
  },
  remediationIcon: {
    fontSize: '14px',
  },
  remediationTitle: {
    color: '#94a3b8',
  },
  remediationConcept: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  remediationDescription: {
    fontSize: '12.5px',
    color: '#cbd5e1',
    lineHeight: '1.4',
    margin: 0,
  },
  remediationActionRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '2px',
  },
  remediationLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12.5px',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },

  noReviewFallback: {
    marginTop: '20px',
    padding: '12px 16px',
    backgroundColor: 'rgba(69, 26, 3, 0.3)',
    border: '1px solid rgba(146, 64, 14, 0.5)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    color: '#fcd34d',
    width: '100%',
  },
};
