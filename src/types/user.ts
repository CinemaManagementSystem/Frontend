export type Role = 'USER' | 'STAFF' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  name?: string;
  status?: string;
}

export interface UserInput {
  username?: string;
  email: string;
  name: string;
  password?: string;
  role: Role;
  status: string;
}
