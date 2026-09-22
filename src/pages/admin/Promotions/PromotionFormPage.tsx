import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, LoaderCircle, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { getApiErrorMessage } from '@/services/apiClient';
import { promotionApi } from '@/services/promotionApi';
import {
  buildPromotionSummary,
  emptyPromotionForm,
  fieldClass,
  fromPromotion,
  labelClass,
  textareaClass,
  toPromotionInput,
  validatePromotionForm,
  type PromotionFormState,
} from './PromotionAdminUtils';
import type { PromotionDiscountType, PromotionScope } from '@/types/promotion';

const discountTypes: Array<{ value: PromotionDiscountType; label: string }> = [
  { value: 'PERCENT', label: 'Percent' },
  { value: 'FIXED', label: 'Fixed amount' },
];

const scopes: Array<{ value: PromotionScope; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'MOVIE', label: 'Movie' },
  { value: 'SHOW', label: 'Show' },
  { value: 'PRODUCT', label: 'Product' },
];

export function PromotionFormPage() {
  const { promotionId } = useParams<{ promotionId: string }>();
  const navigate = useNavigate();
  const editing = Boolean(promotionId);
  const [form, setForm] = useState<PromotionFormState>(emptyPromotionForm);
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(emptyPromotionForm));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');

  const dirty = useMemo(() => JSON.stringify(form) !== initialSnapshot, [form, initialSnapshot]);

  const setField = <K extends keyof PromotionFormState>(key: K, value: PromotionFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const loadPromotion = useCallback(async () => {
    if (!promotionId) return;
    setLoading(true);
    setLoadError('');
    try {
      const promotion = await promotionApi.getById(promotionId);
      const next = fromPromotion(promotion);
      setForm(next);
      setInitialSnapshot(JSON.stringify(next));
    } catch (reason) {
      setLoadError(getApiErrorMessage(reason, 'promotion'));
    } finally {
      setLoading(false);
    }
  }, [promotionId]);

  useEffect(() => {
    void loadPromotion();
  }, [loadPromotion]);

  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const confirmLeave = () => !dirty || window.confirm('You have unsaved promotion changes. Leave without saving?');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validatePromotionForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setFormError('');
    try {
      const payload = toPromotionInput(form);
      const saved = promotionId
        ? await promotionApi.update(promotionId, payload)
        : await promotionApi.create(payload);
      setInitialSnapshot(JSON.stringify(fromPromotion(saved)));
      navigate(`/admin/promotions/${saved.id}`, { replace: true });
    } catch (reason) {
      setFormError(getApiErrorMessage(reason, 'promotion save'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-muted-foreground">Loading promotion...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <section className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Unable to load promotion</h1>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void loadPromotion()}>
              Try again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/admin/promotions"
            onClick={(event) => {
              if (!confirmLeave()) event.preventDefault();
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to promotions
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#E50914]">
            {editing ? 'Edit campaign' : 'New campaign'}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{editing ? 'Edit promotion' : 'Create promotion'}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Configure the discount, eligibility window, and scope. Server validation still runs when you save.
          </p>
        </div>
        <Button type="submit" variant="primary" size="md" disabled={saving} className="w-full sm:w-auto">
          {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? 'Saving...' : 'Save promotion'}
        </Button>
      </section>

      {formError && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{formError}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5 rounded-xl border border-border bg-card p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" error={errors.name}>
              <input className={fieldClass} value={form.name} onChange={(event) => setField('name', event.target.value)} disabled={saving} required />
            </Field>
            <Field label="Code mode">
              <label className="flex h-10 items-center gap-3 rounded-lg border border-border bg-muted px-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.automatic}
                  onChange={(event) => setField('automatic', event.target.checked)}
                  disabled={saving}
                />
                Automatic, no code
              </label>
            </Field>
            {!form.automatic && (
              <Field label="Code" error={errors.code}>
                <input className={fieldClass} value={form.code} onChange={(event) => setField('code', event.target.value.toUpperCase())} disabled={saving} placeholder="SEPTEMBER10" />
              </Field>
            )}
            <Field label="Discount type">
              <select className={fieldClass} value={form.discountType} onChange={(event) => setField('discountType', event.target.value as PromotionDiscountType)} disabled={saving}>
                {discountTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label={form.discountType === 'PERCENT' ? 'Percent value' : 'Fixed amount'} error={errors.value}>
              <input className={fieldClass} type="number" step="0.01" min="0.01" max={form.discountType === 'PERCENT' ? 100 : undefined} value={form.value} onChange={(event) => setField('value', event.target.value)} disabled={saving} />
            </Field>
            {form.discountType === 'PERCENT' && (
              <Field label="Max discount cap" error={errors.maxDiscountAmount}>
                <input className={fieldClass} type="number" step="0.01" min="0" value={form.maxDiscountAmount} onChange={(event) => setField('maxDiscountAmount', event.target.value)} disabled={saving} placeholder="Optional" />
              </Field>
            )}
            <Field label="Minimum order amount" error={errors.minOrderAmount}>
              <input className={fieldClass} type="number" step="0.01" min="0" value={form.minOrderAmount} onChange={(event) => setField('minOrderAmount', event.target.value)} disabled={saving} placeholder="Optional" />
            </Field>
            <Field label="Start date-time" error={errors.startAt}>
              <input className={fieldClass} type="datetime-local" value={form.startAt} onChange={(event) => setField('startAt', event.target.value)} disabled={saving} />
            </Field>
            <Field label="End date-time" error={errors.endAt}>
              <input className={fieldClass} type="datetime-local" value={form.endAt} onChange={(event) => setField('endAt', event.target.value)} disabled={saving} />
            </Field>
            <Field label="Total usage limit" error={errors.usageLimit}>
              <input className={fieldClass} type="number" min="1" value={form.usageLimit} onChange={(event) => setField('usageLimit', event.target.value)} disabled={saving} placeholder="Optional" />
            </Field>
            <Field label="Per-user limit" error={errors.perUserLimit}>
              <input className={fieldClass} type="number" min="1" value={form.perUserLimit} onChange={(event) => setField('perUserLimit', event.target.value)} disabled={saving} />
            </Field>
            <Field label="Scope">
              <select className={fieldClass} value={form.scope} onChange={(event) => setField('scope', event.target.value as PromotionScope)} disabled={saving}>
                {scopes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            {form.scope !== 'ALL' && (
              <Field label={`${form.scope.toLowerCase()} target ids`} error={errors.targetIds}>
                <input className={fieldClass} value={form.targetIds} onChange={(event) => setField('targetIds', event.target.value)} disabled={saving} placeholder="Comma-separated ids" />
              </Field>
            )}
          </div>

          <Field label="Description">
            <textarea className={textareaClass} value={form.description} onChange={(event) => setField('description', event.target.value)} disabled={saving} placeholder="Customer-facing promotion details" />
          </Field>
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E50914]/15 text-[#E50914]">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground">Live summary</h2>
                <p className="text-xs text-muted-foreground">Preview only. Backend decides final eligibility.</p>
              </div>
            </div>
            <p className="mt-5 rounded-xl border border-border bg-muted/50 p-4 text-sm leading-6 text-foreground">
              {buildPromotionSummary(form)}
            </p>
          </section>
          <section className="rounded-xl border border-border bg-card p-5 text-xs leading-6 text-muted-foreground">
            <h2 className="mb-2 text-sm font-bold text-foreground">Validation rules</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Codes use uppercase letters, numbers, underscores, or hyphens.</li>
              <li>Percent discounts cannot exceed 100%.</li>
              <li>End date must be after start date.</li>
              <li>Pause or activate promotions instead of deleting them.</li>
            </ul>
          </section>
        </aside>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className={labelClass}>{label}</span>
      {children}
      {error && <span className="block text-xs text-rose-400">{error}</span>}
    </label>
  );
}
