# Audit log dashboard

The admin page is at `/admin/audit-logs` (also linked from Administration → Audit Log).
`/admin/security` redirects to it. Only signed-in administrators can render its content.

## Current integration status

The inspected Spring Boot backend does **not** implement an audit-log endpoint or event recorder.
The page therefore starts disconnected and makes no audit requests. Administrators can explicitly
preview fictional events to test searching, filters, pagination, and the details dialog. Preview
data lives in memory, uses reserved documentation IP addresses, and never changes backend data.
It is not a browser-based audit recorder and must not be treated as real security history.

## Connecting a future backend

Implement the server-side API first, then set `VITE_AUDIT_LOG_API_PATH=/audit-logs` in the local
environment and restart Vite. This is an API-relative path: with `VITE_API_URL=/api`, requests
go to `/api/audit-logs`. Leave this setting empty until the endpoint is ready. Authentication
uses the existing API client's bearer header. The frontend performs GET requests only.

Expected query parameters:

- `search`: optional text across event ID, actor name/email, action, target, IP, and request ID.
- `category`: Authentication, Accounts, Catalog, Bookings, Payments, or Settings; omitted for all.
- `outcome`: SUCCESS, FAILURE, or WARNING; omitted for all.
- `from` / `to`: inclusive ISO-8601 timestamps. The UI converts selected local dates into UTC
  start-of-day / end-of-day boundaries.
- `page`: zero-based; `size`: 10; `sort`: `occurredAt,desc` (use ID as a stable tie-breaker).

Expected JSON response (timestamps must include a timezone; event IDs are strings):

```json
{
  "content": [
    {
      "id": "evt-104",
      "occurredAt": "2026-09-08T10:24:00Z",
      "actor": { "name": "Administrator", "role": "ADMIN" },
      "action": "User role updated",
      "category": "Accounts",
      "outcome": "SUCCESS",
      "target": "User #104",
      "description": "Changed role from USER to STAFF.",
      "ipAddress": "192.0.2.10",
      "requestId": "req-104"
    }
  ],
  "totalElements": 1,
  "summary": { "SUCCESS": 1, "FAILURE": 0, "WARNING": 0 }
}
```

`actor.email`, `ipAddress`, and `requestId` are optional; omit absent values. All other fields
are required. Summary counts cover **all filtered records**, not only the current page;
their sum must equal `totalElements`. Empty responses use an empty array and zero counts.
The page validates responses and displays errors instead of substituting samples.

## Required backend security

- Explicitly enforce `ADMIN` on the endpoint. The current fallback of “any authenticated
  request” is **not** sufficient; frontend route checks are only presentation safeguards.
- Record actual events on the server using the authenticated actor, server timestamp, and
  server-determined result. Never accept a client-provided audit record as trusted history.
- Keep history append-only and define retention and access policies before deployment.
- Do not log passwords, reset tokens, JWTs, authorization headers, payment credentials, or
  raw request/response bodies. Only expose allowlisted, appropriately redacted fields.
- Return 401/403 for denied access; avoid including sensitive details in error messages.
- Determine client IPs using trusted proxy configuration, not unvalidated forwarding headers.

This frontend change does not implement backend event capture, session revocation, alerting,
or tamper-resistant storage.
