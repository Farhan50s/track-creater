import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-python';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [content]);

  if (!content) return null;

  // Split content by code blocks: ```lang\ncode\n```
  const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  let blockIdx = 0;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(
        <div key={`text-${blockIdx}-${lastIndex}`} style={styles.proseBlock}>
          {renderFormattedText(textBefore)}
        </div>
      );
    }

    const rawLang = (match[1] || 'typescript').toLowerCase();
    const lang = normalizeLanguage(rawLang);
    const code = match[2].trimEnd();

    let highlightedHtml: string;
    try {
      const grammar = Prism.languages[lang] || Prism.languages.typescript || Prism.languages.javascript;
      highlightedHtml = Prism.highlight(code, grammar, lang);
    } catch {
      highlightedHtml = escapeHtml(code);
    }

    parts.push(
      <div key={`code-${blockIdx}`} style={styles.codeContainer}>
        <div style={styles.codeHeader}>
          <span style={styles.codeLang}>{lang}</span>
        </div>
        <pre style={styles.pre}>
          <code
            className={`language-${lang}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
    blockIdx++;
  }

  const remainingText = content.slice(lastIndex);
  if (remainingText) {
    parts.push(
      <div key={`text-end-${lastIndex}`} style={styles.proseBlock}>
        {renderFormattedText(remainingText)}
      </div>
    );
  }

  return (
    <div className={`markdown-content ${className}`} style={styles.wrapper}>
      {parts}
    </div>
  );
};

function normalizeLanguage(lang: string): string {
  const map: Record<string, string> = {
    ts: 'typescript',
    typescript: 'typescript',
    js: 'javascript',
    javascript: 'javascript',
    tsx: 'tsx',
    jsx: 'jsx',
    py: 'python',
    python: 'python',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    shell: 'bash',
    css: 'css',
    dockerfile: 'docker',
    docker: 'docker',
    json: 'json',
    yml: 'yaml',
    yaml: 'yaml',
    prisma: 'typescript',
  };
  return map[lang] || 'typescript';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderFormattedText(text: string): React.ReactNode {
  // Split into paragraphs by double newlines or single newlines
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((p, pIdx) => {
    const trimmed = p.trim();
    if (!trimmed) return null;

    // Check if it's a list (lines starting with - or * or numbers)
    const lines = trimmed.split('\n');
    const isBulletList = lines.every((l) => /^\s*[-*•]\s+/.test(l));
    const isNumberedList = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));

    if (isBulletList) {
      return (
        <ul key={pIdx} style={styles.ul}>
          {lines.map((line, lIdx) => (
            <li key={lIdx} style={styles.li}>
              {parseInlineFormatting(line.replace(/^\s*[-*•]\s+/, ''))}
            </li>
          ))}
        </ul>
      );
    }

    if (isNumberedList) {
      return (
        <ol key={pIdx} style={styles.ol}>
          {lines.map((line, lIdx) => (
            <li key={lIdx} style={styles.li}>
              {parseInlineFormatting(line.replace(/^\s*\d+[.)]\s+/, ''))}
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p key={pIdx} style={styles.p}>
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });
}

function parseInlineFormatting(text: string): React.ReactNode {
  // Parse inline `code` and **bold**
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      const code = token.slice(1, -1);
      return (
        <code key={idx} style={styles.inlineCode}>
          {code}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      const bold = token.slice(2, -2);
      return (
        <strong key={idx} style={styles.strong}>
          {bold}
        </strong>
      );
    }
    return token;
  });
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
    fontSize: '15px',
    width: '100%',
  },
  proseBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  p: {
    margin: 0,
    lineHeight: '1.7',
    color: 'var(--text-secondary)',
  },
  strong: {
    color: 'var(--text-primary)',
    fontWeight: '700',
  },
  inlineCode: {
    padding: '2px 6px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '4px',
    fontSize: '0.9em',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    color: 'var(--accent-primary)',
  },
  ul: {
    margin: '4px 0',
    paddingLeft: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  ol: {
    margin: '4px 0',
    paddingLeft: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  li: {
    lineHeight: '1.6',
    color: 'var(--text-secondary)',
  },
  codeContainer: {
    margin: '8px 0',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    backgroundColor: '#1d1f21',
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '6px 14px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  codeLang: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  pre: {
    margin: 0,
    padding: '16px',
    overflowX: 'auto',
    backgroundColor: 'transparent',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '13.5px',
    lineHeight: '1.6',
  },
};
