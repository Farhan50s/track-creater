import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { QuizStartCard } from '../components/QuizStartCard';
import { QuizQuestionCard } from '../components/QuizQuestionCard';
import { QuizResultCard } from '../components/QuizResultCard';
import { LoadingFallback } from '../../../components/LoadingFallback';

export function QuizPage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const {
    state,
    skillContext,
    servedQuestions,
    currentIndex,
    selectedAnswers,
    result,
    error,
    isSubmitting,
    startQuiz,
    selectOption,
    nextQuestion,
    submitQuiz,
    retryQuiz,
  } = useQuiz(nodeId);

  if (state === 'loading' || state === 'unauthorized') {
    return <LoadingFallback />;
  }

  if (state === 'error' || !skillContext) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{error || 'Unable to load quiz checkpoint.'}</p>
          <div style={styles.errorActions}>
            <Link
              to={nodeId ? `/app/node/${encodeURIComponent(nodeId)}` : '/app/track'}
              style={styles.backLink}
            >
              ← Back to Skill Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" style={styles.breadcrumbNav}>
        <ol style={styles.breadcrumbList}>
          <li style={styles.breadcrumbItem}>
            <Link to="/app/track" style={styles.breadcrumbLink}>
              Track Overview
            </Link>
          </li>
          <li style={styles.breadcrumbSeparator} aria-hidden="true">
            /
          </li>
          <li style={styles.breadcrumbItem}>
            <Link
              to={`/app/track/${encodeURIComponent(skillContext.pillarId)}`}
              style={styles.breadcrumbLink}
            >
              {skillContext.pillarName || 'Pillar'}
            </Link>
          </li>
          <li style={styles.breadcrumbSeparator} aria-hidden="true">
            /
          </li>
          <li style={styles.breadcrumbItem}>
            <Link
              to={`/app/node/${encodeURIComponent(skillContext.nodeId)}`}
              style={styles.breadcrumbLink}
            >
              {skillContext.name}
            </Link>
          </li>
          <li style={styles.breadcrumbSeparator} aria-hidden="true">
            /
          </li>
          <li style={{ ...styles.breadcrumbItem, ...styles.breadcrumbCurrent }} aria-current="page">
            Quiz Checkpoint
          </li>
        </ol>
      </nav>

      {/* Content based on lifecycle state */}
      {state === 'idle' && (
        <QuizStartCard
          skillName={skillContext.name}
          nodeId={skillContext.nodeId}
          onStart={startQuiz}
        />
      )}

      {(state === 'in_progress' || state === 'submitting') && (
        <QuizQuestionCard
          question={servedQuestions[currentIndex]}
          currentIndex={currentIndex}
          totalQuestions={servedQuestions.length}
          selectedAnswer={selectedAnswers[currentIndex]}
          onSelectOption={selectOption}
          onNext={nextQuestion}
          onSubmit={submitQuiz}
          isSubmitting={isSubmitting}
          nodeId={skillContext.nodeId}
        />
      )}

      {state === 'result' && result && (
        <QuizResultCard
          result={result}
          skillContext={skillContext}
          onRetry={retryQuiz}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '32px 20px 80px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  breadcrumbNav: {
    marginBottom: '4px',
  },
  breadcrumbList: {
    display: 'flex',
    alignItems: 'center',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: '8px',
    fontSize: '13px',
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    display: 'flex',
    alignItems: 'center',
  },
  breadcrumbSeparator: {
    color: 'var(--text-muted)',
    fontSize: '12px',
  },
  breadcrumbLink: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  },
  breadcrumbCurrent: {
    color: 'var(--text-primary)',
    fontWeight: '600',
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
