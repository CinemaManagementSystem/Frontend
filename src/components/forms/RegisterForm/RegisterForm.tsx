import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { useAuthStore } from '@/store/authStore';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      register(name, email);
      setLoading(false);
      navigate('/');
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
          {error}
        </div>
      )}

      <Input
        label="Full Name"
        type="text"
        placeholder="Jane Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        icon={<User className="w-4 h-4" />}
        required
      />

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
        placeholder="Create a strong password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock className="w-4 h-4" />}
        required
      />

      <div className="text-xs text-gray-400 pt-1">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            required
            className="w-3.5 h-3.5 mt-0.5 rounded bg-[#1e1e22] border-white/20 text-[#E50914] focus:ring-0"
          />
          <span>
            I agree to the{' '}
            <a href="#terms" className="text-white hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-white hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E50914] hover:bg-[#ff1f2d] text-white py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-[#E50914]/30 flex items-center justify-center gap-2 mt-2"
      >
        <UserPlus className="w-4 h-4" />
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};
