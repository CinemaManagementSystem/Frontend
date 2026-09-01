import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import type { AuthResponse, AuthState, User, UserRole, RegisterResponse } from '@/types/auth';

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

const initialState: AuthState = {
  user: persisted.user,
  isAuthenticated: Boolean(persisted.token),
  isAuthLoading: false,
  token: persisted.token,
};

export const login = createAsyncThunk<User, { principal: string; password: string }>(
  'auth/login',
  async ({ principal, password }) => {
    const isEmail = principal.includes('@');
    const payload = isEmail ? { email: principal, password } : { username: principal, password };
    const response: AuthResponse = await authService.login(payload);
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    return response.user;
  },
);

export const register = createAsyncThunk<User, { username: string; email: string; password: string }>(
  'auth/register',
  async ({ username, email, password }) => {
    const response: RegisterResponse = await authService.register({ username, email, password });
    return response.user;
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = mapUser(action.payload);
        state.token = localStorage.getItem(TOKEN_KEY);
        state.isAuthenticated = true;
        state.isAuthLoading = false;
      })
      .addCase(login.rejected, (state) => {
        state.isAuthLoading = false;
      })
      .addCase(register.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(register.fulfilled, (state) => {
        state.isAuthLoading = false;
      })
      .addCase(register.rejected, (state) => {
        state.isAuthLoading = false;
      });
  },
});

export const { logout } = authSlice.actions;

export const authReducer = authSlice.reducer;