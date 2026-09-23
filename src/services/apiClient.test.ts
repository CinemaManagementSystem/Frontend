import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './apiClient';

const axiosError = (status: number, data: unknown) => ({
  isAxiosError: true,
  response: { status, data },
  message: `Request failed with status code ${status}`,
});

describe('getApiErrorMessage', () => {
  it('uses the backend message when one is returned', () => {
    expect(
      getApiErrorMessage(
        axiosError(400, { status: 400, error: 'Bad Request', message: 'Email address is already registered' }),
        'registration',
      ),
    ).toBe('Email address is already registered');
  });

  it('collects validation messages from an errors map', () => {
    expect(
      getApiErrorMessage(
        axiosError(400, {
          errors: {
            username: 'Username must be between 3 and 50 characters',
            password: 'Password must be at least 6 characters',
          },
        }),
        'registration',
      ),
    ).toBe('Username must be between 3 and 50 characters, Password must be at least 6 characters');
  });

  it('collects validation messages from a direct field-error map', () => {
    expect(
      getApiErrorMessage(
        axiosError(400, {
          username: 'Username must be between 3 and 50 characters',
        }),
        'registration',
      ),
    ).toBe('Username must be between 3 and 50 characters');
  });

  it('uses a sign-in fallback when a 401 response has no useful message', () => {
    expect(
      getApiErrorMessage(
        axiosError(401, { status: 401, error: 'Unauthorized', message: 'Unauthorized' }),
        'sign in',
      ),
    ).toBe('Invalid username/email or password. Please check your credentials and try again.');
  });
});
