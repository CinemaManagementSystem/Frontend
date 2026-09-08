export const AUDIT_CATEGORIES = ['Authentication', 'Accounts', 'Catalog', 'Bookings', 'Payments', 'Settings'] as const;
export const AUDIT_OUTCOMES = ['SUCCESS', 'FAILURE', 'WARNING'] as const;

export type AuditOutcome = typeof AUDIT_OUTCOMES[number];

export interface AuditEvent {
  id: string;
  occurredAt: string;
  actor: { name: string; role: string; email?: string };
  action: string;
  category: string;
  outcome: AuditOutcome;
  target: string;
  description: string;
  ipAddress?: string;
  requestId?: string;
}

export interface AuditQuery {
  search: string;
  category: string;
  outcome: string;
  from: string;
  to: string;
  page: number;
  size: number;
}

export interface AuditPage {
  content: AuditEvent[];
  totalElements: number;
  // Counts cover all matching records, not just the current page.
  summary: Record<AuditOutcome, number>;
}
