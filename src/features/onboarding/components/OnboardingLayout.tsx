import React from 'react';

interface OnboardingLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function OnboardingLayout({ title, subtitle, children, maxWidth = '680px' }: OnboardingLayoutProps) {
  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, maxWidth }}>
        <div style={styles.header}>
          <h1 style={styles.title}>{title}</h1>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>

        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 140px)',
    padding: '40px 16px',
    backgroundColor: 'var(--bg-primary)',
  },
  card: {
    width: '100%',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '36px 32px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    maxWidth: '540px',
    margin: '0 auto',
  },
  body: {
    width: '100%',
  },
};
