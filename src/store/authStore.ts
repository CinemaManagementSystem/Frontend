import { create } from 'zustand';
import { User, AuthState, UserRole } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthStore extends AuthState {
  login: (principal: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'auth_user';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';

function normalizeRole(role: string): UserRole {
  const normalized = role.replace(/^ROLE_/, '').toUpperCase();
  if (normalized === 'ADMIN' || normalized === 'STAFF') {
    return normalized;
  }
  return 'USER';
}

function mapUser(user: User): User {
  return { ...user, role: normalizeRole(user.role), avatar: user.avatar || DEFAULT_AVATAR };
}

function loadPersisted(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    if (!token || !rawUser) return { user: null, token: null };
    return { user: JSON.parse(rawUser) as User, token };
  } catch {
    return { user: null, token: null };
  }
}

const persisted = loadPersisted();

export const useAuthStore = create<AuthStore>((set) => ({
  user: persisted.user,
  isAuthenticated: Boolean(persisted.token),
  isAuthLoading: false,
  token: persisted.token,

  login: async (principal, password) => {
    set({ isAuthLoading: true });
    try {
      const isEmail = principal.includes('@');
      const payload = isEmail ? { email: principal, password } : { username: principal, password };
      const response = await authService.login(payload);
      const user = mapUser(response.user);
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token: response.accessToken, isAuthenticated: true, isAuthLoading: false });
      return user;
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },

  register: async (username, email, password) => {
    set({ isAuthLoading: true });
    try {
      const response = await authService.register({ username, email, password });
      set({ isAuthLoading: false });
      return mapUser(response.user);
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));