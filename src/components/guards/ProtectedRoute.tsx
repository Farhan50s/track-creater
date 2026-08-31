import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LoadingFallback } from '../LoadingFallback';

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirectTo=${returnUrl}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
