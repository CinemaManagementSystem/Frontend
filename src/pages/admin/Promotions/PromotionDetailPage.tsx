import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Edit2, Pause, Play, RefreshCw, TicketPercent } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { ConfirmDialog, DiscountLabel, MoneyText, StatusBadge, UsageProgress } from '@/components/promotions';
import { getApiErrorMessage } from '@/services/apiClient';
import { promotionApi } from '@/services/promotionApi';
import { formatDateRange } from './PromotionAdminUtils';
import type { Promotion, PromotionReport, PromotionStatus } from '@/types/promotion';

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'Not set';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function PromotionDetailPage() {
  const { promotionId } = useParams<{ promotionId: string }>();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [report, setReport] = useState<PromotionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusAction, setStatusAction] = useState<Extract<PromotionStatus, 'ACTIVE' | 'PAUSED'> | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const load = useCallback(async () => {
    if (!promotionId) return;
    setLoading(true);
    setError('');
    try {
      const [promotionResponse, reportResponse] = await Promise.all([
        promotionApi.getById(promotionId),
        promotionApi.report(),
      ]);
      setPromotion(promotionResponse);
      setReport(reportResponse);
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'promotion report'));
    } finally {
      setLoading(false);
    }
  }, [promotionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const usages = useMemo(() => (
    report?.usages.filter((usage) => String(usage.promotionId) === String(promotionId)) ?? []
  ), [promotionId, report?.usages]);

  const filteredSummary = useMemo(() => ({
    totalUses: usages.length || report?.summary.totalUses || 0,
    totalDiscountGiven: usages.reduce((sum, usage) => sum + Number(usage.discountApplied || 0), 0) || report?.summary.totalDiscountGiven || 0,
    revenueFromPromoOrders: report?.summary.revenueFromPromoOrders || 0,
  }), [report?.summary, usages]);

  const requestStatusChange = () => {
    if (!promotion) return;
    setStatusAction(promotion.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
  };

  const updateStatus = async () => {
    if (!promotion || !statusAction) return;
    setSavingStatus(true);
    setError('');
    try {
      const updated = await promotionApi.updateStatus(promotion.id, statusAction);
      setPromotion(updated);
      setStatusAction(null);
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'promotion status update'));
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-muted-foreground">Loading promotion report...</p>
        </div>
      </div>
    );
  }

  if (error && !promotion) {
    return (
      <section className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Unable to load promotion</h1>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!promotion) return null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/admin/promotions" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to promotions
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{promotion.name}</h1>
            <StatusBadge status={promotion.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{promotion.code || 'Automatic promotion'} | {formatDateRange(promotion.startAt, promotion.endAt)}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" size="md" onClick={() => navigate(`/admin/promotions/${promotion.id}/edit`)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button type="button" variant="primary" size="md" disabled={promotion.status === 'EXPIRED'} onClick={requestStatusChange}>
            {promotion.status === 'ACTIVE' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {promotion.status === 'ACTIVE' ? 'Pause' : 'Activate'}
          </Button>
        </div>
      </section>

      {error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Total uses" value={String(filteredSummary.totalUses)} />
        <Stat label="Total discount given" value={<MoneyText amount={filteredSummary.totalDiscountGiven} />} />
        <Stat label="Revenue from promo orders" value={<MoneyText amount={filteredSummary.revenueFromPromoOrders} />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E50914]/15 text-[#E50914]">
              <TicketPercent className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">Campaign details</h2>
              <p className="text-xs text-muted-foreground">Current saved configuration</p>
            </div>
          </div>
          <dl className="space-y-3 border-t border-border pt-4 text-sm">
            <Row label="Discount" value={<><DiscountLabel type={promotion.discountType} value={promotion.value} /> {promotion.discountType === 'PERCENT' ? 'off' : 'discount'}</>} />
            <Row label="Min order" value={promotion.minOrderAmount ? <MoneyText amount={promotion.minOrderAmount} /> : 'None'} />
            <Row label="Max cap" value={promotion.maxDiscountAmount ? <MoneyText amount={promotion.maxDiscountAmount} /> : 'None'} />
            <Row label="Scope" value={promotion.scope} />
            <Row label="Per user" value={promotion.perUserLimit ?? 'No limit'} />
            <Row label="Created" value={promotion.createdAt ? formatDateTime(promotion.createdAt) : 'Not available'} />
          </dl>
          <UsageProgress used={promotion.usedCount} limit={promotion.usageLimit} className="pt-2" />
        </aside>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <header className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-bold text-foreground">Usage history</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </header>
          {usages.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center px-6 py-12 text-center">
              <div>
                <TicketPercent className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 text-sm font-bold text-foreground">No usage yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Customer redemptions will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border bg-muted/40 text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {usages.map((usage) => (
                    <tr key={usage.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 text-sm text-foreground">{usage.userName || usage.userId || 'Unknown user'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{usage.orderId ? `#${usage.orderId}` : 'No order'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-400"><MoneyText amount={usage.discountApplied} negative /></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateTime(usage.usedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <ConfirmDialog
        open={statusAction != null}
        title={statusAction === 'PAUSED' ? 'Pause promotion?' : 'Activate promotion?'}
        description={`${statusAction === 'PAUSED' ? 'Pause' : 'Activate'} "${promotion.name}"? This changes customer eligibility immediately.`}
        confirmLabel={statusAction === 'PAUSED' ? 'Pause' : 'Activate'}
        pending={savingStatus}
        onCancel={() => setStatusAction(null)}
        onConfirm={() => void updateStatus()}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold text-foreground">{value}</dd>
    </div>
  );
}
