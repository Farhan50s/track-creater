import React from 'react';
import { Link } from 'react-router-dom';

export interface ExplorerBreadcrumbProps {
  pillarId?: string;
  pillarName?: string;
  topicName?: string;
  subtopicName?: string | null;
  nodeId?: string;
  nodeName: string;
  currentPageType?: 'skill' | 'quiz';
  className?: string;
}

export const ExplorerBreadcrumb: React.FC<ExplorerBreadcrumbProps> = ({
  pillarId,
  pillarName,
  topicName,
  subtopicName,
  nodeId,
  nodeName,
  currentPageType = 'skill',
  className = '',
}) => {
  return (
    <nav
      aria-label="Explorer Hierarchy Breadcrumb"
      className={`explorer-breadcrumb-nav ${className}`}
      style={styles.nav}
    >
      <ol style={styles.list}>
        {/* Track Overview Root */}
        <li style={styles.item}>
          <Link
            to="/app/track"
            style={styles.rootLink}
            title="Return to Track Overview"
            aria-label="Track Overview"
          >
            <span style={styles.icon}>🗺️</span>
            <span>Track</span>
          </Link>
        </li>

        <li style={styles.separator} aria-hidden="true">
          ›
        </li>

        {/* Level 1: Pillar (Blue) */}
        {pillarName && (
          <>
            <li style={styles.item}>
              {pillarId ? (
                <Link
                  to={`/app/track/${encodeURIComponent(pillarId)}`}
                  className="bg-blue-950/40 text-blue-300 border-blue-800/50"
                  style={styles.pillarBadge}
                  title={`Level 1 Pillar: ${pillarName}`}
                >
                  <span style={styles.levelTag}>L1</span>
                  <span style={styles.icon}>📁</span>
                  <span style={styles.badgeText}>{pillarName}</span>
                </Link>
              ) : (
                <span
                  className="bg-blue-950/40 text-blue-300 border-blue-800/50"
                  style={styles.pillarBadge}
                >
                  <span style={styles.levelTag}>L1</span>
                  <span style={styles.icon}>📁</span>
                  <span style={styles.badgeText}>{pillarName}</span>
                </span>
              )}
            </li>

            <li style={styles.separator} aria-hidden="true">
              ›
            </li>
          </>
        )}

        {/* Level 2: Topic (Emerald) */}
        {topicName && (
          <>
            <li style={styles.item}>
              <span
                className="bg-emerald-950/40 text-emerald-300 border-emerald-800/50"
                style={styles.topicBadge}
                title={`Level 2 Topic: ${topicName}`}
              >
                <span style={styles.levelTag}>L2</span>
                <span style={styles.icon}>📂</span>
                <span style={styles.badgeText}>{topicName}</span>
              </span>
            </li>

            <li style={styles.separator} aria-hidden="true">
              ›
            </li>
          </>
        )}

        {/* Level 3: Subtopic (Amber) */}
        {subtopicName && (
          <>
            <li style={styles.item}>
              <span
                className="bg-amber-950/40 text-amber-300 border-amber-800/50"
                style={styles.subtopicBadge}
                title={`Level 3 Subtopic: ${subtopicName}`}
              >
                <span style={styles.levelTag}>L3</span>
                <span style={styles.icon}>🗂️</span>
                <span style={styles.badgeText}>{subtopicName}</span>
              </span>
            </li>

            <li style={styles.separator} aria-hidden="true">
              ›
            </li>
          </>
        )}

        {/* Level 4: Active Skill Node (Violet) */}
        <li style={styles.item}>
          {currentPageType === 'quiz' && nodeId ? (
            <Link
              to={`/app/node/${encodeURIComponent(nodeId)}`}
              className="bg-purple-950/40 text-purple-300 border-purple-800/50"
              style={styles.nodeLinkBadge}
              title={`Return to Skill: ${nodeName}`}
            >
              <span style={styles.levelTag}>L4</span>
              <span style={styles.icon}>📄</span>
              <span style={styles.badgeText}>{nodeName}</span>
            </Link>
          ) : (
            <span
              className="bg-purple-950/40 text-purple-300 border-purple-800/50"
              style={styles.nodeActiveBadge}
              aria-current="page"
              title={`Level 4 Skill Node: ${nodeName}`}
            >
              <span style={styles.levelTag}>L4</span>
              <span style={styles.icon}>📄</span>
              <span style={styles.badgeText}>{nodeName}</span>
            </span>
          )}
        </li>

        {/* Page Context suffix for Quiz */}
        {currentPageType === 'quiz' && (
          <>
            <li style={styles.separator} aria-hidden="true">
              ›
            </li>
            <li style={styles.item}>
              <span
                style={styles.quizBadge}
                aria-current="page"
                title="Quiz Checkpoint"
              >
                <span style={styles.icon}>⚡</span>
                <span style={styles.badgeText}>Quiz Checkpoint</span>
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    width: '100%',
    overflowX: 'auto',
    padding: '8px 4px',
    scrollbarWidth: 'none',
  },
  list: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
    minWidth: 'min-content',
  },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  separator: {
    color: '#475569',
    fontSize: '13px',
    fontWeight: '600',
    userSelect: 'none',
    padding: '0 1px',
    flexShrink: 0,
  },
  icon: {
    fontSize: '11px',
    lineHeight: 1,
    opacity: 0.85,
  },
  levelTag: {
    fontSize: '9.5px',
    fontWeight: '800',
    letterSpacing: '0.04em',
    opacity: 0.75,
    marginRight: '2px',
    textTransform: 'uppercase',
  },
  badgeText: {
    maxWidth: '220px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rootLink: {
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
    transition: 'all 0.15s ease',
  },
  pillarBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: 'rgba(30, 58, 138, 0.35)', // bg-blue-950/40
    color: '#93c5fd', // text-blue-300
    border: '1px solid rgba(30, 64, 175, 0.5)', // border-blue-800/50
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  topicBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: 'rgba(6, 78, 59, 0.35)', // bg-emerald-950/40
    color: '#6ee7b7', // text-emerald-300
    border: '1px solid rgba(6, 95, 70, 0.5)', // border-emerald-800/50
    textDecoration: 'none',
  },
  subtopicBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: 'rgba(120, 53, 15, 0.35)', // bg-amber-950/40
    color: '#fcd34d', // text-amber-300
    border: '1px solid rgba(146, 64, 14, 0.5)', // border-amber-800/50
    textDecoration: 'none',
  },
  nodeActiveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: 'rgba(88, 28, 135, 0.35)', // bg-purple-950/40
    color: '#d8b4fe', // text-purple-300
    border: '1px solid rgba(107, 33, 168, 0.6)', // border-purple-800/50
  },
  nodeLinkBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: 'rgba(88, 28, 135, 0.35)',
    color: '#d8b4fe',
    border: '1px solid rgba(107, 33, 168, 0.5)',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  quizBadge: {
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
};
