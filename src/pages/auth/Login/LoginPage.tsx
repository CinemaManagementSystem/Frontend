import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/forms/LoginForm/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs text-muted-foreground">
          Sign in to access your tickets, cinema rewards, and bookings
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-xs text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#E50914] font-bold hover:underline">
          Sign Up Now
        </Link>
      </p>
    </div>
  );
};
