import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircleAlert, Mail, Lock, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { useAuthStore } from '@/store/authStore';
import { getApiErrorMessage } from '@/services/apiClient';

function safeReturnPath(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  // Browsers can remove control characters from URLs before interpreting them.
  if ([...value].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return null;
  return value;
}

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthLoading } = useAuthStore();
  const alertRef = useRef<HTMLDivElement>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) alertRef.current?.focus();
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please fill in both username/email and password');
      return;
    }

    setError('');
    try {
      const user = await login(identifier.trim(), password);
      const isStaff = user.role === 'ADMIN' || user.role === 'STAFF';
      const returnPath = safeReturnPath(searchParams.get('redirect'));
      navigate(returnPath ?? (isStaff ? '/admin/dashboard' : '/'), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'sign in'));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <div
          ref={alertRef}
          id="login-form-error"
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          className="flex items-center gap-2.5 rounded-xl border border-rose-500/60 bg-rose-950/55 px-3.5 py-3 text-sm font-semibold text-rose-200 shadow-[0_12px_30px_rgba(225,29,46,0.12)] outline-none"
        >
          <CircleAlert className="h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Username or Email"
        type="text"
        placeholder="admin or admin@cinema.com"
        value={identifier}
        onChange={(e) => {
          setIdentifier(e.target.value);
          setError('');
        }}
        icon={<Mail className="w-4 h-4" />}
        autoComplete="username"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? 'login-form-error' : undefined}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError('');
        }}
        icon={<Lock className="w-4 h-4" />}
        autoComplete="current-password"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? 'login-form-error' : undefined}
        required
      />

      <div className="text-xs text-muted-foreground pt-1">
        <span>Demo accounts: </span>
        <span className="text-muted-foreground">admin / Admin123, user / User123</span>
      </div>

      <Button
        type="submit"
        disabled={isAuthLoading}
        className="w-full bg-[#E50914] hover:bg-[#ff1f2d] text-white py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-[#E50914]/30 flex items-center justify-center gap-2 mt-2"
      >
        <LogIn className="w-4 h-4" />
        {isAuthLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};
