import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/forms/LoginForm/LoginForm';
import { useLanguage } from '@/i18n';

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          {t('auth.welcomeBack')}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t('auth.signInSubtitle')}
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-xs text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-[#E50914] font-bold hover:underline">
          {t('auth.signUp')}
        </Link>
      </p>
    </div>
  );
};
