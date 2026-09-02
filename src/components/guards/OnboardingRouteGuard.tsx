import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LoadingFallback } from '../LoadingFallback';

export function OnboardingRouteGuard({ children }: { children?: React.ReactNode }) {
  const { hasActiveTrack, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  // /onboarding/goal is accessible for both initial enrollment and in-app track switching
  if (hasActiveTrack && location.pathname.includes('/onboarding/knowledge')) {
    return <Navigate to="/app" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
