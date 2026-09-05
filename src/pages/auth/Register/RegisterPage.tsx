import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '@/components/forms/RegisterForm/RegisterForm';
import { useLanguage } from '@/i18n';

export const RegisterPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
          {t('auth.createAccount')}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t('auth.createSubtitle')}
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-xs text-muted-foreground">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-[#E50914] font-bold hover:underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  );
};
