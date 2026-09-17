import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { AlertCircle, ArrowLeft, RefreshCw, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { useToast } from '@/components/ui/Toast/Toast';
import { cn } from '@/lib/utils';

export type CreateFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'datetime'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'segment'
  | 'file'
  | 'imageUrl';

export type CreateFieldValue = string | number | boolean | File | string[] | null;

export interface CreateFieldOption {
  value: string;
  label: string;
}

export interface CreateField {
  name: string;
  label: string;
  type?: CreateFieldType;
  placeholder?: string;
  required?: boolean;
  helper?: string;
  options?: CreateFieldOption[];
  spanFull?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number | string;
  accept?: string;
}

export interface CreateSection {
  title: string;
  description?: string;
  icon?: React.ElementType;
  fields: CreateField[];
}

export interface CreateEntityPageProps {
  backUrl: string;
  backLabel: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  submitLabel?: string;
  sections: CreateSection[];
  initialValues?: Record<string, CreateFieldValue>;
  loadOptions?: () => Promise<void> | void;
  loading?: boolean;
  loadingLabel?: string;
  onValuesChange?: (
    values: Record<string, CreateFieldValue>,
    changedName: string,
  ) => Partial<Record<string, CreateFieldValue>> | void;
  onSubmit: (values: Record<string, CreateFieldValue>) => Promise<void>;
}

const TEXT_LIKE_TYPES: CreateFieldType[] = ['text', 'email', 'password', 'number', 'date', 'datetime', 'tel'];

function defaultForField(field: CreateField): CreateFieldValue {
  if (field.type === 'segment') return field.options?.[0]?.value ?? '';
  if (field.type === 'multiselect') return [];
  if (field.type === 'file') return null;
  return '';
}

function buildDefaultValues(sections: CreateSection[]): Record<string, CreateFieldValue> {
  const values: Record<string, CreateFieldValue> = {};
  sections.forEach((section) =>
    section.fields.forEach((field) => {
      values[field.name] = defaultForField(field);
    }),
  );
  return values;
}

function validateField(field: CreateField, value: CreateFieldValue | undefined): string {
  if (field.type === 'multiselect') {
    const list = Array.isArray(value) ? value : [];
    if (field.required && list.length === 0) return 'Please select at least one option.';
    return '';
  }
  if (field.type === 'file') {
    if (field.required && !(value instanceof File)) return 'Please choose a file to upload.';
    return '';
  }
  if (field.required) {
    if (value == null) return `${field.label} is required.`;
    if (typeof value === 'string' && value.trim() === '') return `${field.label} is required.`;
    if (typeof value === 'number' && Number.isNaN(value)) return `${field.label} is required.`;
  }
  if (field.type === 'number') {
    const numeric = Number(value);
    if (value !== '' && value != null && !Number.isNaN(numeric)) {
      if (field.min != null && numeric < field.min) {
        return `Must be at least ${field.min}.`;
      }
      if (field.max != null && numeric > field.max) {
        return `Must be at most ${field.max}.`;
      }
    }
  }
  return '';
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-rose-400">
      {message}
    </p>
  );
}

function SectionHeading({ title, description, icon: Icon }: { title: string; description?: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-[#E50914]">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0">
        <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#E50914]">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

function SegmentField({
  id,
  field,
  value,
  disabled,
  onChange,
  onBlur,
}: {
  id: string;
  field: CreateField;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  const options = field.options ?? [];
  return (
    <div
      role="group"
      aria-label={field.label}
      onBlur={onBlur}
      className="inline-flex w-full flex-wrap gap-1.5 rounded-xl border border-border bg-muted p-1.5"
    >
      {options.map((option) => {
        const selected = String(value) === option.value;
        return (
          <button
            key={option.value}
            id={selected ? id : undefined}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all',
              selected
                ? 'bg-[#E50914] text-white shadow-sm shadow-[#E50914]/25'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelectField({
  id,
  field,
  value,
  disabled,
  onChange,
  onBlur,
}: {
  id: string;
  field: CreateField;
  value: string[];
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onBlur?: () => void;
}) {
  const options = field.options ?? [];
  const toggle = (optionValue: string) => {
    if (!Array.isArray(value)) return;
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <div onBlur={onBlur} className="flex flex-wrap gap-2" role="group" aria-label={field.label}>
      {options.map((option) => {
        const selected = Array.isArray(value) && value.includes(option.value);
        return (
          <button
            key={option.value}
            id={selected ? id : undefined}
            type="button"
            disabled={disabled}
            onClick={() => toggle(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
              selected
                ? 'border-[#E50914] bg-[#E50914]/15 text-[#E50914]'
                : 'border-border bg-muted text-muted-foreground hover:border-[#E50914]/40 hover:text-foreground',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {selected && <span className="h-1.5 w-1.5 rounded-full bg-[#E50914]" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function MediaUploadField({
  id,
  field,
  value,
  disabled,
  onChange,
}: {
  id: string;
  field: CreateField;
  value: File | null;
  disabled?: boolean;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!(value instanceof File)) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={field.accept ?? 'image/*'}
        disabled={disabled}
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      {previewUrl && value instanceof File ? (
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          <div className="relative">
            <img src={previewUrl} alt={field.label} className="aspect-video w-full object-cover" />
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-popover/90 px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur transition-colors hover:bg-popover hover:text-[#E50914] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
          <p className="truncate border-t border-border px-3 py-2 text-xs text-muted-foreground">{value.name}</p>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-8 text-center transition-all hover:border-[#E50914]/50 hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-popover text-muted-foreground transition-colors group-hover:text-[#E50914]">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Click to upload</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {field.helper ?? 'PNG, JPG or WebP — recommended high resolution'}
            </p>
          </div>
        </button>
      )}
    </div>
  );
}

function ImageUrlField({
  id,
  field,
  value,
  disabled,
  onChange,
}: {
  id: string;
  field: CreateField;
  value: string;
  disabled?: boolean;
  onChange: (url: string) => void;
}) {
  const [hasError, setHasError] = useState(false);
  const showPreview = Boolean(typeof value === 'string' && value.trim()) && !hasError;

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
      <div>
        <input
          id={id}
          type="url"
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(event) => {
            setHasError(false);
            onChange(event.target.value);
          }}
          placeholder={field.placeholder ?? 'https://.../image.jpg'}
          className="w-full rounded-lg border border-border bg-muted px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="flex aspect-video overflow-hidden rounded-lg border border-border bg-muted">
        {showPreview ? (
          <img
            src={String(value)}
            alt={field.label}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex w-full items-center justify-center text-muted-foreground">
            <UploadCloud className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

function FieldShell({
  field,
  error,
  requiredAsterisk,
  children,
}: {
  field: CreateField;
  error?: string;
  requiredAsterisk: boolean;
  children: React.ReactNode;
}) {
  const fieldId = `create-field-${field.name}`;
  const controlProps: Record<string, unknown> = {};
  if (field.type === 'file' || field.type === 'imageUrl' || field.type === 'select' || field.type === 'textarea' || TEXT_LIKE_TYPES.includes(field.type ?? 'text')) {
    controlProps.id = fieldId;
  }

  return (
    <div className={cn('space-y-1.5', field.spanFull && 'md:col-span-2')}>
      <label htmlFor={fieldId} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {field.label}
        {requiredAsterisk && <span className="ml-1 text-[#E50914]">*</span>}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, controlProps)
        : children}
      {field.helper && !error && <p className="text-xs text-muted-foreground">{field.helper}</p>}
      <FieldError message={error} />
    </div>
  );
}

function FormField({
  field,
  value,
  error,
  disabled,
  onChange,
}: {
  field: CreateField;
  value: CreateFieldValue | undefined;
  error?: string;
  disabled: boolean;
  onChange: (name: string, value: CreateFieldValue) => void;
}) {
  const fieldId = `create-field-${field.name}`;
  const requiredAsterisk = Boolean(field.required);

  const commonInputClass = cn(
    'w-full rounded-lg border bg-muted px-3.5 py-2.5 text-sm text-foreground outline-none transition-all',
    'placeholder:text-muted-foreground focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20',
    'disabled:cursor-not-allowed disabled:opacity-50 dark:[color-scheme:dark]',
    error ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/20' : 'border-border',
  );

  if (field.type === 'textarea') {
    return (
      <FieldShell field={field} error={error} requiredAsterisk={requiredAsterisk}>
        <textarea
          id={fieldId}
          rows={field.rows ?? 4}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          disabled={disabled}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={cn(commonInputClass, 'resize-none')}
        />
      </FieldShell>
    );
  }

  if (field.type === 'select') {
    return (
      <FieldShell field={field} error={error} requiredAsterisk={requiredAsterisk}>
        <select
          id={fieldId}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={cn(commonInputClass, 'appearance-none dark:[color-scheme:dark]')}
        >
          <option value="" className="bg-popover text-foreground">
            Select...
          </option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value} className="bg-popover text-foreground">
              {option.label}
            </option>
          ))}
        </select>
      </FieldShell>
    );
  }

  if (field.type === 'multiselect') {
    const list = Array.isArray(value) ? value : [];
    return (
      <FieldShell field={field} error={error} requiredAsterisk={requiredAsterisk}>
        <MultiSelectField
          id={fieldId}
          field={field}
          value={list}
          disabled={disabled}
          onChange={(next) => onChange(field.name, next)}
        />
      </FieldShell>
    );
  }

  if (field.type === 'segment') {
    return (
      <FieldShell field={field} error={error} requiredAsterisk={requiredAsterisk}>
        <SegmentField
          id={fieldId}
          field={field}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(next) => onChange(field.name, next)}
        />
      </FieldShell>
    );
  }

  if (field.type === 'file') {
    return (
      <FieldShell field={field} error={error} requiredAsterisk={requiredAsterisk}>
        <MediaUploadField
          id={fieldId}
          field={field}
          value={value instanceof File ? value : null}
          disabled={disabled}
          onChange={(file) => onChange(field.name, file)}
        />
      </FieldShell>
    );
  }

  if (field.type === 'imageUrl') {
    return (
      <FieldShell field={field} error={error} requiredAsterisk={requiredAsterisk}>
        <ImageUrlField
          id={fieldId}
          field={field}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(url) => onChange(field.name, url)}
        />
      </FieldShell>
    );
  }

  const isNumber = field.type === 'number';
  const inputType = field.type === 'datetime' ? 'datetime-local' : field.type ?? 'text';

  return (
    <FieldShell field={field} error={error} requiredAsterisk={requiredAsterisk}>
      <input
        id={fieldId}
        type={inputType}
        value={String(value ?? '')}
        placeholder={field.placeholder}
        disabled={disabled}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={(event) => onChange(field.name, isNumber ? event.target.value : event.target.value)}
        className={commonInputClass}
      />
    </FieldShell>
  );
}

export const CreateEntityPage: React.FC<CreateEntityPageProps> = ({
  backUrl,
  backLabel,
  icon: PageIcon,
  title,
  subtitle,
  submitLabel = 'Save',
  sections,
  initialValues,
  loadOptions,
  loading = false,
  loadingLabel = 'Loading form data...',
  onValuesChange,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState<Record<string, CreateFieldValue>>(() =>
    buildDefaultValues(sections),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(Boolean(loadOptions));
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!initialValues) return;
    setValues((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

  const runLoadOptions = useCallback(async () => {
    if (!loadOptions) return;
    setOptionsLoading(true);
    setLoadError('');
    try {
      await loadOptions();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load form data.');
    } finally {
      setOptionsLoading(false);
    }
  }, [loadOptions]);

  useEffect(() => {
    void runLoadOptions();
  }, [runLoadOptions]);

  const setFieldValue = useCallback(
    (name: string, value: CreateFieldValue) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        if (!onValuesChange) return next;
        const adjustments = onValuesChange(next, name);
        return adjustments
          ? ({ ...next, ...adjustments } as Record<string, CreateFieldValue>)
          : next;
      });
      setErrors((prev) => {
        if (!prev[name]) return prev;
        const rest: Record<string, string> = {};
        for (const key of Object.keys(prev)) {
          if (key !== name) rest[key] = prev[key];
        }
        return rest;
      });
    },
    [onValuesChange],
  );

  const fieldCount = useMemo(
    () => sections.reduce((count, section) => count + section.fields.length, 0),
    [sections],
  );

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    sections.forEach((section) =>
      section.fields.forEach((field) => {
        const message = validateField(field, values[field.name]);
        if (message) nextErrors[field.name] = message;
      }),
    );

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstInvalid = sections
        .flatMap((section) => section.fields)
        .find((field) => nextErrors[field.name]);
      if (firstInvalid) {
        const element = document.getElementById(`create-field-${firstInvalid.name}`);
        element?.focus();
        element?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
      toast.error('Please review the highlighted fields and try again.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
      toast.success(`${title.replace(/^Add New\s+/i, '')} created successfully.`);
      navigate(backUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || optionsLoading || loading;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Top navigation / action bar */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-[#E50914]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {backLabel}
          </Link>
          <div className="mt-4 flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-[#E50914] shadow-sm">
              <PageIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:shrink-0">
          <Button type="button" variant="outline" size="md" onClick={() => navigate(backUrl)} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="button" variant="primary" size="md" onClick={() => void handleSubmit()} disabled={isBusy}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </section>

      {loadError && (
        <section
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <h2 className="text-sm font-bold text-foreground">Unable to load form data</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{loadError}</p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void runLoadOptions()}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Retry
          </Button>
        </section>
      )}

      <motion.form
        ref={formRef}
        noValidate
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && event.target instanceof HTMLTextAreaElement === false) {
            const target = event.target as HTMLElement;
            if (target instanceof HTMLElement && target.tagName !== 'BUTTON' && target.tagName !== 'TEXTAREA') {
              event.preventDefault();
            }
          }
        }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/10"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-8">
          <div>
            <h2 className="text-sm font-bold text-foreground">New {title.replace(/^Add New\s+/i, '')}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {fieldCount} fields · <span className="text-[#E50914]">*</span> required
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Form
          </span>
        </div>

        {isBusy ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">{loadingLabel}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <section key={section.title} className="px-6 py-6 sm:px-8">
                  <SectionHeading title={section.title} description={section.description} icon={SectionIcon} />
                  <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
                    {section.fields.map((field) => (
                      <FormField
                        key={field.name}
                        field={field}
                        value={values[field.name]}
                        error={errors[field.name]}
                        disabled={submitting}
                        onChange={setFieldValue}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8">
          <p className="mr-auto text-xs text-muted-foreground">Fields marked with <span className="text-[#E50914]">*</span> are required.</p>
          <Button type="button" variant="outline" size="md" onClick={() => navigate(backUrl)} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="button" variant="primary" size="md" onClick={() => void handleSubmit()} disabled={isBusy}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </motion.form>
    </div>
  );
};