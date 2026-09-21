import { useEffect, useState } from 'react';
import { CalendarClock, Crown, LoaderCircle, ReceiptText, XCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyMembership } from '@/store/membershipSlice';
import { membershipService } from '@/services/membershipService';
import { getApiErrorMessage } from '@/services/apiClient';
import { PageContainer } from '@/components/layout/PageContainer';
import { formatCurrency } from '@/utils/formatCurrency';

export function MyMembershipPage() {
  const dispatch = useAppDispatch();
  const { current, history, usage, loading } = useAppSelector((state) => state.membership);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void dispatch(fetchMyMembership());
  }, [dispatch]);

  const cancel = async () => {
    if (!current) return;
    setBusy(true);
    setError('');
    try {
      await membershipService.cancelMine(current.id);
      await dispatch(fetchMyMembership());
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'membership cancellation'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-10 text-foreground">
      <PageContainer>
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary">
            <Crown className="h-4 w-4" /> My membership
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Membership status and benefit usage</h1>
        </div>

        {error && <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

        {loading ? (
          <div className="mt-12 flex items-center justify-center gap-3 text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" /> Loading membership...
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              {current ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">{current.status}</p>
                  <h2 className="mt-2 text-3xl font-black">{current.planName}</h2>
                  <dl className="mt-6 space-y-4 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Paid</dt><dd className="font-bold">{formatCurrency(Number(current.priceSnapshot))}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Started</dt><dd>{current.startedAt ? new Date(current.startedAt).toLocaleDateString() : '-'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Expires</dt><dd>{current.expiresAt ? new Date(current.expiresAt).toLocaleDateString() : '-'}</dd></div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => void cancel()}
                    disabled={busy}
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold hover:bg-muted disabled:opacity-60"
                  >
                    {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Cancel membership
                  </button>
                </>
              ) : (
                <div className="py-10 text-center">
                  <Crown className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h2 className="mt-4 text-xl font-bold">No active membership</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Subscribe to a plan to unlock automatic ticket and F&B benefits.</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-black"><ReceiptText className="h-5 w-5 text-primary" /> Monthly usage</h2>
              <div className="mt-5 space-y-3">
                {usage.length === 0 ? (
                  <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">No benefits used this month yet.</p>
                ) : usage.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 text-sm">
                    <div>
                      <p className="font-bold">{item.benefitType.replaceAll('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{item.usagePeriod} / {item.sourceType} #{item.sourceId}</p>
                    </div>
                    <span className="font-bold text-emerald-500">-{formatCurrency(Number(item.discountAmount))}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-black"><CalendarClock className="h-5 w-5 text-primary" /> History</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr><th className="py-3">Plan</th><th>Status</th><th>Started</th><th>Expires</th><th>Payment</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-semibold">{item.planName}</td>
                    <td>{item.status}</td>
                    <td>{item.startedAt ? new Date(item.startedAt).toLocaleDateString() : '-'}</td>
                    <td>{item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : '-'}</td>
                    <td>{item.paymentId ? `#${item.paymentId}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
