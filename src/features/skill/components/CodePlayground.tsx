import React, { useState, useEffect, useCallback, useRef } from 'react';
import { runJavaScriptSandbox, buildHtmlPreviewSrc, RunResult } from '../utils/codeRunner';
import { getStarterCode } from '../utils/playgroundStarters';

interface CodePlaygroundProps {
  nodeId: string;
  nodeTitle: string;
  className?: string;
  isSplitView?: boolean;
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  nodeId,
  nodeTitle,
  className = '',
  isSplitView = false,
}) => {
  const starter = getStarterCode(nodeId, nodeTitle);

  // 1. State Management
  const [activeTab, setActiveTab] = useState<'editor' | 'notes'>('editor');
  const [mode, setMode] = useState<'html' | 'javascript'>(starter.mode);

  const [code, setCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`skillmap_code_${nodeId}`);
      return saved !== null ? saved : starter.code;
    } catch {
      return starter.code;
    }
  });

  const [notes, setNotes] = useState<string>(() => {
    try {
      return localStorage.getItem(`skillmap_notes_${nodeId}`) || '';
    } catch {
      return '';
    }
  });

  const [logs, setLogs] = useState<RunResult['logs']>([]);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Debounced LocalStorage Autosave Engine (300ms)
  useEffect(() => {
    setIsSaved(false);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`skillmap_code_${nodeId}`, code);
        localStorage.setItem(`skillmap_notes_${nodeId}`, notes);
        setIsSaved(true);
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [code, notes, nodeId]);

  // If nodeId changes (user navigates to another node), reinitialize state
  useEffect(() => {
    const newStarter = getStarterCode(nodeId, nodeTitle);
    setMode(newStarter.mode);
    try {
      const savedCode = localStorage.getItem(`skillmap_code_${nodeId}`);
      setCode(savedCode !== null ? savedCode : newStarter.code);
      const savedNotes = localStorage.getItem(`skillmap_notes_${nodeId}`) || '';
      setNotes(savedNotes);
    } catch {
      setCode(newStarter.code);
      setNotes('');
    }
    setLogs([]);
    setExecutionError(null);
    setIsSaved(true);
  }, [nodeId, nodeTitle]);

  // 3. Execution Action for JavaScript mode
  const handleRunCode = useCallback(async () => {
    if (mode !== 'javascript') return;
    setIsRunning(true);
    setExecutionError(null);

    try {
      const res = await runJavaScriptSandbox(code);
      setLogs(res.logs);
      setExecutionError(res.error);
    } catch (err: any) {
      setExecutionError(err?.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  }, [code, mode]);

  // 4. Keyboard Shortcuts: Tab indentation & Ctrl/Cmd+Enter execution
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter: Run Code in JS mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (mode === 'javascript') {
        handleRunCode();
      }
      return;
    }

    // Tab key: Insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const updated = val.substring(0, start) + '  ' + val.substring(end);
      setCode(updated);

      requestAnimationFrame(() => {
        textarea.selectionStart = start + 2;
        textarea.selectionEnd = start + 2;
      });
    }
  };

  // 5. Reset to Starter Confirmation
  const handleResetToStarter = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset this code editor back to the default starter template? Any unsaved edits will be replaced.'
    );
    if (confirmReset) {
      const newStarter = getStarterCode(nodeId, nodeTitle);
      setCode(newStarter.code);
      setMode(newStarter.mode);
      setLogs([]);
      setExecutionError(null);
    }
  };

  const handleClearConsole = () => {
    setLogs([]);
    setExecutionError(null);
  };

  return (
    <div
      className={`code-playground-container ${className}`}
      style={{
        ...styles.container,
        ...(isSplitView ? styles.containerSplit : {}),
      }}
    >
      {/* --- Top Action Toolbar --- */}
      <div style={styles.toolbar}>
        {/* Left: Tab Switcher (Editor vs Notes) */}
        <div style={styles.tabGroup}>
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'editor' ? styles.tabButtonActive : {}),
            }}
          >
            <span>💻</span> Code Workspace
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'notes' ? styles.tabButtonActive : {}),
            }}
          >
            <span>📝</span> My Notes
          </button>
        </div>

        {/* Center/Right: Mode controls and actions */}
        <div style={styles.actionsGroup}>
          {activeTab === 'editor' && (
            <>
              {/* Language Mode Toggle */}
              <div style={styles.modeToggleGroup}>
                <button
                  type="button"
                  onClick={() => setMode('html')}
                  style={{
                    ...styles.modeButton,
                    ...(mode === 'html' ? styles.modeButtonActive : {}),
                  }}
                  title="HTML/CSS Live Preview"
                >
                  HTML/CSS
                </button>
                <button
                  type="button"
                  onClick={() => setMode('javascript')}
                  style={{
                    ...styles.modeButton,
                    ...(mode === 'javascript' ? styles.modeButtonActive : {}),
                  }}
                  title="JavaScript / TypeScript Script Console"
                >
                  JS / Script
                </button>
              </div>

              {/* Reset to Starter */}
              <button
                type="button"
                onClick={handleResetToStarter}
                style={styles.secondaryButton}
                title="Reset code to original starter template"
              >
                Reset
              </button>

              {/* Run Code / Auto Refresh indicator */}
              {mode === 'javascript' ? (
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  style={styles.runButton}
                  title="Execute JavaScript (Ctrl + Enter)"
                >
                  {isRunning ? 'Running...' : 'Run Code ⚡'}
                </button>
              ) : (
                <span style={styles.livePill} title="Preview updates automatically as you type">
                  <span style={styles.liveDot} /> Live Preview
                </span>
              )}
            </>
          )}

          {/* Autosave Status Badge */}
          <span style={styles.savedBadge} title="Saved in your browser localStorage">
            {isSaved ? '✓ Saved locally' : 'Saving...'}
          </span>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      {activeTab === 'editor' ? (
        <div style={styles.editorWorkspace}>
          {/* Editor Half */}
          <div style={styles.editorPane}>
            <div style={styles.paneHeader}>
              <span style={styles.paneLabel}>
                {mode === 'html' ? 'Markup & Styles (HTML/CSS)' : 'Script Code (JavaScript)'}
              </span>
              <span style={styles.shortcutHint}>
                {mode === 'javascript' ? 'Press Ctrl+Enter to Run' : 'Auto-renders'}
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              style={styles.codeTextarea}
              placeholder={
                mode === 'html'
                  ? '<!-- Write HTML and <style> markup here -->'
                  : '// Write JavaScript code here and use console.log()'
              }
            />
          </div>

          {/* Output Half */}
          <div style={styles.outputPane}>
            <div style={styles.paneHeader}>
              <span style={styles.paneLabel}>
                {mode === 'html' ? 'Live Rendered Preview' : 'Interactive Console Output'}
              </span>
              {mode === 'javascript' && logs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearConsole}
                  style={styles.clearConsoleBtn}
                >
                  Clear Console
                </button>
              )}
            </div>

            {mode === 'html' ? (
              <div style={styles.previewContainer}>
                <iframe
                  key={nodeId}
                  srcDoc={buildHtmlPreviewSrc(code)}
                  title="Interactive HTML Preview"
                  sandbox="allow-scripts"
                  style={styles.previewIframe}
                />
              </div>
            ) : (
              <div style={styles.consoleContainer}>
                {executionError && (
                  <div style={styles.consoleErrorBanner}>
                    <span style={styles.logIcon}>✗</span>
                    <span style={styles.logMessage}>{executionError}</span>
                  </div>
                )}

                {logs.length === 0 && !executionError ? (
                  <div style={styles.emptyConsole}>
                    <p style={styles.emptyConsoleText}>
                      Console output will appear here. Press <strong>Run Code ⚡</strong> or <strong>Ctrl + Enter</strong> to execute.
                    </p>
                  </div>
                ) : (
                  <div style={styles.logsList}>
                    {logs.map((log, idx) => {
                      let itemStyle = styles.logItem;
                      let badgeStyle = styles.logBadge;

                      if (log.type === 'error') {
                        itemStyle = { ...itemStyle, ...styles.logItemError };
                        badgeStyle = { ...badgeStyle, ...styles.logBadgeError };
                      } else if (log.type === 'warn') {
                        itemStyle = { ...itemStyle, ...styles.logItemWarn };
                        badgeStyle = { ...badgeStyle, ...styles.logBadgeWarn };
                      } else if (log.type === 'info') {
                        itemStyle = { ...itemStyle, ...styles.logItemInfo };
                        badgeStyle = { ...badgeStyle, ...styles.logBadgeInfo };
                      }

                      return (
                        <div key={idx} style={itemStyle}>
                          <span style={badgeStyle}>{log.type}</span>
                          <pre style={styles.logPre}>{log.message}</pre>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- Notes Scratchpad Tab --- */
        <div style={styles.notesContainer}>
          <div style={styles.paneHeader}>
            <span style={styles.paneLabel}>Private Learner Notes for this Skill</span>
            <span style={styles.shortcutHint}>Autosaved locally</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={styles.notesTextarea}
            placeholder={`Jot down personal takeaways, code snippets, mental models, or quiz prep notes for "${nodeTitle}"...`}
          />
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#090d16',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '10px',
    overflow: 'hidden',
    minHeight: '440px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
  },
  containerSplit: {
    height: '100%',
    minHeight: '560px',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    backgroundColor: '#0f172a',
    borderBottom: '1px solid #1e293b',
    flexWrap: 'wrap',
    gap: '10px',
  },
  tabGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '3px',
    borderRadius: '6px',
    border: '1px solid #334155',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabButtonActive: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  },
  actionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  modeToggleGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '6px',
    border: '1px solid #334155',
    padding: '2px',
  },
  modeButton: {
    padding: '4px 10px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  modeButtonActive: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
  },
  secondaryButton: {
    padding: '5px 10px',
    borderRadius: '5px',
    border: '1px solid #334155',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  runButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 14px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#059669',
    color: '#ffffff',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 0 10px rgba(5, 150, 105, 0.4)',
    transition: 'all 0.15s ease',
  },
  livePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    fontSize: '11.5px',
    fontWeight: '700',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#34d399',
    boxShadow: '0 0 6px #34d399',
  },
  savedBadge: {
    fontSize: '11.5px',
    color: '#64748b',
    fontWeight: '500',
    marginLeft: '4px',
  },
  editorWorkspace: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    flex: 1,
    minHeight: '380px',
    backgroundColor: '#060a12',
  },
  editorPane: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #1e293b',
    minHeight: '340px',
  },
  outputPane: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '340px',
    backgroundColor: '#090d16',
  },
  paneHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 14px',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderBottom: '1px solid #1e293b',
  },
  paneLabel: {
    fontSize: '11.5px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#94a3b8',
  },
  shortcutHint: {
    fontSize: '11px',
    color: '#64748b',
  },
  clearConsoleBtn: {
    fontSize: '11px',
    color: '#94a3b8',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  codeTextarea: {
    flex: 1,
    width: '100%',
    minHeight: '320px',
    padding: '14px',
    backgroundColor: '#070b14',
    color: '#e2e8f0',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '13px',
    lineHeight: 1.55,
    border: 'none',
    outline: 'none',
    resize: 'none',
    tabSize: 2,
    whiteSpace: 'pre',
    overflowWrap: 'normal',
    overflowX: 'auto',
  },
  previewContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: '320px',
    backgroundColor: '#0b0f19',
  },
  previewIframe: {
    width: '100%',
    height: '100%',
    minHeight: '320px',
    border: 'none',
    backgroundColor: '#0b0f19',
  },
  consoleContainer: {
    flex: 1,
    padding: '14px',
    overflowY: 'auto',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '12.5px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: '320px',
    backgroundColor: '#060a12',
  },
  consoleErrorBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    color: '#f87171',
    fontSize: '12.5px',
  },
  emptyConsole: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '30px',
  },
  emptyConsoleText: {
    color: '#475569',
    fontSize: '13px',
    lineHeight: 1.5,
    margin: 0,
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  logItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '6px 10px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderLeft: '3px solid #10b981',
  },
  logItemError: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderLeft: '3px solid #ef4444',
  },
  logItemWarn: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderLeft: '3px solid #f59e0b',
  },
  logItemInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderLeft: '3px solid #3b82f6',
  },
  logBadge: {
    fontSize: '10px',
    fontWeight: '800',
    textTransform: 'uppercase',
    padding: '1px 5px',
    borderRadius: '3px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    flexShrink: 0,
    marginTop: '2px',
  },
  logBadgeError: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
  },
  logBadgeWarn: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24',
  },
  logBadgeInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
  },
  logPre: {
    margin: 0,
    color: '#e2e8f0',
    fontSize: '12px',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    flex: 1,
  },
  logIcon: {
    fontWeight: '700',
  },
  logMessage: {
    flex: 1,
  },
  notesContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: '380px',
  },
  notesTextarea: {
    flex: 1,
    minHeight: '340px',
    padding: '18px 20px',
    backgroundColor: '#070b14',
    color: '#f1f5f9',
    fontSize: '14px',
    lineHeight: 1.65,
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
};
