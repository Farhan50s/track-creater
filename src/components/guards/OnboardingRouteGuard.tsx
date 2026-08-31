import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LoadingFallback } from '../LoadingFallback';

export function OnboardingRouteGuard({ children }: { children?: React.ReactNode }) {
  const { hasActiveTrack, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  // If user already has an active track, onboarding is complete; redirect to /app
  if (hasActiveTrack) {
    return <Navigate to="/app" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
