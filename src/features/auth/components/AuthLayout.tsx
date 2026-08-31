import React from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>{title}</h1>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>

        <div style={styles.body}>{children}</div>

        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 140px)',
    padding: '24px 16px',
    backgroundColor: 'var(--bg-primary)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px 28px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
  header: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  body: {
    width: '100%',
  },
  footer: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color-subtle)',
    textAlign: 'center',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
};
