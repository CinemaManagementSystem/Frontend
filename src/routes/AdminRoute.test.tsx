import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';

const auth = vi.hoisted(() => ({
  user: null as { role: string } | null,
  isAuthenticated: false,
  isAuthLoading: false,
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => auth,
}));

function LocationProbe(): React.JSX.Element {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  return <div>{from}</div>;
}

function renderGuarded(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>DASHBOARD_LAYOUT<Outlet /></div>}>
            <Route path="movies" element={<div>MOVIES_PAGE</div>} />
          </Route>
        </Route>
        <Route
          path="/login"
          element={
            <div>
              <div>LOGIN_PAGE</div>
              <LocationProbe />
            </div>
          }
        />
        <Route path="/" element={<div>HOME_PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  beforeEach(() => {
    auth.user = null;
    auth.isAuthenticated = false;
    auth.isAuthLoading = false;
  });

  it('shows a loading state while the auth status is resolving', () => {
    auth.isAuthLoading = true;
    renderGuarded('/admin');
    expect(screen.getByText('Checking access...')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login while preserving the attempted URL', () => {
    renderGuarded('/admin/movies');
    expect(screen.getByText('LOGIN_PAGE')).toBeInTheDocument();
    expect(screen.getByText('/admin/movies')).toBeInTheDocument();
  });

  it('redirects non-admin users to the home page', () => {
    auth.isAuthenticated = true;
    auth.user = { role: 'USER' };
    renderGuarded('/admin/movies');
    expect(screen.getByText('HOME_PAGE')).toBeInTheDocument();
  });

  it('redirects MEMBER/STAFF roles away from the admin portal', () => {
    auth.isAuthenticated = true;
    auth.user = { role: 'MEMBER' };
    renderGuarded('/admin/movies');
    expect(screen.getByText('HOME_PAGE')).toBeInTheDocument();
  });

  it('allows ADMIN users through to the admin layout and child pages', () => {
    auth.isAuthenticated = true;
    auth.user = { role: 'ADMIN' };
    renderGuarded('/admin/movies');
    expect(screen.getByText('DASHBOARD_LAYOUT')).toBeInTheDocument();
    expect(screen.getByText('MOVIES_PAGE')).toBeInTheDocument();
  });
});