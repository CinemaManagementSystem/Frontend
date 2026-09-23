import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RegisterForm } from './RegisterForm';

const { register } = vi.hoisted(() => ({ register: vi.fn() }));
vi.mock('@/store/authStore', () => ({ useAuthStore: () => ({ register, isAuthLoading: false }) }));

function submitRegistration(username = 'jane_doe') {
  render(
    <MemoryRouter initialEntries={['/register']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<h1>Sign in</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: username } });
  fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@example.test' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'strong-password' } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));
}

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  register.mockResolvedValue({ id: 1, username: 'jane_doe', email: 'jane@example.test', role: 'USER' });
});

describe('registration errors', () => {
  it('shows the username length error on the form without sending an invalid request', async () => {
    submitRegistration('ab');

    expect(await screen.findByRole('alert')).toHaveTextContent('Username must be between 3 and 50 characters.');
    expect(register).not.toHaveBeenCalled();
  });

  it('shows the backend validation message in an accessible alert', async () => {
    register.mockRejectedValue({
      response: { status: 400, data: { status: 400, error: 'Bad Request', message: 'Email address is already registered' } },
    });

    submitRegistration();

    expect(await screen.findByRole('alert')).toHaveTextContent('Email address is already registered');
    expect(screen.queryByRole('heading', { name: 'Sign in' })).not.toBeInTheDocument();
  });

  it('shows validation errors returned as a field-error map', async () => {
    register.mockRejectedValue({
      response: { status: 400, data: { errors: { username: 'Username must be between 3 and 50 characters' } } },
    });

    submitRegistration();

    expect(await screen.findByRole('alert')).toHaveTextContent('Username must be between 3 and 50 characters');
  });

  it('shows a helpful fallback when the server returns an empty 400 response', async () => {
    register.mockRejectedValue({ response: { status: 400, data: {} } });

    submitRegistration();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please check your username, email address, and password, then try again.',
    );
  });

  it('clears the alert when the user edits a field', async () => {
    register.mockRejectedValue({ response: { status: 400, data: { message: 'Username is already taken' } } });

    submitRegistration();
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'jane_doe2' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
