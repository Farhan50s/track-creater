import { useState, useEffect } from 'react';
import { TopicWithHierarchy } from '../types/track.types';
import { TopicSection } from './TopicSection';

interface ExpandableTreeProps {
  topics: TopicWithHierarchy[];
}

export function ExpandableTree({ topics }: ExpandableTreeProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set());

  // Expand all by default on mount/data load
  useEffect(() => {
    const allTopicIds = new Set(topics.map((t) => t.topic_id));
    const allSubtopicIds = new Set(topics.flatMap((t) => t.subtopics.map((s) => s.subtopic_id)));
    setExpandedTopics(allTopicIds);
    setExpandedSubtopics(allSubtopicIds);
  }, [topics]);

  const handleExpandAll = () => {
    const allTopicIds = new Set(topics.map((t) => t.topic_id));
    const allSubtopicIds = new Set(topics.flatMap((t) => t.subtopics.map((s) => s.subtopic_id)));
    setExpandedTopics(allTopicIds);
    setExpandedSubtopics(allSubtopicIds);
  };

  const handleCollapseAll = () => {
    setExpandedTopics(new Set());
    setExpandedSubtopics(new Set());
  };

  const handleToggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const handleToggleSubtopic = (subtopicId: string) => {
    setExpandedSubtopics((prev) => {
      const next = new Set(prev);
      if (next.has(subtopicId)) {
        next.delete(subtopicId);
      } else {
        next.add(subtopicId);
      }
      return next;
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.controlsRow}>
        <span style={styles.controlsLabel}>Topics & Skills</span>
        <div style={styles.buttonGroup}>
          <button type="button" onClick={handleExpandAll} style={styles.controlButton}>
            Expand All
          </button>
          <span style={styles.buttonDivider}>·</span>
          <button type="button" onClick={handleCollapseAll} style={styles.controlButton}>
            Collapse All
          </button>
        </div>
      </div>

      <div style={styles.treeList}>
        {topics.map((topic) => (
          <TopicSection
            key={topic.topic_id}
            topic={topic}
            isExpanded={expandedTopics.has(topic.topic_id)}
            onToggle={() => handleToggleTopic(topic.topic_id)}
            expandedSubtopics={expandedSubtopics}
            onToggleSubtopic={handleToggleSubtopic}
          />
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '8px',
  },
  controlsLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  controlButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--accent-primary)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: 'var(--radius-sm)',
    transition: 'opacity 0.15s ease',
  },
  buttonDivider: {
    color: 'var(--text-muted)',
    fontSize: '12px',
  },
  treeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
};
