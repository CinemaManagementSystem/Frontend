import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Crown, LoaderCircle, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMembershipPlans } from '@/store/membershipSlice';
import { membershipService } from '@/services/membershipService';
import { getApiErrorMessage } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { formatCurrency } from '@/utils/formatCurrency';
import type { MembershipBenefit } from '@/types/membership';

const benefitLabel = (benefit: MembershipBenefit) => {
  if (benefit.benefitType === 'FREE_TICKET') return `${benefit.monthlyLimit ?? 1} free ticket/month`;
  if (benefit.benefitType === 'TICKET_DISCOUNT') return `${benefit.value}% ticket discount`;
  if (benefit.benefitType === 'FOOD_DISCOUNT') return `${benefit.value}% F&B discount`;
  if (benefit.benefitType === 'POINT_MULTIPLIER') return `${benefit.value}x points`;
  return benefit.benefitType.replaceAll('_', ' ').toLowerCase();
};

export function MembershipPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAuthStore((store) => store.user);
  const { plans, loading } = useAppSelector((state) => state.membership);
  const [busyPlan, setBusyPlan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void dispatch(fetchMembershipPlans());
  }, [dispatch]);

  const subscribe = async (planId: string) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent('/membership')}`);
      return;
    }
    setBusyPlan(planId);
    setError('');
    try {
      const result = await membershipService.subscribe(planId);
      navigate('/payment-gateway', {
        state: {
          paymentId: result.payment.id,
          userMembershipId: result.membership.id,
          totalAmount: result.payment.amount,
          paymentMethod: result.payment.paymentMethod,
          returnTo: '/my-membership',
        },
      });
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'membership subscription'));
    } finally {
      setBusyPlan('');
    }
  };

  return (
    <main className="min-h-screen bg-background py-10 text-foreground">
      <PageContainer>
        <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary">
              <Crown className="h-4 w-4" /> Membership
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
              Better seats, snacks, and rewards every month.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
              Choose a plan, pay securely with KHQR, and let the backend apply every ticket and F&B benefit automatically.
            </p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:grid-cols-3">
            {[
              ['Backend pricing', ShieldCheck],
              ['KHQR activation', Ticket],
              ['Monthly usage', Sparkles],
            ].map(([label, Icon]) => (
              <div key={label as string} className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 text-sm font-semibold">
                <Icon className="h-5 w-5 text-primary" />
                {label as string}
              </div>
            ))}
          </div>
        </section>

        {error && <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

        {loading ? (
          <div className="mt-12 flex items-center justify-center gap-3 text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" /> Loading membership plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-lg font-bold">No active plans yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Admin can create plans from the membership dashboard.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">{plan.code}</p>
                    <h2 className="mt-2 text-2xl font-black">{plan.name}</h2>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{plan.durationMonths} mo</span>
                </div>
                <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                <p className="mt-6 text-4xl font-black">{formatCurrency(Number(plan.price))}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.benefits.filter((benefit) => benefit.active !== false).map((benefit) => (
                    <li key={`${plan.id}-${benefit.benefitType}`} className="flex gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{benefitLabel(benefit)}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => void subscribe(plan.id)}
                  disabled={busyPlan === plan.id}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
                >
                  {busyPlan === plan.id && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  Subscribe with KHQR
                </button>
              </motion.article>
            ))}
          </div>
        )}
      </PageContainer>
    </main>
  );
}
