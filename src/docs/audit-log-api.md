# Audit log dashboard

The admin page is /admin/audit-logs; /admin/security redirects there. The page requires an authenticated ADMIN in the frontend.

## Current status

The current backend has no audit-log controller or event recorder. Without VITE_AUDIT_LOG_API_PATH, the page is disconnected and offers an explicitly labeled in-memory sample preview. Sample events never change backend data and must not be treated as security history.

## Future API contract

Set VITE_AUDIT_LOG_API_PATH=/audit-logs only after the backend endpoint exists. The value must be an API-relative path; with VITE_API_URL=http://localhost:8081/api, requests go to http://localhost:8081/api/audit-logs. The frontend sends GET requests through the existing Bearer-authenticated client.

Expected query parameters are search, category, outcome, from, to, zero-based page, size (10), and sort=occurredAt,desc. Dates are sent as UTC ISO timestamps.

Expected response:

    {
      "content": [{
        "id": "evt-104",
        "occurredAt": "2026-09-08T10:24:00Z",
        "actor": { "name": "Administrator", "role": "ADMIN" },
        "action": "User role updated",
        "category": "Accounts",
        "outcome": "SUCCESS",
        "target": "User #104",
        "description": "Changed role from USER to STAFF."
      }],
      "totalElements": 1,
      "summary": { "SUCCESS": 1, "FAILURE": 0, "WARNING": 0 }
    }

Event IDs are strings, timestamps include a timezone, and optional actor email/IP/request ID fields may be omitted. Summary counts cover all filtered records and must sum to totalElements. The client validates this contract and displays errors rather than silently using samples.

## Backend requirements

The server must enforce ADMIN access, derive actor/time/result from the authenticated request, keep events append-only, redact secrets and request bodies, and use trusted proxy configuration for client IPs. Frontend guards are not a security boundary.

