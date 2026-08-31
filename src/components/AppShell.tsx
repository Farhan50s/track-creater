import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

const ROUTES = [
  { path: '/', label: 'Landing' },
  { path: '/signup', label: 'Sign Up' },
  { path: '/login', label: 'Login' },
  { path: '/forgot-password', label: 'Forgot Password' },
  { path: '/onboarding/goal', label: 'Onboarding Goal' },
  { path: '/onboarding/knowledge', label: 'Starting Knowledge' },
  { path: '/app', label: 'Home' },
  { path: '/app/track', label: 'Track Overview' },
  { path: '/app/profile', label: 'Profile' },
];

export function AppShell() {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-brand">
          <span className="app-header-title">Track Creator</span>
          <span className="app-header-badge">V1 Production</span>
        </div>

        <div className="app-header-user">
          {!isLoading && (
            <>
              {user ? (
                <div style={styles.userSection}>
                  <span style={styles.userEmail} title={user.email}>
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    style={styles.logoutButton}
                    type="button"
                    aria-label="Log out of account"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div style={styles.authLinks}>
                  <NavLink to="/login" className="nav-link" style={styles.authLinkBtn}>
                    Sign In
                  </NavLink>
                  <NavLink to="/signup" className="nav-link" style={{ ...styles.authLinkBtn, ...styles.signUpLink }}>
                    Sign Up
                  </NavLink>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      <nav className="app-nav" aria-label="Application Navigation">
        <span className="app-nav-label">Navigation:</span>
        {ROUTES.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.path === '/' || route.path === '/app'}
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            {route.label}
          </NavLink>
        ))}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  userEmail: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutButton: {
    minHeight: '38px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  authLinkBtn: {
    minHeight: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpLink: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--accent-primary)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    fontWeight: '600',
  },
};
