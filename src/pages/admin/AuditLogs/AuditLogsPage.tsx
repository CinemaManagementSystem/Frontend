import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Eye, FileClock, Info, LockKeyhole, RefreshCw, Search, ShieldCheck, Unplug, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Modal } from '@/components/ui/Modal/Modal';
import { useAuthStore } from '@/store/authStore';
import { auditLogService, isAuditLogConfigured } from '@/services/auditLogService';
import { getApiErrorMessage } from '@/services/apiClient';
import { AUDIT_CATEGORIES, AUDIT_OUTCOMES, type AuditEvent, type AuditOutcome, type AuditPage, type AuditQuery } from '@/types/auditLog';
import { cn } from '@/lib/utils';
import { isAdminRole } from '@/lib/authRole';
import { createAuditPreview, filterAuditPreview } from './auditLogPreview';

const initialQuery: AuditQuery = { search: '', category: '', outcome: '', from: '', to: '', page: 0, size: 10 };
const control = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50';
const outcomeLabels: Record<AuditOutcome, string> = { SUCCESS: 'Success', FAILURE: 'Failed', WARNING: 'Warning' };
const outcomeStyles: Record<AuditOutcome, string> = {
  SUCCESS: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  FAILURE: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  WARNING: 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20',
};

function OutcomeBadge({ outcome }: { outcome: AuditOutcome }) {
  const Icon = outcome === 'SUCCESS' ? CheckCircle2 : outcome === 'FAILURE' ? XCircle : AlertTriangle;
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', outcomeStyles[outcome])}>
    <Icon className="h-3.5 w-3.5" aria-hidden="true" />{outcomeLabels[outcome]}
  </span>;
}

function AuditLogContent() {
  const configured = isAuditLogConfigured();
  const [preview, setPreview] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const previewEvents = useMemo(() => createAuditPreview(), []);
  const [result, setResult] = useState<{ key: string; data?: AuditPage; error?: string; loadedAt?: Date }>({ key: '' });
  const invalidDates = Boolean(query.from && query.to && query.from > query.to);
  const enabled = preview || configured;
  const key = JSON.stringify({ query, preview, revision });
  const data = result.key === key && !invalidDates && enabled ? result.data : undefined;
  const error = result.key === key ? result.error : undefined;
  const loading = enabled && !invalidDates && result.key !== key;

  useEffect(() => {
    if (!enabled || invalidDates) return;
    if (preview) {
      setResult({ key, data: filterAuditPreview(previewEvents, query) });
      return;
    }
    const controller = new AbortController();
    // Debounce filters and cancel superseded requests so old results never replace new ones.
    const timer = window.setTimeout(() => {
      void auditLogService.list(query, controller.signal).then(response => {
        if (controller.signal.aborted) return;
        const lastPage = Math.max(0, Math.ceil(response.totalElements / query.size) - 1);
        if (query.page > lastPage) {
          setQuery(current => ({ ...current, page: lastPage }));
          return;
        }
        setResult({ key, data: response, loadedAt: new Date() });
      }).catch((cause: unknown) => {
        if (!controller.signal.aborted) setResult({ key, error: getApiErrorMessage(cause, 'audit log') });
      });
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [enabled, invalidDates, key, preview, previewEvents, query]);

  const updateFilter = (field: 'search' | 'category' | 'outcome' | 'from' | 'to', value: string) =>
    setQuery(current => ({ ...current, [field]: value, page: 0 }));
  const totalPages = Math.max(1, Math.ceil((data?.totalElements ?? 0) / query.size));
  const hasFilters = Boolean(query.search || query.category || query.outcome || query.from || query.to);
  const changeSource = () => {
    setPreview(current => !current);
    setQuery(initialQuery);
    setSelected(null);
  };
  const metrics = [
    { label: 'Total events', value: data?.totalElements, icon: Activity, style: 'text-foreground bg-muted' },
    { label: 'Successful', value: data?.summary.SUCCESS, icon: CheckCircle2, style: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10' },
    { label: 'Failed', value: data?.summary.FAILURE, icon: XCircle, style: 'text-rose-700 dark:text-rose-400 bg-rose-500/10' },
    { label: 'Warnings', value: data?.summary.WARNING, icon: AlertTriangle, style: 'text-amber-800 dark:text-amber-400 bg-amber-500/10' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-ring [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-ring">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />Security management
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Audit log</h1>
          <p className="mt-2 text-sm text-muted-foreground">Review account activity, access attempts, and changes across your cinema.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={changeSource} className="gap-2">
            <Eye className="h-4 w-4" aria-hidden="true" />{preview ? 'Exit sample preview' : 'Preview sample events'}
          </Button>
          <Button variant="outline" disabled={!enabled || loading || invalidDates} onClick={() => setRevision(current => current + 1)} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', loading && 'motion-safe:animate-spin')} aria-hidden="true" />Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm" role="status">
        <div className="flex items-start gap-3">
          {preview ? <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            : <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
          <div>
            <p className="font-semibold">{preview ? 'Sample preview — not real activity' : configured ? 'Backend audit source' : 'Audit source not connected'}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{preview
              ? 'These fictional events are for testing this page. No account or security data is changed.'
              : configured ? 'Read-only records from the configured API. Use Refresh to fetch the latest activity.'
                : 'The backend does not provide audit records yet. Preview the interface using sample events.'}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />Admin only
        </span>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, style }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
              <div className={cn('rounded-lg p-2', style)}><Icon className="h-4 w-4" aria-hidden="true" /></div>
            </div>
            <dd className="mt-3 text-3xl font-bold tabular-nums">{value?.toLocaleString() ?? '—'}</dd>
            <p className="mt-1 text-xs text-muted-foreground">{preview ? 'Sample events matching filters' : 'All events matching filters'}</p>
          </div>
        ))}
      </dl>

      <section className="overflow-hidden rounded-xl border border-border bg-card" aria-labelledby="activity-title">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <FileClock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <h2 id="activity-title" className="font-semibold">Activity history</h2>
            {preview && <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sample data</span>}
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />Newest first · Local time</span>
        </div>
        <div className="grid grid-cols-1 gap-3 border-b border-border p-5 sm:grid-cols-2 xl:grid-cols-6">
          <div className="sm:col-span-2">
            <label htmlFor="audit-search" className="mb-1.5 block text-xs font-medium text-muted-foreground">Search activity</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input id="audit-search" type="search" placeholder="Search user, action, resource, or IP…" value={query.search} disabled={!enabled}
                onChange={event => updateFilter('search', event.target.value)} className={cn(control, 'pl-9')} />
            </div>
          </div>
          <div>
            <label htmlFor="audit-category" className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
            <select id="audit-category" value={query.category} disabled={!enabled} onChange={event => updateFilter('category', event.target.value)} className={control}>
              <option value="">All categories</option>{AUDIT_CATEGORIES.map(category => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="audit-outcome" className="mb-1.5 block text-xs font-medium text-muted-foreground">Result</label>
            <select id="audit-outcome" value={query.outcome} disabled={!enabled} onChange={event => updateFilter('outcome', event.target.value)} className={control}>
              <option value="">All results</option>{AUDIT_OUTCOMES.map(outcome => <option key={outcome} value={outcome}>{outcomeLabels[outcome]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="audit-from" className="mb-1.5 block text-xs font-medium text-muted-foreground">From date</label>
            <input id="audit-from" type="date" className={cn(control, 'dark:[color-scheme:dark]')} value={query.from} max={query.to || undefined} disabled={!enabled}
              aria-invalid={invalidDates} aria-describedby={invalidDates ? 'audit-date-error' : undefined} onChange={event => updateFilter('from', event.target.value)} />
          </div>
          <div>
            <label htmlFor="audit-to" className="mb-1.5 block text-xs font-medium text-muted-foreground">To date</label>
            <input id="audit-to" type="date" className={cn(control, 'dark:[color-scheme:dark]')} value={query.to} min={query.from || undefined} disabled={!enabled}
              aria-invalid={invalidDates} aria-describedby={invalidDates ? 'audit-date-error' : undefined} onChange={event => updateFilter('to', event.target.value)} />
          </div>
          {invalidDates && <p id="audit-date-error" role="alert" className="text-sm text-rose-700 dark:text-rose-400 sm:col-span-2 xl:col-span-6">From date must be on or before To date.</p>}
          {hasFilters && <div className="sm:col-span-2 xl:col-span-6"><Button variant="ghost" size="sm" onClick={() => setQuery(initialQuery)}>Clear filters</Button></div>}
        </div>

        {!enabled ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 rounded-2xl border border-border bg-muted p-4"><Unplug className="h-7 w-7 text-muted-foreground" aria-hidden="true" /></div>
            <h3 className="text-lg font-semibold">Connect your audit trail</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">Once a server-side audit endpoint is available, sign-ins, permission changes, and other recorded actions can appear here.</p>
            <Button className="mt-5 gap-2" onClick={changeSource}>Explore sample events<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center" role="alert">
            <AlertTriangle className="mx-auto mb-3 h-7 w-7 text-rose-700 dark:text-rose-400" aria-hidden="true" />
            <h3 className="font-semibold">Could not load audit events</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => setRevision(current => current + 1)}>Try again</Button>
          </div>
        ) : loading ? (
          <div className="space-y-5 p-6" role="status" aria-label="Loading audit events">
            {Array.from({ length: 5 }, (_, index) => <div key={index} className="flex gap-5 motion-safe:animate-pulse" aria-hidden="true">
              <div className="h-10 w-10 rounded-lg bg-muted" /><div className="flex-1 space-y-2"><div className="h-4 w-2/3 rounded bg-muted" /><div className="h-3 w-1/3 rounded bg-muted" /></div>
            </div>)}
            <span className="sr-only">Loading audit events…</span>
          </div>
        ) : !invalidDates && data?.content.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <caption className="sr-only">{preview ? 'Sample audit events' : 'Audit events'}, newest first. Times use your local timezone.</caption>
              <thead className="bg-muted/40 text-xs text-muted-foreground"><tr>
                {['Date & time', 'Actor', 'Activity', 'Category', 'Result', 'Details'].map(label => <th key={label} scope="col" className="px-5 py-3 font-medium">{label}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {data.content.map(event => (
                  <tr key={event.id} className="transition-colors hover:bg-muted/40">
                    <td className="whitespace-nowrap px-5 py-4"><time dateTime={event.occurredAt}>
                      <span className="block text-xs font-medium">{new Date(event.occurredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="mt-1 block text-xs tabular-nums text-muted-foreground">{new Date(event.occurredAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </time></td>
                    <td className="px-5 py-4"><div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold" aria-hidden="true">{event.actor.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</span>
                      <div><p className="max-w-44 truncate text-xs font-semibold" title={event.actor.name}>{event.actor.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{event.actor.role}</p></div>
                    </div></td>
                    <td className="px-5 py-4"><p className="font-medium">{event.action}</p><p className="mt-1 max-w-56 truncate text-xs text-muted-foreground" title={event.target}>{event.target}</p></td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{event.category}</td>
                    <td className="px-5 py-4"><OutcomeBadge outcome={event.outcome} /></td>
                    <td className="px-5 py-4"><Button variant="ghost" size="sm" aria-label={`View event ${event.id}`} onClick={() => setSelected(event)}><Eye className="h-4 w-4" aria-hidden="true" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !invalidDates ? (
          <div className="px-6 py-14 text-center" role="status">
            <Search className="mx-auto mb-3 h-7 w-7 text-muted-foreground" aria-hidden="true" />
            <h3 className="font-semibold">{hasFilters ? 'No matching events' : 'No audit events yet'}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{hasFilters ? 'Try a different search or widen your date range.' : 'Activity will appear here when the backend records events.'}</p>
            {hasFilters && <Button variant="outline" className="mt-4" onClick={() => setQuery(initialQuery)}>Reset filters</Button>}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-xs text-muted-foreground">
          <span aria-live="polite">{data ? `Showing ${data.content.length ? query.page * query.size + 1 : 0}–${data.content.length ? query.page * query.size + data.content.length : 0} of ${data.totalElements.toLocaleString()} ${preview ? 'sample ' : ''}events` : 'No records loaded'}</span>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" aria-label="Previous page" disabled={!data || query.page === 0} onClick={() => setQuery(current => ({ ...current, page: Math.max(0, current.page - 1) }))}><ChevronLeft className="h-4 w-4" aria-hidden="true" /></Button>
            <span>Page {query.page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" aria-label="Next page" disabled={!data || query.page + 1 >= totalPages} onClick={() => setQuery(current => ({ ...current, page: current.page + 1 }))}><ChevronRight className="h-4 w-4" aria-hidden="true" /></Button>
          </div>
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />Read-only history. Events cannot be edited or deleted here.</p>
        {!preview && data && result.loadedAt && <p>Last fetched {result.loadedAt.toLocaleTimeString()}</p>}
      </div>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Audit event details" maxWidth="xl">
        {selected && <div className="space-y-5">
          {preview && <p className="rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">Sample event — this action did not occur in your system.</p>}
          <div className="flex items-start justify-between gap-3"><div><h4 className="text-lg font-semibold">{selected.action}</h4><p className="mt-1 text-sm text-muted-foreground">{selected.category}</p></div><OutcomeBadge outcome={selected.outcome} /></div>
          <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">{selected.description}</p>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            {[
              ['Event ID', selected.id], ['Date & time (local)', new Date(selected.occurredAt).toLocaleString()],
              ['Actor', selected.actor.name], ['Role', selected.actor.role], ['Email', selected.actor.email ?? 'Not recorded'],
              ['Resource', selected.target], ['IP address', selected.ipAddress ?? 'Not recorded'], ['Request ID', selected.requestId ?? 'Not recorded'],
            ].map(([label, value]) => <div key={label}><dt className="mb-1 text-xs text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value}</dd></div>)}
          </dl>
          <div className="flex justify-end border-t border-border pt-4"><Button variant="outline" onClick={() => setSelected(null)}>Close</Button></div>
        </div>}
      </Modal>
    </div>
  );
}

export function AuditLogsPage() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!isAdminRole(user.role)) {
    return <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center">
      <LockKeyhole className="mx-auto mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-xl font-semibold">Administrator access required</h1>
      <p className="mt-2 text-sm text-muted-foreground">Audit logs can contain sensitive activity and are available only to administrators.</p>
      <Link to="/admin/dashboard" className="mt-5 inline-block rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring">Back to dashboard</Link>
    </div>;
  }
  return <AuditLogContent />;
}
