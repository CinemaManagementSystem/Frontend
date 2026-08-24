import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { useAuthStore } from '@/store/authStore';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      // If email has 'admin', login as ADMIN, else USER
      const role = email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';
      login(email, role);
      setLoading(false);
      navigate(role === 'ADMIN' ? '/admin/dashboard' : '/');
    }, 600);
  };

  const handleDemoAdmin = () => {
    login('admin@cinematique.com', 'ADMIN');
    navigate('/admin/dashboard');
  };

  const handleDemoUser = () => {
    login('customer@example.com', 'USER');
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
          {error}
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className="w-4 h-4" />}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock className="w-4 h-4" />}
        required
      />

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded bg-[#1e1e22] border-white/20 text-[#E50914] focus:ring-0"
          />
          <span>Remember me</span>
        </label>
        <a href="forgot" className="text-gray-400 hover:text-[#E50914] transition-colors">
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E50914] hover:bg-[#ff1f2d] text-white py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-[#E50914]/30 flex items-center justify-center gap-2 mt-2"
      >
        <LogIn className="w-4 h-4" />
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      {/* Demo helper buttons */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <p className="text-[11px] text-gray-400 text-center font-medium">
          Or instant login with sample accounts:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDemoAdmin}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-300 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Demo Admin
          </button>
          <button
            type="button"
            onClick={handleDemoUser}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors"
          >
            Demo User
          </button>
        </div>
      </div>
    </form>
  );
};
