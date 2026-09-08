import type { UserRole } from '@/types/auth';

export function normalizeUserRole(role: unknown): UserRole {
  const normalized = String(role ?? '').replace(/^ROLE_/i, '').toUpperCase();
  if (normalized === 'ADMIN' || normalized === 'STAFF') {
    return normalized;
  }
  return 'USER';
}

export function isAdminRole(role: unknown): boolean {
  return normalizeUserRole(role) === 'ADMIN';
}

export function canAccessAdmin(role: unknown): boolean {
  const normalized = normalizeUserRole(role);
  return normalized === 'ADMIN' || normalized === 'STAFF';
}
