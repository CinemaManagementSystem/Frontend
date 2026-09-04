import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/i18n';

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Unable to sign in. Please try again.';
}

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthLoading } = useAuthStore();
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError(t('auth.validation.fillBoth'));
      return;
    }

    setError('');
    try {
      const user = await login(identifier.trim(), password);
      const isStaff = user.role === 'ADMIN' || user.role === 'STAFF';
      navigate(isStaff ? '/admin/dashboard' : '/');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
          {error}
        </div>
      )}

      <Input
        label={t('auth.usernameOrEmail')}
        type="text"
        placeholder={t('auth.usernamePlaceholder')}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        icon={<Mail className="w-4 h-4" />}
        autoComplete="username"
        required
      />

      <Input
        label={t('auth.password')}
        type="password"
        placeholder={t('auth.passwordPlaceholder')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock className="w-4 h-4" />}
        autoComplete="current-password"
        required
      />

      <div className="text-xs text-muted-foreground pt-1">
        <span>{t('auth.demoAccounts')} </span>
        <span className="text-muted-foreground">{t('auth.demoCredentials')}</span>
      </div>

      <Button
        type="submit"
        disabled={isAuthLoading}
        className="w-full bg-[#E50914] hover:bg-[#ff1f2d] text-white py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-[#E50914]/30 flex items-center justify-center gap-2 mt-2"
      >
        <LogIn className="w-4 h-4" />
        {isAuthLoading ? t('auth.signingIn') : t('auth.signIn')}
      </Button>
    </form>
  );
};
