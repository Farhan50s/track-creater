import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from './AuthLayout';

export function SignupForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientErrors, setClientErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!email.trim()) {
      errors.email = 'Please enter a valid email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match.';
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
      const { data, error } = await signUp(email.trim(), password);

      if (error) {
        setServerError(error.message || 'Unable to create account. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // If user is returned with an active session, navigate directly to onboarding
      if (data?.session) {
        navigate('/onboarding/goal', { replace: true });
      } else {
        // If email confirmation is enabled on the project and session is not returned immediately
        navigate('/login', { replace: true });
      }
    } catch (err: any) {
      setServerError('An unexpected error occurred during registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Start your structured skill roadmap and track your progressive mastery."
      footer={
        <span>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
            Sign in
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
          <label htmlFor="signup-email" style={styles.label}>
            Email Address
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" style={styles.label}>
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (clientErrors.password) setClientErrors((prev) => ({ ...prev, password: undefined }));
            }}
            disabled={isSubmitting}
            placeholder="At least 6 characters"
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

        <div style={styles.fieldGroup}>
          <label htmlFor="signup-confirm-password" style={styles.label}>
            Confirm Password
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (clientErrors.confirmPassword) setClientErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            disabled={isSubmitting}
            placeholder="Confirm your password"
            style={{
              ...styles.input,
              borderColor: clientErrors.confirmPassword ? 'var(--status-error)' : 'var(--border-color)',
            }}
            aria-invalid={Boolean(clientErrors.confirmPassword)}
            aria-describedby={clientErrors.confirmPassword ? 'confirm-error' : undefined}
          />
          {clientErrors.confirmPassword && (
            <span id="confirm-error" style={styles.fieldError}>
              {clientErrors.confirmPassword}
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
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
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
};
