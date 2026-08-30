export type Role = 'USER' | 'STAFF' | 'MANAGER' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface UserInput {
  username: string;
  email: string;
  name: string;
  password: string;
  role: Role;
  status: string;
}