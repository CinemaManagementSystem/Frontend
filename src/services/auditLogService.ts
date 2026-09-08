import { apiClient } from './apiClient';
import { AUDIT_OUTCOMES, type AuditEvent, type AuditPage, type AuditQuery } from '@/types/auditLog';

export const isAuditLogConfigured = () => Boolean(import.meta.env.VITE_AUDIT_LOG_API_PATH?.trim());

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

function isEvent(value: unknown): value is AuditEvent {
  if (!isRecord(value) || !isRecord(value.actor)) return false;
  return ['id', 'occurredAt', 'action', 'category', 'target', 'description'].every(key => typeof value[key] === 'string')
    && typeof value.actor.name === 'string' && typeof value.actor.role === 'string'
    && Number.isFinite(Date.parse(value.occurredAt as string))
    && AUDIT_OUTCOMES.some(outcome => outcome === value.outcome)
    && [value.ipAddress, value.requestId, value.actor.email].every(field => field === undefined || typeof field === 'string');
}

export const auditLogService = {
  async list(query: AuditQuery, signal?: AbortSignal): Promise<AuditPage> {
    const path = import.meta.env.VITE_AUDIT_LOG_API_PATH?.trim();
    // Only opt-in API-relative paths; never send the auth token to a separate host.
    if (!path || !/^\/(?!\/)[a-zA-Z0-9/_-]+$/.test(path)) {
      throw new Error('Configure an API-relative audit endpoint, such as /audit-logs.');
    }
    const { data } = await apiClient.get<unknown>(path, {
      signal,
      params: {
        search: query.search.trim() || undefined,
        category: query.category || undefined,
        outcome: query.outcome || undefined,
        from: query.from ? new Date(`${query.from}T00:00:00`).toISOString() : undefined,
        to: query.to ? new Date(`${query.to}T23:59:59.999`).toISOString() : undefined,
        page: query.page,
        size: query.size,
        sort: 'occurredAt,desc',
      },
    });
    if (!isRecord(data) || !Array.isArray(data.content) || !data.content.every(isEvent)
      || !isCount(data.totalElements) || !isRecord(data.summary)
      || !AUDIT_OUTCOMES.every(outcome => isCount((data.summary as Record<string, unknown>)[outcome]))
      || data.content.length > query.size || data.content.length > data.totalElements
      || AUDIT_OUTCOMES.reduce((sum, outcome) => sum + (data.summary as Record<string, number>)[outcome], 0) !== data.totalElements) {
      throw new Error('The audit API returned an unexpected response. Check the audit-log API contract.');
    }
    return data as unknown as AuditPage;
  },
};
