import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LoadingFallback } from '../LoadingFallback';

export function OnboardingGuard({ children }: { children?: React.ReactNode }) {
  const { user, hasActiveTrack, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  // If user is authenticated but has no active track, redirect to onboarding
  if (user && !hasActiveTrack) {
    return <Navigate to="/onboarding/goal" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
