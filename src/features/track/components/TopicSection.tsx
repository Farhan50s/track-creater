import React from 'react';
import { TopicWithHierarchy } from '../types/track.types';
import { SubtopicSection } from './SubtopicSection';
import { NodeCard } from './NodeCard';

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

  return (
    <div style={styles.container}>
      <button
        type="button"
        onClick={onToggle}
        style={styles.headerButton}
        aria-expanded={isExpanded}
        aria-controls={`topic-content-${topic.topic_id}`}
      >
        <div style={styles.titleGroup}>
          <span style={styles.chevron}>{isExpanded ? '▼' : '▶'}</span>
          <h2 style={styles.title}>{topic.name}</h2>
        </div>

        <div style={styles.metaGroup}>
          <span style={styles.progressText}>
            {completedNodesCount}/{totalNodesCount} completed
          </span>
        </div>
      </button>

      {isExpanded && (
        <div id={`topic-content-${topic.topic_id}`} style={styles.content}>
          {/* Direct nodes attached to topic */}
          {topic.direct_nodes && topic.direct_nodes.length > 0 && (
            <div style={styles.directNodesList}>
              {topic.direct_nodes.map((node) => (
                <NodeCard key={node.node_id} node={node} />
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
  headerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: 'var(--bg-surface)',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'background-color 0.15s ease',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chevron: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    width: '12px',
  },
  title: {
    fontSize: '17px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  metaGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  progressText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px 20px 20px 20px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  directNodesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  subtopicsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
};
