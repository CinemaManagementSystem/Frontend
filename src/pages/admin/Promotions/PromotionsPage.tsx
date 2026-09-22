import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Edit2, Eye, Megaphone, Pause, Play, Plus, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { ConfirmDialog, DiscountLabel, StatusBadge, UsageProgress } from '@/components/promotions';
import { getApiErrorMessage } from '@/services/apiClient';
import { promotionApi } from '@/services/promotionApi';
import type { Promotion, PromotionDiscountType, PromotionListParams, PromotionStatus } from '@/types/promotion';

const statusOptions: Array<{ value: PromotionStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'EXPIRED', label: 'Expired' },
];

const typeOptions: Array<{ value: PromotionDiscountType | ''; label: string }> = [
  { value: '', label: 'All types' },
  { value: 'PERCENT', label: 'Percent' },
  { value: 'FIXED', label: 'Fixed amount' },
];

const fieldClass =
  'h-10 rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none transition-all focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'Not set';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [status, setStatus] = useState<PromotionStatus | ''>('');
  const [type, setType] = useState<PromotionDiscountType | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ promotion: Promotion; nextStatus: Extract<PromotionStatus, 'ACTIVE' | 'PAUSED'> } | null>(null);

  const params = useMemo<PromotionListParams>(() => ({ status, type, search, page, size }), [page, search, size, status, type]);

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await promotionApi.list(params);
      setPromotions(response.content);
      setTotalPages(Math.max(1, response.totalPages || 1));
      setTotalElements(response.totalElements ?? response.content.length);
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'promotions'));
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void loadPromotions();
  }, [loadPromotions]);

  const hasFilters = status !== '' || type !== '' || search.trim() !== '';

  const clearFilters = () => {
    setStatus('');
    setType('');
    setSearch('');
    setPage(0);
  };

  const requestStatusChange = (promotion: Promotion) => {
    const nextStatus: Extract<PromotionStatus, 'ACTIVE' | 'PAUSED'> = promotion.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setConfirm({ promotion, nextStatus });
  };

  const updateStatus = async () => {
    if (!confirm) return;
    setActionId(confirm.promotion.id);
    setError('');
    setSuccess('');
    try {
      await promotionApi.updateStatus(confirm.promotion.id, confirm.nextStatus);
      setSuccess(`${confirm.promotion.name} is now ${confirm.nextStatus.toLowerCase()}.`);
      setConfirm(null);
      await loadPromotions();
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'promotion status update'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E50914]">Promotion studio</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Promotions</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Create, pause, and review customer offers without deleting promotion history.
          </p>
        </div>
        <Link
          to="/admin/promotions/create"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#E50914] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#ff1f2d] sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New promotion
        </Link>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <label className="relative">
            <span className="sr-only">Search promotions by name or code</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Search name or code..."
              className={`${fieldClass} w-full pl-10`}
            />
          </label>
          <label>
            <span className="sr-only">Promotion status</span>
            <select value={status} onChange={(event) => { setStatus(event.target.value as PromotionStatus | ''); setPage(0); }} className={`${fieldClass} w-full`}>
              {statusOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Promotion type</span>
            <select value={type} onChange={(event) => { setType(event.target.value as PromotionDiscountType | ''); setPage(0); }} className={`${fieldClass} w-full`}>
              {typeOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <Button type="button" variant="outline" size="md" onClick={clearFilters} disabled={!hasFilters} className="h-10">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </section>

      {success && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{success}</p>}
      {error && (
        <section role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-3 text-sm text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadPromotions()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <header className="flex flex-col gap-1 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-foreground">Promotion list</h2>
          <p className="text-xs text-muted-foreground">{totalElements} total promotions</p>
        </header>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-3 text-sm text-muted-foreground">Loading promotions...</p>
            </div>
          </div>
        ) : promotions.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center px-6 py-12 text-center">
            <div className="max-w-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
                <Megaphone className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">{hasFilters ? 'No matching promotions' : 'No promotions yet'}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasFilters ? 'Try changing the search, status, or type filters.' : 'Create your first campaign to start offering discounts.'}
              </p>
              <div className="mt-4">
                {hasFilters ? (
                  <Button type="button" variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
                ) : (
                  <Link to="/admin/promotions/create" className="inline-flex rounded-lg bg-[#E50914] px-3 py-2 text-xs font-semibold text-white">New promotion</Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left">
                <thead className="border-b border-border bg-muted/40 text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="min-w-[260px] px-4 py-3">Name / code</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="min-w-[180px] px-4 py-3">Validity</th>
                    <th className="min-w-[180px] px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promotion) => (
                    <tr key={promotion.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-foreground">{promotion.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{promotion.code || 'Automatic'}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <DiscountLabel type={promotion.discountType} value={promotion.value} />
                        <span className="ml-1 text-xs text-muted-foreground">{promotion.discountType === 'PERCENT' ? 'off' : 'discount'}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(promotion.startAt)} - {formatDate(promotion.endAt)}
                      </td>
                      <td className="px-4 py-3"><UsageProgress used={promotion.usedCount} limit={promotion.usageLimit} /></td>
                      <td className="px-4 py-3"><StatusBadge status={promotion.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link to={`/admin/promotions/${promotion.id}`} title="View report" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><Eye className="h-4 w-4" /></Link>
                          <Link to={`/admin/promotions/${promotion.id}/edit`} title="Edit promotion" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><Edit2 className="h-4 w-4" /></Link>
                          <button
                            type="button"
                            title={promotion.status === 'ACTIVE' ? 'Pause promotion' : 'Activate promotion'}
                            disabled={actionId === promotion.id || promotion.status === 'EXPIRED'}
                            onClick={() => requestStatusChange(promotion)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {promotion.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border lg:hidden">
              {promotions.map((promotion) => (
                <article key={promotion.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{promotion.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{promotion.code || 'Automatic'}</p>
                    </div>
                    <StatusBadge status={promotion.status} />
                  </div>
                  <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
                    <p><span className="font-semibold text-foreground"><DiscountLabel type={promotion.discountType} value={promotion.value} /></span> {promotion.discountType === 'PERCENT' ? 'off' : 'discount'}</p>
                    <p>{formatDate(promotion.startAt)} - {formatDate(promotion.endAt)}</p>
                  </div>
                  <UsageProgress used={promotion.usedCount} limit={promotion.usageLimit} />
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/admin/promotions/${promotion.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"><Eye className="h-4 w-4" />Report</Link>
                    <Link to={`/admin/promotions/${promotion.id}/edit`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"><Edit2 className="h-4 w-4" />Edit</Link>
                    <button type="button" disabled={actionId === promotion.id || promotion.status === 'EXPIRED'} onClick={() => requestStatusChange(promotion)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50">
                      {promotion.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {promotion.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <footer className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</Button>
            <Button type="button" variant="outline" size="sm" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>Next</Button>
          </div>
        </footer>
      </section>

      <ConfirmDialog
        open={confirm != null}
        title={confirm?.nextStatus === 'PAUSED' ? 'Pause promotion?' : 'Activate promotion?'}
        description={confirm ? `${confirm.nextStatus === 'PAUSED' ? 'Pause' : 'Activate'} "${confirm.promotion.name}"? This changes customer eligibility immediately.` : ''}
        confirmLabel={confirm?.nextStatus === 'PAUSED' ? 'Pause' : 'Activate'}
        pending={actionId != null}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void updateStatus()}
      />
    </div>
  );
}
