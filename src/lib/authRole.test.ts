import { describe, expect, it } from 'vitest';
import { canAccessAdmin, isAdminRole, normalizeUserRole } from './authRole';

describe('authRole helpers', () => {
  it.each([
    ['ADMIN', 'ADMIN'],
    ['ROLE_ADMIN', 'ADMIN'],
    ['role_admin', 'ADMIN'],
    ['staff', 'STAFF'],
    ['ROLE_STAFF', 'STAFF'],
    ['USER', 'USER'],
    [undefined, 'USER'],
  ] as const)('normalizes %s to %s', (input, expected) => {
    expect(normalizeUserRole(input)).toBe(expected);
  });

  it('checks admin-only and dashboard-capable roles', () => {
    expect(isAdminRole('ROLE_ADMIN')).toBe(true);
    expect(isAdminRole('STAFF')).toBe(false);
    expect(canAccessAdmin('STAFF')).toBe(true);
    expect(canAccessAdmin('USER')).toBe(false);
  });
});
