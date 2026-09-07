import React from 'react';
import { Link } from 'react-router-dom';
import { TopicWithHierarchy } from '../types/track.types';
import { SubtopicSection } from './SubtopicSection';
import { NodeCard } from './NodeCard';
import { DEPTH_THEMES } from '../../../utils/depthTheme';

interface TopicSectionProps {
  topic: TopicWithHierarchy;
  isExpanded: boolean;
  onToggle: () => void;
  expandedSubtopics: Set<string>;
  onToggleSubtopic: (subtopicId: string) => void;
}

export function TopicSection({
  topic,
  isExpanded,
  onToggle,
  expandedSubtopics,
  onToggleSubtopic,
}: TopicSectionProps) {
  const completedNodesCount = topic.all_nodes.filter((n) => n.status === 'completed').length;
  const totalNodesCount = topic.all_nodes.length;
  const isAllCompleted = completedNodesCount === totalNodesCount && totalNodesCount > 0;
  const theme = DEPTH_THEMES[2];

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <button
          type="button"
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle();
            }
          }}
          style={styles.headerButton}
          aria-expanded={isExpanded}
          aria-controls={`topic-content-${topic.topic_id}`}
          aria-label={`${topic.name} topic, ${completedNodesCount} of ${totalNodesCount} completed, ${isExpanded ? 'expanded' : 'collapsed'}`}
        >
          <div style={styles.titleGroup}>
            <span style={styles.chevron} aria-hidden="true">{isExpanded ? '▼' : '▶'}</span>
            <span style={styles.folderIcon} aria-hidden="true">{isExpanded ? '📂' : '📁'}</span>
            <span
              className={`${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border rounded px-2 py-0.5 text-xs font-mono font-semibold flex items-center gap-1`}
              style={styles.levelBadge}
            >
              L2 Topic
            </span>
            <h2 style={styles.title}>{topic.name}</h2>
          </div>
        </button>

        <div style={styles.metaGroup}>
          <span style={styles.progressText}>
            {completedNodesCount}/{totalNodesCount} completed
          </span>
          {isAllCompleted ? (
            <span style={styles.masteredBadge}>✓ Mastered</span>
          ) : (
            <Link
              to={`/app/diagnostic/${encodeURIComponent(topic.topic_id)}`}
              style={styles.testOutButton}
              title={`Test out of ${topic.name} via 10-question diagnostic exam`}
              aria-label={`Test out of ${topic.name}`}
            >
              ⚡ Test Out
            </Link>
          )}
        </div>
      </div>

      {isExpanded && (
        <div
          id={`topic-content-${topic.topic_id}`}
          className="border-l-2 border-slate-800/80 ml-4 pl-6 space-y-6 tree-topic-rail"
          style={styles.content}
        >
          {/* Direct nodes attached to topic */}
          {topic.direct_nodes && topic.direct_nodes.length > 0 && (
            <div style={styles.directNodesList}>
              {topic.direct_nodes.map((node) => (
                <div
                  key={node.node_id}
                  className="relative before:absolute before:-left-5 before:top-1/2 before:w-4 before:h-px before:bg-purple-500/40 tree-node-wrapper"
                  style={styles.nodeWrapper}
                >
                  <NodeCard node={node} />
                </div>
              ))}
            </div>
          )}

          {/* Child subtopics */}
          {topic.subtopics && topic.subtopics.length > 0 && (
            <div style={styles.subtopicsList}>
              {topic.subtopics.map((subtopic) => (
                <SubtopicSection
                  key={subtopic.subtopic_id}
                  subtopic={subtopic}
                  isExpanded={expandedSubtopics.has(subtopic.subtopic_id)}
                  onToggle={() => onToggleSubtopic(subtopic.subtopic_id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--bg-surface)',
    overflow: 'hidden',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '50px',
    padding: '14px 20px',
    backgroundColor: 'var(--bg-surface)',
    gap: '12px',
    flexWrap: 'wrap',
  },
  headerButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--text-primary)',
    padding: 0,
    gap: '12px',
    flex: 1,
    minWidth: '200px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  chevron: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    width: '12px',
    flexShrink: 0,
  },
  folderIcon: {
    fontSize: '16px',
    lineHeight: 1,
    flexShrink: 0,
  },
  levelBadge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'rgba(6, 78, 59, 0.4)',
    color: '#6ee7b7',
    border: '1px solid rgba(6, 95, 70, 0.5)',
    padding: '2px 7px',
    borderRadius: '4px',
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  title: {
    fontSize: '16.5px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  metaGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  progressText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
  },
  testOutButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.4)',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  masteredBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: '700',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    whiteSpace: 'nowrap',
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '18px 20px 22px 24px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderLeft: '2px solid rgba(51, 65, 85, 0.7)',
    marginLeft: '16px',
  },
  directNodesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  subtopicsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  nodeWrapper: {
    position: 'relative',
  },
};
