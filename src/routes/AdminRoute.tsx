import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { canAccessAdmin } from '@/lib/authRole';

export const AdminRoute: React.FC = () => {
  const { user, isAuthenticated, isAuthLoading } = useAuthStore();
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
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
        state={{ from: redirect }}
      />
    );
  }

  if (!canAccessAdmin(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
