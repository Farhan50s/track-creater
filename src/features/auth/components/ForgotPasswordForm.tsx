import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from './AuthLayout';

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    if (!email.trim()) {
      setClientError('Please enter a valid email address.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setClientError('Please enter a valid email address.');
      return false;
    }
    setClientError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email.trim());

      if (error) {
        setServerError(error.message || 'Unable to send password reset email. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setIsSubmitting(false);
    } catch (err: any) {
      setServerError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle={`We have sent password reset instructions to ${email}.`}
        footer={
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
            Return to Sign In
          </Link>
        }
      >
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>✓</div>
          <p style={styles.successText}>
            If an account exists with this email, you will receive a secure link to reset your password.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your account email address and we'll send you a password reset link."
      footer={
        <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
          Back to Sign In
        </Link>
      }
    >
      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        {serverError && (
          <div style={styles.serverError} role="alert">
            {serverError}
          </div>
        )}

        <div style={styles.fieldGroup}>
          <label htmlFor="reset-email" style={styles.label}>
            Email Address
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (clientError) setClientError(null);
            }}
            disabled={isSubmitting}
            placeholder="you@example.com"
            style={{
              ...styles.input,
              borderColor: clientError ? 'var(--status-error)' : 'var(--border-color)',
            }}
            aria-invalid={Boolean(clientError)}
            aria-describedby={clientError ? 'reset-email-error' : undefined}
          />
          {clientError && (
            <span id="reset-email-error" style={styles.fieldError}>
              {clientError}
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
          {isSubmitting ? 'Sending instructions...' : 'Send Reset Link'}
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
  successContainer: {
    textAlign: 'center',
    padding: '12px 0',
  },
  successIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 auto 16px auto',
  },
  successText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
};
