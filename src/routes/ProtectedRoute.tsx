import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/** Wrap any element that requires a logged-in user. */
export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isAuthLoading, user } = useAuthStore();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <p className="text-xs font-medium text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
