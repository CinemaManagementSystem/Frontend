import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/forms/LoginForm/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
          Welcome back to Cinematique
        </h2>
        <p className="text-xs text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-xs text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#E50914] font-bold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
};
