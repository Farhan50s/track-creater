import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTopicDiagnostic } from '../hooks/useTopicDiagnostic';
import { LoadingFallback } from '../../../components/LoadingFallback';
import { DEPTH_THEMES } from '../../../utils/depthTheme';

export function DiagnosticPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const {
    state,
    context,
    servedQuestions,
    currentIndex,
    selectedAnswers,
    result,
    error,
    isSubmitting,
    answeredCount,
    startDiagnostic,
    selectOption,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitDiagnostic,
    retryDiagnostic,
  } = useTopicDiagnostic(topicId);

  if (state === 'loading') {
    return <LoadingFallback />;
  }

  if (state === 'error' || !context) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{error || 'Unable to load topic diagnostic.'}</p>
          <div style={styles.errorActions}>
            <Link to="/app/track" style={styles.backLink}>
              ← Return to Track Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = servedQuestions[currentIndex];
  const l2Theme = DEPTH_THEMES[2];

  return (
    <div style={styles.container}>
      {/* 1. Hierarchy Breadcrumbs */}
      <nav aria-label="Diagnostic Breadcrumb" style={styles.breadcrumbNav}>
        <ol style={styles.breadcrumbList}>
          <li style={styles.breadcrumbItem}>
            <Link to="/app/track" style={styles.breadcrumbRootLink}>
              <span>🗺️ Track</span>
            </Link>
          </li>
          <li style={styles.breadcrumbSeparator}>›</li>
          <li style={styles.breadcrumbItem}>
            <Link
              to={`/app/track/${encodeURIComponent(context.pillarId)}`}
              className="bg-blue-950/40 text-blue-300 border-blue-800/50"
              style={styles.breadcrumbPillar}
            >
              <span style={styles.levelTag}>L1</span>
              <span>{context.pillarName}</span>
            </Link>
          </li>
          <li style={styles.breadcrumbSeparator}>›</li>
          <li style={styles.breadcrumbItem}>
            <span
              className={`${l2Theme.badgeBg} ${l2Theme.badgeText} ${l2Theme.badgeBorder}`}
              style={styles.breadcrumbTopic}
            >
              <span style={styles.levelTag}>L2</span>
              <span>{context.topicName}</span>
            </span>
          </li>
          <li style={styles.breadcrumbSeparator}>›</li>
          <li style={styles.breadcrumbItem}>
            <span style={styles.breadcrumbCurrent}>
              <span>⚡ Topic Diagnostic</span>
            </span>
          </li>
        </ol>
      </nav>

      {/* 2. STATE: READY (Diagnostic Start Card) */}
      {state === 'ready' && (
        <div style={styles.card}>
          <div style={styles.startHeader}>
            <span style={styles.startIcon}>⚡</span>
            <div
              className={`${l2Theme.badgeBg} ${l2Theme.badgeText} ${l2Theme.badgeBorder} border rounded px-2.5 py-1 text-xs font-mono font-bold inline-block`}
            >
              Level 2 Topic Diagnostic
            </div>
            <h1 style={styles.startTitle}>{context.topicName}</h1>
            <p style={styles.startSubtitle}>
              Already skilled in this topic? Test out with a 10-question diagnostic exam.
              Scoring <strong>80% (8/10)</strong> or higher will instantly mark all skills in this topic as <strong>completed</strong> and unlock downstream material.
            </p>
          </div>

          {/* Scope Card */}
          <div style={styles.scopeSection}>
            <h3 style={styles.scopeHeading}>Skills Included in this Topic:</h3>
            <div style={styles.nodeList}>
              {context.childNodes.map((node) => {
                const isCompleted = node.status === 'completed';
                return (
                  <div key={node.node_id} style={styles.nodeItem}>
                    <span style={isCompleted ? styles.nodeCompletedBadge : styles.nodePendingBadge}>
                      {isCompleted ? '✓ Completed' : '○ Pending'}
                    </span>
                    <span style={styles.nodeName}>{node.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exam Rules & Safeguards */}
          <div style={styles.rulesCard}>
            <div style={styles.ruleItem}>
              <span style={styles.ruleBullet}>•</span>
              <span><strong>10 Questions</strong> evenly sampled across all child skills in this topic.</span>
            </div>
            <div style={styles.ruleItem}>
              <span style={styles.ruleBullet}>•</span>
              <span><strong>80% Pass Threshold:</strong> Score at least 8 out of 10 to test out.</span>
            </div>
            <div style={styles.ruleItem}>
              <span style={styles.ruleBullet}>•</span>
              <span><strong>Zero Risk:</strong> If you don't pass, your existing progress is completely preserved. You can never lose previously completed skills.</span>
            </div>
          </div>

          {/* Action Row */}
          <div style={styles.startActions}>
            <button
              type="button"
              onClick={startDiagnostic}
              style={styles.startExamButton}
            >
              Begin Diagnostic Exam ⚡
            </button>
            <Link
              to={`/app/track/${encodeURIComponent(context.pillarId)}`}
              style={styles.cancelLink}
            >
              ← Back to Track Map
            </Link>
          </div>
        </div>
      )}

      {/* 3. STATE: IN PROGRESS / SUBMITTING */}
      {(state === 'in_progress' || state === 'submitting') && currentQuestion && (
        <div style={styles.examContainer}>
          {/* Stepper Header */}
          <div style={styles.stepperHeader}>
            <div style={styles.stepperMetaRow}>
              <div style={styles.stepperTitleGroup}>
                <span style={styles.stepperTopicPill}>{context.topicName}</span>
                <span style={styles.stepperQuestionIndex}>
                  Question {currentIndex + 1} of {servedQuestions.length}
                </span>
              </div>
              <span style={styles.stepperAnsweredBadge}>
                {answeredCount} / {servedQuestions.length} Answered
              </span>
            </div>

            {/* Stepper Buttons (1 to 10) */}
            <div style={styles.stepperPillsRow} role="tablist" aria-label="Question Navigation">
              {servedQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = selectedAnswers[idx] !== null;
                return (
                  <button
                    key={q.question_id}
                    type="button"
                    onClick={() => goToQuestion(idx)}
                    style={{
                      ...styles.stepperPill,
                      ...(isCurrent ? styles.stepperPillActive : {}),
                      ...(isAnswered && !isCurrent ? styles.stepperPillAnswered : {}),
                    }}
                    title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                    aria-label={`Jump to Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Card */}
          <div style={styles.card}>
            <div style={styles.questionHeader}>
              <span style={styles.questionNodeTag}>
                Skill Node: {context.childNodes.find((n) => n.node_id === currentQuestion.node_id)?.name || currentQuestion.node_id}
              </span>
              <h2 style={styles.questionText}>{currentQuestion.question_text}</h2>
            </div>

            {/* Options */}
            <div
              style={styles.optionsList}
              role="radiogroup"
              aria-label={currentQuestion.question_text}
            >
              {currentQuestion.options.map((optionText, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => selectOption(optIdx)}
                    style={{
                      ...styles.optionButton,
                      ...(isSelected ? styles.optionButtonSelected : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.optionRadioCircle,
                        ...(isSelected ? styles.optionRadioCircleSelected : {}),
                      }}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span style={styles.optionLabel}>{optionText}</span>
                  </button>
                );
              })}
            </div>

            {/* Error Message if submit attempted prematurely */}
            {error && (
              <div style={styles.inlineErrorBox}>
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Navigation & Submit Bar */}
            <div style={styles.examNavBar}>
              <button
                type="button"
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                style={{
                  ...styles.navPrevButton,
                  ...(currentIndex === 0 ? styles.navButtonDisabled : {}),
                }}
              >
                ← Previous
              </button>

              <div style={styles.navRightGroup}>
                {currentIndex < servedQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextQuestion}
                    style={styles.navNextButton}
                  >
                    Next Question →
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={submitDiagnostic}
                  disabled={isSubmitting}
                  style={{
                    ...styles.navSubmitButton,
                    ...(isSubmitting ? styles.navButtonDisabled : {}),
                  }}
                >
                  {isSubmitting
                    ? 'Grading Diagnostic...'
                    : `Submit Diagnostic (${answeredCount}/10) ⚡`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. STATE: RESULT */}
      {state === 'result' && result && (
        <div style={styles.card}>
          {result.passed ? (
            /* PASSED STATE (score >= 8) */
            <>
              <div style={styles.resultHeader}>
                <span style={styles.celebrationIcon}>🏆</span>
                <div style={styles.passedPill}>Diagnostic Passed · 80% Threshold Met</div>
                <h1 style={styles.resultTitle}>Topic Mastered!</h1>
                <p style={styles.resultSubtitle}>
                  Outstanding performance! You proved mastery of <strong>{context.topicName}</strong> with a score of <strong>{result.score} / 10 ({result.score * 10}%)</strong>.
                </p>
              </div>

              <div style={styles.scoreContainerPassed}>
                <div style={styles.scoreRow}>
                  <span style={styles.scoreNumber}>{result.score} / 10</span>
                  <span style={styles.scoreLabel}>Correct Answers (8 Required)</span>
                </div>
                <div style={styles.completionBadge}>
                  <span>✓</span> All Skills in Topic Completed!
                </div>
              </div>

              {/* Unlocked Nodes List */}
              <div style={styles.unlockedBox}>
                <h4 style={styles.unlockedTitle}>Completed Skills in this Topic:</h4>
                <div style={styles.unlockedList}>
                  {context.childNodes.map((node) => (
                    <div key={node.node_id} style={styles.unlockedItem}>
                      <span style={styles.checkIcon}>✓</span>
                      <span>{node.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.resultActions}>
                <Link
                  to={`/app/track/${encodeURIComponent(context.pillarId)}`}
                  style={styles.primaryActionLink}
                >
                  Continue on Track Map →
                </Link>
                <button
                  type="button"
                  onClick={retryDiagnostic}
                  style={styles.secondaryActionButton}
                >
                  Retake Diagnostic for Practice ↻
                </button>
              </div>
            </>
          ) : (
            /* FAILED STATE (score < 8) */
            <>
              <div style={styles.resultHeader}>
                <span style={styles.failIcon}>💡</span>
                <div style={styles.failedPill}>Diagnostic Incomplete · Score {result.score} / 10</div>
                <h1 style={styles.resultTitle}>Keep Learning</h1>
                <p style={styles.resultSubtitle}>
                  You scored <strong>{result.score} / 10 ({result.score * 10}%)</strong>. An 80% score (8 / 10) is required to test out of this topic.
                  Don't worry — your existing progress is completely preserved! You can master these skills through standard lessons and checkpoint quizzes.
                </p>
              </div>

              <div style={styles.scoreContainerFailed}>
                <div style={styles.scoreRow}>
                  <span style={styles.scoreNumberFailed}>{result.score} / 10</span>
                  <span style={styles.scoreLabel}>Passing Score: 8 / 10 (80%)</span>
                </div>
              </div>

              <div style={styles.resultActions}>
                <button
                  type="button"
                  onClick={retryDiagnostic}
                  style={styles.primaryActionButton}
                >
                  Retry Diagnostic Exam ↻
                </button>
                <Link
                  to={`/app/track/${encodeURIComponent(context.pillarId)}`}
                  style={styles.secondaryActionLink}
                >
                  Study Skills on Track Map →
                </Link>
              </div>
            </>
          )}

          {/* Question Review Breakdown */}
          {result.review && result.review.length > 0 && (
            <div style={styles.reviewSection}>
              <h3 style={styles.reviewTitle}>Question Review Breakdown</h3>
              <div style={styles.reviewList}>
                {result.review.map((item, idx) => {
                  const isItemCorrect = item.is_correct;
                  return (
                    <div
                      key={item.question_id || idx}
                      style={{
                        ...styles.reviewCard,
                        ...(isItemCorrect ? styles.reviewCardCorrect : styles.reviewCardIncorrect),
                      }}
                    >
                      <div style={styles.reviewCardHeader}>
                        <span style={styles.reviewIndexBadge}>Question {idx + 1}</span>
                        <span
                          style={
                            isItemCorrect
                              ? styles.reviewStatusCorrect
                              : styles.reviewStatusIncorrect
                          }
                        >
                          {isItemCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>

                      <p style={styles.reviewQuestionText}>{item.question_text}</p>

                      <div style={styles.reviewOptionsList}>
                        {item.options.map((optText, optIdx) => {
                          const wasUserChoice = item.selected_index === optIdx;
                          const wasCorrect = item.correct_index === optIdx;

                          let optionStyle = styles.reviewOptionNeutral;
                          if (result.passed) {
                            if (wasCorrect) optionStyle = styles.reviewOptionCorrect;
                            else if (wasUserChoice) optionStyle = styles.reviewOptionIncorrect;
                          } else {
                            // Guided mode on fail: only flag user's wrong choice without spoiling correct
                            if (wasUserChoice) {
                              optionStyle = isItemCorrect
                                ? styles.reviewOptionCorrect
                                : styles.reviewOptionIncorrect;
                            }
                          }

                          return (
                            <div key={optIdx} style={optionStyle}>
                              <span style={styles.reviewOptionLetter}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span style={styles.reviewOptionText}>{optText}</span>
                              {wasUserChoice && (
                                <span style={styles.yourChoiceBadge}>
                                  {isItemCorrect ? '✓ Your Choice' : '✗ Your Choice'}
                                </span>
                              )}
                              {result.passed && wasCorrect && !wasUserChoice && (
                                <span style={styles.correctChoiceBadge}>✓ Correct Answer</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Remediation cue or full explanation */}
                      {item.explanation ? (
                        <div style={styles.remediationBox}>
                          <span style={styles.remediationIcon}>
                            {isItemCorrect ? '💡' : '🔍'}
                          </span>
                          <div style={styles.remediationContent}>
                            <div style={styles.remediationLabel}>
                              {isItemCorrect ? 'Explanation:' : 'Concept to Review:'}
                            </div>
                            <p style={styles.remediationText}>{item.explanation}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '780px',
    margin: '0 auto',
    padding: '24px 20px 80px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  breadcrumbNav: {
    width: '100%',
    overflowX: 'auto',
    padding: '4px 0',
  },
  breadcrumbList: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
  },
  breadcrumbItem: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  breadcrumbSeparator: {
    color: '#475569',
    fontSize: '13px',
    fontWeight: '600',
  },
  breadcrumbRootLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    textDecoration: 'none',
  },
  breadcrumbPillar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid rgba(30, 64, 175, 0.5)',
    textDecoration: 'none',
  },
  breadcrumbTopic: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid rgba(6, 95, 70, 0.5)',
  },
  breadcrumbCurrent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.35)',
  },
  levelTag: {
    fontSize: '9.5px',
    fontWeight: '800',
    letterSpacing: '0.04em',
    opacity: 0.75,
  },
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  startHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '10px',
  },
  startIcon: {
    fontSize: '32px',
  },
  startTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  startSubtitle: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
    margin: 0,
  },
  scopeSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 'var(--radius-md)',
    padding: '18px 20px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  scopeHeading: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  nodeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  nodeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  nodeCompletedBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    whiteSpace: 'nowrap',
  },
  nodePendingBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
    whiteSpace: 'nowrap',
  },
  nodeName: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    fontWeight: '500',
  },
  rulesCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  ruleBullet: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  startActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  startExamButton: {
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  cancelLink: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    textDecoration: 'none',
    fontWeight: '600',
  },
  examContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  stepperHeader: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  stepperMetaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  },
  stepperTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  stepperTopicPill: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6ee7b7',
    backgroundColor: 'rgba(6, 78, 59, 0.4)',
    border: '1px solid rgba(6, 95, 70, 0.5)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  stepperQuestionIndex: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  stepperAnsweredBadge: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  stepperPillsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  stepperPill: {
    minWidth: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: 'var(--text-secondary)',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  stepperPillActive: {
    backgroundColor: '#059669',
    borderColor: '#34d399',
    color: '#ffffff',
    boxShadow: '0 0 10px rgba(5, 150, 105, 0.5)',
  },
  stepperPillAnswered: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderColor: 'rgba(52, 211, 153, 0.4)',
    color: '#6ee7b7',
  },
  questionHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  questionNodeTag: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#d8b4fe',
    backgroundColor: 'rgba(88, 28, 135, 0.25)',
    border: '1px solid rgba(107, 33, 168, 0.4)',
    padding: '2px 8px',
    borderRadius: '4px',
    alignSelf: 'flex-start',
  },
  questionText: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: 1.45,
    margin: 0,
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  optionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '14.5px',
    lineHeight: 1.4,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    outline: 'none',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderColor: '#10b981',
    boxShadow: '0 0 0 1px #10b981',
  },
  optionRadioCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    flexShrink: 0,
  },
  optionRadioCircleSelected: {
    backgroundColor: '#059669',
    borderColor: '#34d399',
    color: '#ffffff',
  },
  optionLabel: {
    flex: 1,
  },
  inlineErrorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: '#f87171',
    fontSize: '13.5px',
    fontWeight: '600',
  },
  examNavBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  navPrevButton: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '10px 18px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  navRightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navNextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '10px 20px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13.5px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  navSubmitButton: {
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    padding: '10px 22px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  navButtonDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  resultHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '10px',
  },
  celebrationIcon: {
    fontSize: '44px',
  },
  failIcon: {
    fontSize: '40px',
  },
  passedPill: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  failedPill: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  resultTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
  },
  resultSubtitle: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
    maxWidth: '560px',
    margin: 0,
  },
  scoreContainerPassed: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  scoreContainerFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  scoreRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  scoreNumber: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#34d399',
  },
  scoreNumberFailed: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#f87171',
  },
  scoreLabel: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  completionBadge: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#34d399',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px',
  },
  unlockedBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  unlockedTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  unlockedList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '8px',
  },
  unlockedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
  },
  checkIcon: {
    color: '#34d399',
    fontWeight: '800',
  },
  resultActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  primaryActionLink: {
    backgroundColor: '#059669',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '12px 26px',
    borderRadius: 'var(--radius-md)',
    fontWeight: '700',
    fontSize: '14.5px',
  },
  primaryActionButton: {
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    padding: '12px 26px',
    borderRadius: 'var(--radius-md)',
    fontWeight: '700',
    fontSize: '14.5px',
    cursor: 'pointer',
  },
  secondaryActionLink: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '11px 20px',
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  reviewSection: {
    marginTop: '16px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  reviewTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  reviewCard: {
    borderRadius: 'var(--radius-md)',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  reviewCardCorrect: {
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  reviewCardIncorrect: {
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  reviewCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewIndexBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-muted)',
  },
  reviewStatusCorrect: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  reviewStatusIncorrect: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  reviewQuestionText: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.45,
  },
  reviewOptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  reviewOptionNeutral: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
  },
  reviewOptionCorrect: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    fontSize: '13.5px',
    color: '#34d399',
    fontWeight: '600',
  },
  reviewOptionIncorrect: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    fontSize: '13.5px',
    color: '#f87171',
    fontWeight: '600',
  },
  reviewOptionLetter: {
    fontWeight: '800',
    fontSize: '12px',
  },
  reviewOptionText: {
    flex: 1,
  },
  yourChoiceBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '1px 6px',
    borderRadius: '3px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  correctChoiceBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '1px 6px',
    borderRadius: '3px',
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    color: '#34d399',
  },
  remediationBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 14px',
    borderLeft: '3px solid #60a5fa',
  },
  remediationIcon: {
    fontSize: '16px',
    lineHeight: 1,
  },
  remediationContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  remediationLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#93c5fd',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  remediationText: {
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    margin: 0,
  },
  errorCard: {
    padding: '36px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  errorText: {
    color: 'var(--status-error)',
    fontSize: '15px',
    margin: 0,
  },
  errorActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backLink: {
    color: 'var(--accent-primary)',
    fontSize: '14px',
    textDecoration: 'none',
    fontWeight: '600',
  },
};
