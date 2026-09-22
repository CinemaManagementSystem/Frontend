import { FormEvent, useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, ChevronRight, Crown, DollarSign, LoaderCircle, Plus, Save, Trash2, X, XCircle } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertDialog } from '@/components/ui/Alert/AlertDialog';
import { Badge } from '@/components/ui/Badge/Badge';
import { useToast } from '@/components/ui/Toast/Toast';
import { membershipService } from '@/services/membershipService';
import { getApiErrorMessage } from '@/services/apiClient';
import type { MembershipBenefit, MembershipBenefitType, MembershipPlan, MembershipPlanInput } from '@/types/membership';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatCurrency';

const benefitTypes: MembershipBenefitType[] = [
  'TICKET_DISCOUNT',
  'FOOD_DISCOUNT',
  'FREE_TICKET',
  'PRIORITY_BOOKING',
  'POINT_MULTIPLIER',
  'LOUNGE_ACCESS',
];

const DISCOUNT_TYPES: MembershipBenefitType[] = ['TICKET_DISCOUNT', 'FOOD_DISCOUNT'];

const benefitLabels: Record<MembershipBenefitType, string> = {
  TICKET_DISCOUNT: 'Ticket discount',
  FOOD_DISCOUNT: 'Food & drink discount',
  FREE_TICKET: 'Free ticket',
  PRIORITY_BOOKING: 'Priority booking',
  POINT_MULTIPLIER: 'Points multiplier',
  LOUNGE_ACCESS: 'Lounge access',
};

const emptyForm: MembershipPlanInput = {
  name: '',
  code: '',
  description: '',
  price: 1,
  durationMonths: 1,
  active: true,
  sortOrder: 0,
  benefits: [
    { benefitType: 'TICKET_DISCOUNT', value: 10, monthlyLimit: null, active: true },
    { benefitType: 'FOOD_DISCOUNT', value: 10, monthlyLimit: null, active: true },
  ],
};

const fieldClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20';
const fieldErrorClass = 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20';
const labelClass = 'text-xs font-semibold text-muted-foreground';
const helperClass = 'text-xs text-muted-foreground/80';

const phraseFor = (benefit: MembershipBenefit): string => {
  switch (benefit.benefitType) {
    case 'TICKET_DISCOUNT':
      return `${benefit.value}% off tickets`;
    case 'FOOD_DISCOUNT':
      return `${benefit.value}% off food & drinks`;
    case 'FREE_TICKET':
      return ((benefit.monthlyLimit ?? benefit.value) || 1) === 1
        ? 'a free ticket a month'
        : `${(benefit.monthlyLimit ?? benefit.value) || 1} free tickets a month`;
    case 'PRIORITY_BOOKING':
      return 'priority booking';
    case 'POINT_MULTIPLIER':
      return `${benefit.value}x points`;
    case 'LOUNGE_ACCESS':
      return 'lounge access';
  }
};

const fragmentFor = (benefit: MembershipBenefit): string => {
  switch (benefit.benefitType) {
    case 'TICKET_DISCOUNT':
      return `Ticket ${benefit.value}% off`;
    case 'FOOD_DISCOUNT':
      return `Food & drink ${benefit.value}% off`;
    case 'FREE_TICKET':
      return ((benefit.monthlyLimit ?? benefit.value) || 1) === 1
        ? 'Free ticket'
        : `${(benefit.monthlyLimit ?? benefit.value) || 1} free tickets`;
    case 'PRIORITY_BOOKING':
      return 'Priority booking';
    case 'POINT_MULTIPLIER':
      return `${benefit.value}x points`;
    case 'LOUNGE_ACCESS':
      return 'Lounge access';
  }
};

const joinList = (items: string[]): string =>
  items.length <= 1
    ? items.join('')
    : items.slice(0, -1).join(', ') + (items.length > 2 ? ',' : '') + ' and ' + items[items.length - 1];

const periodLabel = (months: number) => `${months} ${months === 1 ? 'month' : 'months'}`;

export function MembershipPlansPage() {
  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();
  const drawerTitleId = useId();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selected, setSelected] = useState<MembershipPlan | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<MembershipPlan | null>(null);
  const [form, setForm] = useState<MembershipPlanInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Plan name is required';
    if (!form.code.trim()) next.code = 'Plan code is required';
    if (!(form.price > 0)) next.price = 'Price must be greater than 0';
    form.benefits.forEach((benefit, index) => {
      if (DISCOUNT_TYPES.includes(benefit.benefitType)) {
        if (benefit.value < 1 || benefit.value > 100) next[`benefits.${index}.value`] = 'Value must be between 1 and 100';
      } else if (!(benefit.value > 0)) {
        next[`benefits.${index}.value`] = 'Value must be greater than 0';
      }
      const duplicate = form.benefits.some((other, otherIndex) => otherIndex !== index && other.benefitType === benefit.benefitType);
      if (duplicate) next[`benefits.${index}.type`] = 'This benefit is already in the plan.';
    });
    return next;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;
  const availableBenefitTypes = benefitTypes.filter((type) => !form.benefits.some((benefit) => benefit.benefitType === type));
  const benefitPhrases = form.benefits.map(phraseFor);
  const benefitSummary = benefitPhrases.length ? `Members get ${joinList(benefitPhrases)}.` : '';

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setPlans(await membershipService.adminPlans());
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'membership plans'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (plan: MembershipPlan) => {
    setSelected(plan);
    setForm({
      name: plan.name,
      code: plan.code,
      description: plan.description ?? '',
      price: Number(plan.price),
      durationMonths: plan.durationMonths,
      active: plan.active,
      sortOrder: plan.sortOrder,
      benefits: plan.benefits,
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (saving) return;
    setDrawerOpen(false);
    setSelected(null);
    setForm(emptyForm);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid || saving) return;
    setSaving(true);
    setError('');
    try {
      if (selected) await membershipService.updatePlan(selected.id, form);
      else await membershipService.createPlan(form);
      toast.success('Plan saved');
      setSelected(null);
      setForm(emptyForm);
      setDrawerOpen(false);
      await load();
    } catch {
      toast.error("Couldn't save plan. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const archivePlan = async () => {
    if (!archiveTarget) return;
    setError('');
    try {
      await membershipService.deletePlan(archiveTarget.id);
      toast.success('Plan archived');
      await load();
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, 'membership plan archive'));
    } finally {
      setArchiveTarget(null);
    }
  };

  const updateBenefit = (index: number, patch: Partial<MembershipBenefit>) => {
    setForm((current) => ({
      ...current,
      benefits: current.benefits.map((benefit, i) => (i === index ? { ...benefit, ...patch } : benefit)),
    }));
  };

  const addBenefit = () => {
    if (!availableBenefitTypes.length) return;
    setForm((current) => ({
      ...current,
      benefits: [
        ...current.benefits,
        { benefitType: availableBenefitTypes[0], value: 10, monthlyLimit: null, active: true },
      ],
    }));
  };

  const removeBenefit = (index: number) => {
    setForm((current) => ({
      ...current,
      benefits: current.benefits.filter((_, i) => i !== index),
    }));
  };

  const drawer = createPortal(
    <AnimatePresence>
      {drawerOpen && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={drawerTitleId}
            initial={{ x: shouldReduceMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: shouldReduceMotion ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <h2 id={drawerTitleId} className="text-lg font-black text-foreground">
                {selected ? `Edit plan: ${selected.name}` : 'Create plan'}
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close plan form"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <div className="space-y-1.5">
                  <label htmlFor="plan-name" className={labelClass}>
                    Plan name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="plan-name"
                    className={cn(fieldClass, errors.name && fieldErrorClass)}
                    placeholder="e.g. Gold Monthly"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoFocus
                  />
                  {errors.name && <p className="text-xs text-rose-400">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="plan-code" className={labelClass}>
                    Plan code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="plan-code"
                    className={cn(fieldClass, errors.code && fieldErrorClass)}
                    placeholder="e.g. GOLD_MONTHLY"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                  <p className={helperClass}>Unique ID, e.g. GOLD_MONTHLY</p>
                  {errors.code && <p className="text-xs text-rose-400">{errors.code}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="plan-description" className={labelClass}>
                    Description <span className="font-normal text-muted-foreground/60">(optional)</span>
                  </label>
                  <textarea
                    id="plan-description"
                    className={cn(fieldClass, 'min-h-20 resize-y')}
                    placeholder="What do members get?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label htmlFor="plan-price" className={labelClass}>
                      Price <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">$</span>
                      <input
                        id="plan-price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        className={cn(fieldClass, 'pl-7', errors.price && fieldErrorClass)}
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      />
                    </div>
                    {errors.price && <p className="text-xs text-rose-400">{errors.price}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="plan-duration" className={labelClass}>
                      Billing period <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="plan-duration"
                        type="number"
                        min="1"
                        step="1"
                        className={cn(fieldClass, 'pr-16')}
                        value={form.durationMonths}
                        onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                        {form.durationMonths === 1 ? 'month' : 'months'}
                      </span>
                    </div>
                    {form.durationMonths < 1 && <p className="text-xs text-rose-400">Billing period must be at least 1 month</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="plan-sort" className={labelClass}>
                      Display order
                    </label>
                    <input
                      id="plan-sort"
                      type="number"
                      min="0"
                      step="1"
                      className={fieldClass}
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    />
                    <p className={helperClass}>Lower numbers appear first</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Available for purchase</p>
                    <p className="text-xs text-muted-foreground/80">New members can buy this plan online.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.active}
                    aria-label="Available for purchase"
                    onClick={() => setForm({ ...form, active: !form.active })}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/40',
                      form.active ? 'bg-[#E50914]' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                        form.active ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">Benefits</h3>
                    <button
                      type="button"
                      onClick={addBenefit}
                      disabled={!availableBenefitTypes.length}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#E50914] transition-colors hover:text-[#ff1f2d] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add benefit
                    </button>
                  </div>

                  <div className="mt-3 rounded-xl border border-border bg-background p-3">
                    <div className="grid grid-cols-[1fr_88px_1fr_36px] gap-2 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>Benefit</span>
                      <span>Value</span>
                      <span>Monthly limit</span>
                    </div>
                    {form.benefits.map((benefit, index) => {
                      const valueError = errors[`benefits.${index}.value`];
                      const typeError = errors[`benefits.${index}.type`];
                      return (
                        <div key={index} className={cn('py-1.5', index > 0 && 'border-t border-border/60')}>
                          <div className="grid grid-cols-[1fr_88px_1fr_36px] items-center gap-2">
                            <select
                              aria-label={`Benefit type ${index + 1}`}
                              className={cn(fieldClass, 'px-2 py-2', typeError && fieldErrorClass)}
                              value={benefit.benefitType}
                              onChange={(e) => updateBenefit(index, { benefitType: e.target.value as MembershipBenefitType })}
                            >
                              {benefitTypes.map((type) => (
                                <option
                                  key={type}
                                  value={type}
                                  disabled={type !== benefit.benefitType && form.benefits.some((other, otherIndex) => otherIndex !== index && other.benefitType === type)}
                                >
                                  {benefitLabels[type]}
                                </option>
                              ))}
                            </select>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                aria-label={`Benefit value ${index + 1}`}
                                className={cn(fieldClass, 'px-2 py-2', DISCOUNT_TYPES.includes(benefit.benefitType) && 'pr-6', valueError && fieldErrorClass)}
                                value={benefit.value}
                                onChange={(e) => updateBenefit(index, { value: Number(e.target.value) })}
                              />
                              {DISCOUNT_TYPES.includes(benefit.benefitType) && (
                                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">%</span>
                              )}
                            </div>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="Unlimited"
                              aria-label={`Monthly limit ${index + 1}`}
                              className={cn(fieldClass, 'px-2 py-2')}
                              value={benefit.monthlyLimit ?? ''}
                              onChange={(e) => updateBenefit(index, { monthlyLimit: e.target.value ? Number(e.target.value) : null })}
                            />
                            <button
                              type="button"
                              onClick={() => removeBenefit(index)}
                              title="Remove benefit"
                              aria-label="Remove benefit"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {(valueError || typeError) && (
                            <p className="mt-1 pl-1 text-xs text-rose-400">{valueError ?? typeError}</p>
                          )}
                        </div>
                      );
                    })}
                    {form.benefits.length === 0 && (
                      <p className="px-1 py-3 text-sm text-muted-foreground">No benefits yet. Add one to describe what members get.</p>
                    )}
                  </div>
                  <p className={cn(helperClass, 'mt-1.5 px-1')}>Leave empty for unlimited use.</p>
                  {benefitSummary && (
                    <p className="mt-3 rounded-lg bg-primary/5 px-3 py-2 text-xs font-medium text-foreground">{benefitSummary}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E50914] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#ff1f2d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.18em]">
            <span className="flex items-center gap-2 text-[#E50914]">
              <Crown className="h-4 w-4" /> Membership
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span aria-current="page" className="text-muted-foreground">Plans</span>
          </nav>
          <h1 className="mt-2 text-2xl font-black text-foreground">Membership plans</h1>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#E50914] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#ff1f2d]"
        >
          <Plus className="h-4 w-4" /> New plan
        </button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Plans</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{plans.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
              <Crown className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Tiers</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {plans.filter((p) => p.active).length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Archived</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {plans.filter((p) => !p.active).length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Average Price</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatCurrency(plans.length ? plans.reduce((s, p) => s + Number(p.price), 0) / plans.length : 0)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      {error && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4 font-bold text-foreground">Plans</div>
        {loading ? (
          <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading plans...
          </p>
        ) : plans.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-base font-bold text-foreground">No plans yet. Create your first membership plan.</p>
            <p className="mt-2 text-sm text-muted-foreground">Add benefits and pricing, then publish it for members.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {plans.map((plan) => {
              const activeBenefits = plan.benefits.filter((benefit) => benefit.active !== false);
              return (
                <div key={plan.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-foreground">{plan.name}</p>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{plan.code}</span>
                      <Badge variant={plan.active ? 'success' : 'outline'} size="sm">
                        {plan.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-foreground">
                      {formatCurrency(Number(plan.price))} / {periodLabel(plan.durationMonths)}
                      <span className="text-muted-foreground"> · {activeBenefits.length} {activeBenefits.length === 1 ? 'benefit' : 'benefits'}</span>
                    </p>
                    {activeBenefits.length > 0 && (
                      <p className="mt-1 text-sm text-muted-foreground">{activeBenefits.map(fragmentFor).join(' · ')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(plan)}
                      className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setArchiveTarget(plan)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 px-3 py-2 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" /> Archive
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AlertDialog
        isOpen={archiveTarget !== null}
        onClose={() => setArchiveTarget(null)}
        title="Archive this plan?"
        description="Existing members keep their benefits, but new members can't buy it."
        variant="danger"
        confirmLabel="Archive plan"
        cancelLabel="Keep plan"
        onConfirm={archivePlan}
      />

      {drawer}
    </div>
  );
}