import React from 'react';
import { SubtopicWithNodes } from '../types/track.types';
import { NodeCard } from './NodeCard';
import { DEPTH_THEMES } from '../../../utils/depthTheme';

interface SubtopicSectionProps {
  subtopic: SubtopicWithNodes;
  isExpanded: boolean;
  onToggle: () => void;
}

export function SubtopicSection({ subtopic, isExpanded, onToggle }: SubtopicSectionProps) {
  const theme = DEPTH_THEMES[3];

  return (
    <div
      className="relative pl-6 before:absolute before:left-0 before:top-4 before:w-5 before:h-px before:bg-amber-500/40 tree-subtopic-container"
      style={styles.wrapper}
    >
      <div style={styles.cardContainer}>
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
          <div className="relative z-10" style={styles.titleGroup}>
            <span style={styles.chevron} aria-hidden="true">{isExpanded ? '▾' : '▸'}</span>
            <span style={styles.folderIcon} aria-hidden="true">🗂️</span>
            <span
              className={`${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border rounded px-1.5 py-0.5 text-[11px] font-mono font-medium relative z-10`}
              style={styles.levelBadge}
            >
              L3 Subtopic
            </span>
            <span style={styles.title}>{subtopic.name}</span>
          </div>

          <span style={styles.nodeCountBadge}>
            {subtopic.nodes.length} {subtopic.nodes.length === 1 ? 'skill' : 'skills'}
          </span>
        </button>

        {isExpanded && (
          <div
            id={`subtopic-content-${subtopic.subtopic_id}`}
            className="border-l-2 border-slate-800/60 ml-3 pl-5 space-y-3 mt-3 tree-nodes-rail"
            style={styles.nodesContainer}
          >
            {subtopic.nodes.map((node) => (
              <div
                key={node.node_id}
                className="relative before:absolute before:-left-5 before:top-1/2 before:w-4 before:h-px before:bg-purple-500/40 tree-node-wrapper"
                style={styles.nodeItemWrapper}
              >
                <NodeCard node={node} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    paddingLeft: '20px',
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-surface)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  headerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '44px',
    padding: '12px 16px',
    backgroundColor: 'var(--bg-surface)',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--text-primary)',
    transition: 'background-color 0.15s ease',
    gap: '10px',
    position: 'relative',
    zIndex: 2,
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'var(--bg-surface)',
    padding: '2px 6px',
    borderRadius: '6px',
  },
  chevron: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    width: '14px',
    flexShrink: 0,
  },
  folderIcon: {
    fontSize: '14px',
    lineHeight: 1,
    flexShrink: 0,
  },
  levelBadge: {
    fontSize: '10.5px',
    fontWeight: '600',
    backgroundColor: 'rgba(120, 53, 15, 0.4)',
    color: '#fcd34d',
    border: '1px solid rgba(146, 64, 14, 0.5)',
    padding: '1px 6px',
    borderRadius: '4px',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    position: 'relative',
    zIndex: 10,
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  nodeCountBadge: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  },
  nodesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '14px 16px 18px 18px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderLeft: '2px solid rgba(71, 85, 105, 0.5)',
    marginLeft: '12px',
    marginTop: '6px',
  },
  nodeItemWrapper: {
    position: 'relative',
  },
};
