import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, CircleAlert } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { useAuthStore } from '@/store/authStore';

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: unknown } }).response;
    if (typeof response?.data === 'object' && response.data !== null) {
      const data = response.data as { message?: unknown; error?: unknown; detail?: unknown; errors?: unknown };
      for (const value of [data.message, data.detail]) {
        if (typeof value === 'string' && value.trim()) return value;
      }
      if (Array.isArray(data.errors)) {
        const messages = data.errors.filter((value): value is string => typeof value === 'string' && Boolean(value.trim()));
        if (messages.length) return messages.join(', ');
      }
      if (typeof data.errors === 'object' && data.errors !== null) {
        const messages = Object.values(data.errors as Record<string, unknown>)
          .flatMap((value) => Array.isArray(value) ? value : [value])
          .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()));
        if (messages.length) return messages.join(', ');
      }
      if (typeof data.error === 'string' && data.error.trim() && !/^bad request$/i.test(data.error.trim())) {
        return data.error;
      }
    }
    if (typeof response?.data === 'string' && response.data.trim() && !response.data.trimStart().startsWith('<')) return response.data;
    if (response?.status === 400) {
      return 'Please check your username, email address, and password, then try again.';
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Unable to create account. Please try again.';
}

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    if (!cleanUsername || !cleanEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (cleanUsername.length < 3 || cleanUsername.length > 50) {
      setError('Username must be between 3 and 50 characters.');
      return;
    }
    if (password.length < 6 || password.length > 255) {
      setError('Password must be between 6 and 255 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!acceptedTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setError('');
    try {
      await register(cleanUsername, cleanEmail, password);
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <div role="alert" aria-live="assertive" className="flex items-start gap-2.5 rounded-lg border border-rose-500/40 bg-rose-500/15 p-3 text-sm font-medium text-rose-300">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Username"
        type="text"
        placeholder="jane_doe"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          setError('');
        }}
        icon={<User className="w-4 h-4" />}
        autoComplete="username"
        required
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError('');
        }}
        icon={<Mail className="w-4 h-4" />}
        autoComplete="email"
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError('');
        }}
        icon={<Lock className="w-4 h-4" />}
        autoComplete="new-password"
        required
      />

      <div className="text-xs text-muted-foreground pt-1">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => {
              setAcceptedTerms(e.target.checked);
              setError('');
            }}
            className="w-3.5 h-3.5 mt-0.5 rounded bg-input border-border text-[#E50914] focus:ring-0"
          />
          <span>
            I agree to the{' '}
            <a href="#terms" className="text-[#E50914] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-[#E50914] hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      <Button
        type="submit"
        disabled={isAuthLoading}
        className="w-full bg-[#E50914] hover:bg-[#ff1f2d] text-white py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-[#E50914]/30 flex items-center justify-center gap-2 mt-2"
      >
        <UserPlus className="w-4 h-4" />
        {isAuthLoading ? 'Creating Account...' : 'Create an account'}
      </Button>
    </form>
  );
};
