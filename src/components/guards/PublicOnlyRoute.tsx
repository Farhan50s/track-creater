import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getSafeRedirectPath } from '../../features/auth/utils/redirect';
import { LoadingFallback } from '../LoadingFallback';

export function PublicOnlyRoute({ children }: { children?: React.ReactNode }) {
  const { user, hasActiveTrack, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (user) {
    if (!hasActiveTrack) {
      return <Navigate to="/onboarding/goal" replace />;
    }
    const safeTarget = getSafeRedirectPath(searchParams.get('redirectTo'), '/app');
    return <Navigate to={safeTarget} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
