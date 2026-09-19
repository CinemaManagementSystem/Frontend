import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LoginForm } from './LoginForm';

const { login } = vi.hoisted(() => ({ login: vi.fn() }));
vi.mock('@/store/authStore', () => ({ useAuthStore: () => ({ login, isAuthLoading: false }) }));

function Destination() {
  const location = useLocation();
  return <p data-testid="destination">{location.pathname}{location.search}{location.hash}</p>;
}

function openLogin(redirect?: string) {
  render(<MemoryRouter initialEntries={[`/login${redirect === undefined ? '' : `?redirect=${encodeURIComponent(redirect)}`}`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes><Route path="/login" element={<LoginForm />} /><Route path="*" element={<Destination />} /></Routes>
  </MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Username or Email'), { target: { value: 'moviegoer' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'example-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
}

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  login.mockResolvedValue({ id: 1, username: 'moviegoer', email: 'movie@example.test', role: 'USER' });
});

describe('login return destination', () => {
  it.each(['/cinemas?cinema=c-2', '/promotion#food-menu', '/fnb', '/booking/st-2?movieId=m-1'])('returns customers to their requested page: %s', async (redirect) => {
    openLogin(redirect);
    expect(await screen.findByTestId('destination')).toHaveTextContent(redirect);
    expect(login).toHaveBeenCalledWith('moviegoer', 'example-password');
  });

  it.each([undefined, 'https://example.test', '//example.test', '/\\example.test', '/\t/example.test', 'javascript:alert(1)'])('falls back home for missing or unsafe destinations: %s', async (redirect) => {
    openLogin(redirect);
    expect((await screen.findByTestId('destination')).textContent).toBe('/');
  });

  it.each(['ADMIN', 'STAFF'])('honors the explicit return destination for %s', async (role) => {
    login.mockResolvedValue({ id: 1, username: 'staff', email: 'staff@example.test', role });
    openLogin('/promotion');
    expect(await screen.findByTestId('destination')).toHaveTextContent('/promotion');
  });

  it.each([
    ['ADMIN', undefined], ['STAFF', undefined],
    ['ADMIN', '//example.test'], ['STAFF', '/\\example.test'],
  ])('uses the %s dashboard fallback when the return destination is missing or unsafe: %s', async (role, redirect) => {
    login.mockResolvedValue({ id: 1, username: 'staff', email: 'staff@example.test', role });
    openLogin(redirect);
    expect(await screen.findByTestId('destination')).toHaveTextContent('/admin/dashboard');
  });

  it('keeps a failed sign-in on the form', async () => {
    login.mockRejectedValue(new Error('Incorrect password'));
    openLogin('/cinemas?cinema=c-2');
    expect(await screen.findByText('Incorrect password')).toBeInTheDocument();
    expect(screen.queryByTestId('destination')).not.toBeInTheDocument();
  });
});
