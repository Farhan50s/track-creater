import { NavLink, Outlet } from 'react-router-dom';

const ROUTES = [
  { path: '/', label: 'Landing' },
  { path: '/signup', label: 'Sign Up' },
  { path: '/login', label: 'Login' },
  { path: '/forgot-password', label: 'Forgot Password' },
  { path: '/onboarding/goal', label: 'Onboarding Goal' },
  { path: '/onboarding/knowledge', label: 'Starting Knowledge' },
  { path: '/app', label: 'Home' },
  { path: '/app/track', label: 'Track Overview' },
  { path: '/app/track/sample-pillar', label: 'Pillar View (:pillarId)' },
  { path: '/app/node/sample-node', label: 'Skill Detail (:nodeId)' },
  { path: '/app/node/sample-node/quiz', label: 'Quiz (:nodeId)' },
  { path: '/app/profile', label: 'Profile' },
];

export function AppShell() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-brand">
          <span className="app-header-title">Track Creator</span>
          <span className="app-header-badge">Phase 0 Scaffold</span>
        </div>
      </header>

      <nav className="app-nav" aria-label="Phase 0 Route Navigation">
        <span className="app-nav-label">Routes:</span>
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
