import React from 'react';
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { canAccessAdmin } from '@/lib/authRole';

function safeReturnPath(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  if ([...value].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return null;
  return value;
}

export const GuestRoute: React.FC = () => {
  const { user, isAuthenticated, isAuthLoading } = useAuthStore();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <p className="text-xs font-medium text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const redirect = safeReturnPath(searchParams.get('redirect'));
    return (
      <Navigate
        to={canAccessAdmin(user.role) ? '/admin/dashboard' : (redirect ?? '/')}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
};
