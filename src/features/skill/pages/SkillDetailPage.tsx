import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSkillDetail } from '../hooks/useSkillDetail';
import { SkillHeader } from '../components/SkillHeader';
import { LockBanner } from '../components/LockBanner';
import { DefinitionSection } from '../components/DefinitionSection';
import { ContentToggle } from '../components/ContentToggle';
import { PrerequisitesList } from '../components/PrerequisitesList';
import { ResourceSection } from '../components/ResourceSection';
import { QuizActionButton } from '../components/QuizActionButton';
import { CodePlayground } from '../components/CodePlayground';
import { ExplorerBreadcrumb } from '../../../components/ExplorerBreadcrumb';
import { LoadingFallback } from '../../../components/LoadingFallback';

type ViewMode = 'document' | 'split' | 'playground';

export function SkillDetailPage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('document');

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

  const containerStyle = {
    ...styles.container,
    ...(viewMode === 'split' ? styles.containerSplit : {}),
    ...(viewMode === 'playground' ? styles.containerPlayground : {}),
  };

  const renderLessonCurriculum = () => (
    <>
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
    </>
  );

  return (
    <div style={containerStyle}>
      {/* 1. Level 1–4 Hierarchical Explorer Breadcrumbs */}
      <ExplorerBreadcrumb
        pillarId={node.pillar_id}
        pillarName={node.pillar_name}
        topicName={node.topic_name}
        subtopicName={node.subtopic_name}
        nodeId={node.node_id}
        nodeName={node.name}
        currentPageType="skill"
      />

      {/* View Mode Controls */}
      <div style={styles.viewModeBar}>
        <span style={styles.viewModeLabel}>Workspace Mode:</span>
        <div style={styles.viewModeGroup}>
          <button
            type="button"
            onClick={() => setViewMode('document')}
            style={{
              ...styles.viewModeButton,
              ...(viewMode === 'document' ? styles.viewModeButtonActive : {}),
            }}
            title="Standard full reading layout"
          >
            <span>📄</span> Document Only
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            style={{
              ...styles.viewModeButton,
              ...(viewMode === 'split' ? styles.viewModeButtonActive : {}),
            }}
            title="Split screen: Lesson on left, Code Playground on right"
          >
            <span>◫</span> Split View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('playground')}
            style={{
              ...styles.viewModeButton,
              ...(viewMode === 'playground' ? styles.viewModeButtonActive : {}),
            }}
            title="Full-width interactive code workspace"
          >
            <span>⚡</span> Playground Tab
          </button>
        </div>
      </div>

      {/* Document Only Mode */}
      {viewMode === 'document' && (
        <div style={styles.documentContainer}>
          {renderLessonCurriculum()}
        </div>
      )}

      {/* Split Screen View Mode */}
      {viewMode === 'split' && (
        <div style={styles.splitContainer}>
          <div style={styles.splitLeftPane}>
            {renderLessonCurriculum()}
          </div>
          <div style={styles.splitRightPane}>
            <div style={styles.stickyPlaygroundWrapper}>
              <CodePlayground
                nodeId={node.node_id}
                nodeTitle={node.name}
                isSplitView={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Full-width Playground Mode */}
      {viewMode === 'playground' && (
        <div style={styles.playgroundFullContainer}>
          <SkillHeader
            name={node.name}
            status={status}
            classification={node.classification}
            recommendedDepth={node.recommended_depth}
            estimatedTimeMinutes={node.estimated_time_minutes}
          />
          <CodePlayground
            nodeId={node.node_id}
            nodeTitle={node.name}
          />
          <QuizActionButton
            nodeId={node.node_id}
            status={status}
            isLocked={isLocked}
          />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '28px 20px 80px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    transition: 'max-width 0.2s ease',
  },
  containerSplit: {
    maxWidth: '1440px',
  },
  containerPlayground: {
    maxWidth: '1080px',
  },
  viewModeBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 14px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  viewModeLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  viewModeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '3px',
    borderRadius: '6px',
    border: '1px solid #1e293b',
  },
  viewModeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  viewModeButtonActive: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    border: '1px solid #334155',
  },
  documentContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  splitContainer: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
    gap: '24px',
    alignItems: 'start',
  },
  splitLeftPane: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    minWidth: 0,
  },
  splitRightPane: {
    position: 'sticky',
    top: '20px',
    minWidth: 0,
  },
  stickyPlaygroundWrapper: {
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
  },
  playgroundFullContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
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
