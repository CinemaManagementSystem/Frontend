import { create } from 'zustand';
import { User, AuthState } from '@/types/auth';
import { authService } from '@/services/authService';
import { normalizeUserRole } from '@/lib/authRole';
import { normalizeAvatar } from '@/lib/avatar';

interface AuthStore extends AuthState {
  login: (principal: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  logoutAsync: () => Promise<void>;
  updateProfile: (name: string, email: string, avatar?: string | null) => void;
}

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

function clearPersistedAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function mapUser(user: User): User {
  return { ...user, role: normalizeUserRole(user.role), avatar: normalizeAvatar(user.avatar) };
}

function loadPersisted(): { user: User | null; token: string | null; refreshToken: string | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    if (!token || !rawUser) return { user: null, token: null, refreshToken: null };
    return { user: mapUser(JSON.parse(rawUser) as User), token, refreshToken };
  } catch {
    return { user: null, token: null, refreshToken: null };
  }
}

const persisted = loadPersisted();

export const useAuthStore = create<AuthStore>((set) => ({
  user: persisted.user,
  isAuthenticated: Boolean(persisted.token),
  isAuthLoading: false,
  isLoggingOut: false,
  token: persisted.token,
  refreshToken: persisted.refreshToken,

  login: async (principal, password) => {
    set({ isAuthLoading: true });
    try {
      const isEmail = principal.includes('@');
      const payload = isEmail ? { email: principal, password } : { username: principal, password };
      const response = await authService.login(payload);
      const user = mapUser(response.user);
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({
        user,
        token: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isAuthLoading: false,
      });
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
    clearPersistedAuth();
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isAuthLoading: false });
  },

  logoutAsync: async () => {
    set({ isLoggingOut: true });
    try {
      await authService.logout(localStorage.getItem(REFRESH_TOKEN_KEY));
    } catch {
      // Never let a failed server call block the local sign-out.
    } finally {
      clearPersistedAuth();
      set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isAuthLoading: false, isLoggingOut: false });
    }
  },

  updateProfile: (name, email, avatar) => {
    set((state) => {
      if (!state.user) return state;
      const updated: User = { ...state.user, name, email };
      if (avatar !== undefined) updated.avatar = avatar ?? undefined;
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return { user: updated };
    });
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('cinematique:auth-expired', () => {
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isAuthLoading: false,
      isLoggingOut: false,
    });
  });
}
