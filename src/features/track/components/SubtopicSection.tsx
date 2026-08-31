import React from 'react';
import { SubtopicWithNodes } from '../types/track.types';
import { NodeCard } from './NodeCard';

interface SubtopicSectionProps {
  subtopic: SubtopicWithNodes;
  isExpanded: boolean;
  onToggle: () => void;
}

export function SubtopicSection({ subtopic, isExpanded, onToggle }: SubtopicSectionProps) {
  return (
    <div style={styles.container}>
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
        aria-controls={`subtopic-content-${subtopic.subtopic_id}`}
        aria-label={`${subtopic.name} subtopic, ${subtopic.nodes.length} skills, ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        <div style={styles.titleGroup}>
          <span style={styles.chevron} aria-hidden="true">{isExpanded ? '▾' : '▸'}</span>
          <span style={styles.title}>{subtopic.name}</span>
        </div>

        <span style={styles.nodeCountBadge}>
          {subtopic.nodes.length} {subtopic.nodes.length === 1 ? 'skill' : 'skills'}
        </span>
      </button>

      {isExpanded && (
        <div id={`subtopic-content-${subtopic.subtopic_id}`} style={styles.content}>
          {subtopic.nodes.map((node) => (
            <NodeCard key={node.node_id} node={node} />
          ))}
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
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-surface)',
    overflow: 'hidden',
  },
  headerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '44px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--text-primary)',
    transition: 'background-color 0.15s ease',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  chevron: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    width: '14px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  nodeCountBadge: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px 16px 16px 16px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
  },
};
