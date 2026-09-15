export type UserRole = 'ADMIN' | 'STAFF' | 'USER';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isLoggingOut: boolean;
  token: string | null;
}