import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getSafeRedirectPath } from '../utils/redirect';
import { AuthLayout } from './AuthLayout';

export function LoginForm() {
  const { signIn, hasActiveTrack } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientErrors, setClientErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Please enter a valid email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        setServerError(error.message || 'Invalid email or password.');
        setIsSubmitting(false);
        return;
      }

      // Safe navigation after login
      const requestedRedirect = searchParams.get('redirectTo');
      if (requestedRedirect) {
        navigate(getSafeRedirectPath(requestedRedirect, '/app'), { replace: true });
      } else if (!hasActiveTrack) {
        navigate('/onboarding/goal', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    } catch (err: any) {
      setServerError('An unexpected error occurred during sign in. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleDevQuickLogin = async (devEmail?: string, devPassword?: string) => {
    const targetEmail = devEmail || import.meta.env.VITE_DEV_USER_EMAIL || 'test@example.com';
    const targetPassword = devPassword || import.meta.env.VITE_DEV_USER_PASSWORD || 'password123';

    setEmail(targetEmail);
    setPassword(targetPassword);
    setServerError(null);
    setIsSubmitting(true);

    try {
      const { error } = await signIn(targetEmail.trim(), targetPassword);

      if (error) {
        setServerError(error.message || 'Dev quick login failed. Please verify the test user exists.');
        setIsSubmitting(false);
        return;
      }

      // Safe navigation after login
      const requestedRedirect = searchParams.get('redirectTo');
      if (requestedRedirect) {
        navigate(getSafeRedirectPath(requestedRedirect, '/app'), { replace: true });
      } else if (!hasActiveTrack) {
        navigate('/onboarding/goal', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    } catch (err: any) {
      setServerError('An unexpected error occurred during dev quick sign in.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your Track Creator account to continue your learning roadmap."
      footer={
        <span>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
            Sign up
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        {serverError && (
          <div style={styles.serverError} role="alert">
            {serverError}
          </div>
        )}

        <div style={styles.fieldGroup}>
          <label htmlFor="login-email" style={styles.label}>
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (clientErrors.email) setClientErrors((prev) => ({ ...prev, email: undefined }));
            }}
            disabled={isSubmitting}
            placeholder="you@example.com"
            style={{
              ...styles.input,
              borderColor: clientErrors.email ? 'var(--status-error)' : 'var(--border-color)',
            }}
            aria-invalid={Boolean(clientErrors.email)}
            aria-describedby={clientErrors.email ? 'email-error' : undefined}
          />
          {clientErrors.email && (
            <span id="email-error" style={styles.fieldError}>
              {clientErrors.email}
            </span>
          )}
        </div>

        <div style={styles.fieldGroup}>
          <div style={styles.passwordHeader}>
            <label htmlFor="login-password" style={styles.label}>
              Password
            </label>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (clientErrors.password) setClientErrors((prev) => ({ ...prev, password: undefined }));
            }}
            disabled={isSubmitting}
            placeholder="••••••••"
            style={{
              ...styles.input,
              borderColor: clientErrors.password ? 'var(--status-error)' : 'var(--border-color)',
            }}
            aria-invalid={Boolean(clientErrors.password)}
            aria-describedby={clientErrors.password ? 'password-error' : undefined}
          />
          {clientErrors.password && (
            <span id="password-error" style={styles.fieldError}>
              {clientErrors.password}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            ...styles.submitButton,
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        {import.meta.env.DEV && (
          <div className="mt-6 pt-4 border-t border-slate-800" style={styles.devSection}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                const devEmail = import.meta.env.VITE_DEV_USER_EMAIL || 'test@example.com';
                const devPassword = import.meta.env.VITE_DEV_USER_PASSWORD || 'password123';
                await handleDevQuickLogin(devEmail, devPassword);
              }}
              className="w-full py-2 px-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded hover:bg-amber-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              style={styles.devButton}
            >
              ⚡ Dev Quick Login (1-Click)
            </button>
          </div>
        )}
      </form>
    </AuthLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  passwordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '15px',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },
  fieldError: {
    fontSize: '12px',
    color: 'var(--status-error)',
    marginTop: '2px',
  },
  serverError: {
    padding: '10px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--status-error)',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    marginTop: '8px',
    transition: 'background-color 0.15s ease',
  },
  devSection: {
    marginTop: '8px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
  },
  devButton: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fcd34d',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.35)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.15s ease',
  },
};
