import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';

export function AppShell() {
  const { user, signOut, isLoading, hasActiveTrack } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTrackName, setActiveTrackName] = useState<string | null>(null);

  useEffect(() => {
    async function loadActiveTrackName() {
      if (!user) {
        setActiveTrackName(null);
        return;
      }

      try {
        const { data } = await supabase
          .from('user_active_track')
          .select(`
            track_id,
            tracks:track_id (
              name
            )
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && (data as any).tracks?.name) {
          setActiveTrackName((data as any).tracks.name);
        } else {
          setActiveTrackName(null);
        }
      } catch (e) {
        console.error('Error fetching active track name for header:', e);
      }
    }

    loadActiveTrackName();
  }, [user, hasActiveTrack, location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-left">
          <Link
            to={user ? '/app' : '/'}
            className="app-header-brand"
            aria-label="Track Creator Home"
          >
            <span className="app-header-title">Track Creator</span>
            <span className="app-header-badge">V1 Production</span>
          </Link>

          {user && !isLoading && (
            <nav className="app-header-nav" aria-label="Main Navigation">
              <NavLink
                to="/app"
                end
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/app/track"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Track Map
              </NavLink>
              <NavLink
                to="/onboarding/goal"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Switch Track
              </NavLink>
            </nav>
          )}
        </div>

        <div className="app-header-user">
          {!isLoading && (
            <>
              {user ? (
                <div style={styles.userSection}>
                  {activeTrackName && (
                    <Link
                      to="/onboarding/goal"
                      style={styles.activeTrackPill}
                      title={`Active Track: ${activeTrackName}. Click to switch.`}
                      aria-label={`Current Track: ${activeTrackName}`}
                    >
                      <span style={styles.trackPillIcon}>🎯</span>
                      <span style={styles.trackPillText}>{activeTrackName}</span>
                    </Link>
                  )}

                  <NavLink
                    to="/app/profile"
                    className={({ isActive }) =>
                      isActive ? 'nav-link active' : 'nav-link'
                    }
                    style={styles.profileLink}
                    title="Account Settings"
                    aria-label="View Account Profile"
                  >
                    <span style={styles.userIcon}>👤</span>
                    <span style={styles.userEmail}>{user.email}</span>
                  </NavLink>
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
                  <NavLink
                    to="/signup"
                    className="nav-link"
                    style={{ ...styles.authLinkBtn, ...styles.signUpLink }}
                  >
                    Start Learning
                  </NavLink>
                </div>
              )}
            </>
          )}
        </div>
      </header>

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
  activeTrackPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '9999px',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--accent-primary)',
    transition: 'all 0.15s ease',
    maxWidth: '220px',
  },
  trackPillIcon: {
    fontSize: '11px',
  },
  trackPillText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  profileLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
  },
  userIcon: {
    fontSize: '13px',
    lineHeight: 1,
  },
  userEmail: {
    fontSize: '13px',
    maxWidth: '180px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutButton: {
    minHeight: '36px',
    padding: '6px 14px',
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
    gap: '10px',
  },
  authLinkBtn: {
    minHeight: '36px',
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpLink: {
    backgroundColor: 'var(--accent-primary)',
    color: '#09090b',
    border: 'none',
    fontWeight: '700',
  },
};
