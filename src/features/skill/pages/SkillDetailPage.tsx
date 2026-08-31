import { useParams, Link } from 'react-router-dom';
import { useSkillDetail } from '../hooks/useSkillDetail';
import { SkillHeader } from '../components/SkillHeader';
import { LockBanner } from '../components/LockBanner';
import { DefinitionSection } from '../components/DefinitionSection';
import { ContentToggle } from '../components/ContentToggle';
import { PrerequisitesList } from '../components/PrerequisitesList';
import { ResourceSection } from '../components/ResourceSection';
import { QuizActionButton } from '../components/QuizActionButton';
import { LoadingFallback } from '../../../components/LoadingFallback';

export function SkillDetailPage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const {
    node,
    prerequisites,
    resources,
    status,
    isLocked,
    isLoading,
    error,
    refetch,
  } = useSkillDetail(nodeId);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (error || !node) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{error || 'Skill node not found.'}</p>
          <div style={styles.errorActions}>
            <Link to="/app/track" style={styles.backLink}>
              ← Back to Track Overview
            </Link>
            <button type="button" onClick={() => refetch()} style={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 1. Breadcrumbs */}
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
            <Link to={`/app/track/${encodeURIComponent(node.pillar_id)}`} style={styles.breadcrumbLink}>
              {node.pillar_name || 'Pillar'}
            </Link>
          </li>
          <li style={styles.breadcrumbSeparator} aria-hidden="true">
            /
          </li>
          <li style={{ ...styles.breadcrumbItem, ...styles.breadcrumbCurrent }} aria-current="page">
            {node.name}
          </li>
        </ol>
      </nav>

      {/* 2. Skill Header */}
      <SkillHeader
        name={node.name}
        status={status}
        classification={node.classification}
        recommendedDepth={node.recommended_depth}
        estimatedTimeMinutes={node.estimated_time_minutes}
      />

      {/* 3. Lock Banner (Only if locked) */}
      {isLocked && <LockBanner prerequisites={prerequisites} />}

      {/* 4. Definition & Importance ("What is it?" & "Why does it matter?") */}
      <DefinitionSection
        definition={node.one_sentence_definition}
        whyItMatters={node.why_it_matters}
      />

      {/* 5. Content View (Quick Overview & Expandable Deep Dive) */}
      <ContentToggle
        quickOverview={node.quick_overview}
        deepDive={node.deep_dive}
      />

      {/* 6. Prerequisites List */}
      <PrerequisitesList prerequisites={prerequisites} />

      {/* 7. Curated Resources */}
      <ResourceSection resources={resources} />

      {/* 8. Quiz Checkpoint Action */}
      <QuizActionButton
        nodeId={node.node_id}
        status={status}
        isLocked={isLocked}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '860px',
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
    padding: '32px',
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
    color: 'var(--text-secondary)',
    fontSize: '14px',
    textDecoration: 'none',
  },
  retryButton: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
  },
};
