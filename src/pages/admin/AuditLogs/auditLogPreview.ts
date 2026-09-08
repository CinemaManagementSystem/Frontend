import type { AuditEvent, AuditPage, AuditQuery } from '@/types/auditLog';

// Deliberately fictional records, only used after the administrator opts into preview.
export function createAuditPreview(now = Date.now()): AuditEvent[] {
  const events: Omit<AuditEvent, 'id' | 'occurredAt' | 'ipAddress' | 'requestId'>[] = [
    { actor: { name: 'Alex Morgan', role: 'ADMIN' }, action: 'User role updated', category: 'Accounts', outcome: 'SUCCESS', target: 'User #104', description: 'Changed a user role from USER to STAFF.' },
    { actor: { name: 'Unverified visitor', role: 'GUEST' }, action: 'Sign-in failed', category: 'Authentication', outcome: 'FAILURE', target: 'Sign-in', description: 'The supplied credentials could not be verified.' },
    { actor: { name: 'Jamie Lee', role: 'STAFF' }, action: 'Showtime created', category: 'Catalog', outcome: 'SUCCESS', target: 'Quantum Shift · IMAX', description: 'Added an evening screening in IMAX Theater 1.' },
    { actor: { name: 'Unverified visitor', role: 'GUEST' }, action: 'Rate limit reached', category: 'Authentication', outcome: 'WARNING', target: 'Sign-in', description: 'Further requests were temporarily limited after repeated attempts.' },
    { actor: { name: 'Alex Morgan', role: 'ADMIN' }, action: 'Account disabled', category: 'Accounts', outcome: 'SUCCESS', target: 'User #108', description: 'Changed account status from ACTIVE to DISABLED.' },
    { actor: { name: 'Sam Rivera', role: 'USER' }, action: 'Payment failed', category: 'Payments', outcome: 'FAILURE', target: 'Payment #205', description: 'The payment provider declined this payment attempt. No payment credentials are included in this event.' },
    { actor: { name: 'Jamie Lee', role: 'STAFF' }, action: 'Booking confirmed', category: 'Bookings', outcome: 'SUCCESS', target: 'Booking #312', description: 'Confirmed a booking for two seats.' },
    { actor: { name: 'Alex Morgan', role: 'ADMIN' }, action: 'Sign-in successful', category: 'Authentication', outcome: 'SUCCESS', target: 'Admin dashboard', description: 'An administrator signed in successfully.' },
    { actor: { name: 'Jamie Lee', role: 'STAFF' }, action: 'Access denied', category: 'Accounts', outcome: 'FAILURE', target: 'User management', description: 'An account-management request was rejected because administrator access is required.' },
    { actor: { name: 'Alex Morgan', role: 'ADMIN' }, action: 'Movie updated', category: 'Catalog', outcome: 'SUCCESS', target: 'Quantum Shift', description: 'Updated the movie description and runtime.' },
    { actor: { name: 'Sam Rivera', role: 'USER' }, action: 'Booking cancelled', category: 'Bookings', outcome: 'SUCCESS', target: 'Booking #298', description: 'The customer cancelled a pending booking.' },
    { actor: { name: 'Alex Morgan', role: 'ADMIN' }, action: 'Account enabled', category: 'Accounts', outcome: 'SUCCESS', target: 'User #109', description: 'Changed account status from DISABLED to ACTIVE.' },
  ];
  return events.map((event, index) => ({
    ...event,
    id: `SAMPLE-${String(index + 1).padStart(4, '0')}`,
    occurredAt: new Date(now - (index * 97 + 3) * 60_000).toISOString(),
    ipAddress: `192.0.2.${10 + index}`,
    requestId: `sample-request-${index + 1}`,
  }));
}

export function filterAuditPreview(events: AuditEvent[], query: AuditQuery): AuditPage {
  const search = query.search.trim().toLowerCase();
  const from = query.from ? new Date(`${query.from}T00:00:00`).getTime() : -Infinity;
  const to = query.to ? new Date(`${query.to}T23:59:59.999`).getTime() : Infinity;
  const filtered = events.filter(event => {
    const time = Date.parse(event.occurredAt);
    return (!query.category || event.category === query.category)
      && (!query.outcome || event.outcome === query.outcome)
      && time >= from && time <= to
      && [event.id, event.actor.name, event.actor.email, event.action, event.target, event.ipAddress, event.requestId]
        .some(value => value?.toLowerCase().includes(search));
  }).sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  return {
    content: filtered.slice(query.page * query.size, (query.page + 1) * query.size),
    totalElements: filtered.length,
    summary: {
      SUCCESS: filtered.filter(event => event.outcome === 'SUCCESS').length,
      FAILURE: filtered.filter(event => event.outcome === 'FAILURE').length,
      WARNING: filtered.filter(event => event.outcome === 'WARNING').length,
    },
  };
}
