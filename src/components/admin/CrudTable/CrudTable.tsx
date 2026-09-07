import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Database, Plus, Edit2, Trash2, Search, ChevronDown, X } from 'lucide-react';
import { Modal, type ModalProps } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { AlertDialog } from '@/components/ui/Alert/AlertDialog';

function singularize(label: string): string {
  if (label.endsWith('ies')) return `${label.slice(0, -3)}y`;
  if (label.endsWith('s')) return label.slice(0, -1);
  return label;
}

export type CrudFieldType = 'text' | 'password' | 'textarea' | 'number' | 'date' | 'datetime' | 'checkbox' | 'select' | 'file';

export interface CrudField {
  name: string;
  label: string;
  type?: CrudFieldType;
  placeholder?: string;
  required?: boolean;
  requiredOnCreate?: boolean;
  defaultValue?: CrudValue;
  options?:
    | { value: string; label: string }[]
    | ((values: Record<string, CrudValue>, editingId: number | null) => { value: string; label: string }[]);
  disabled?: (values: Record<string, CrudValue>, editingId: number | null) => boolean;
  hidden?: (values: Record<string, CrudValue>, editingId: number | null) => boolean;
}

export interface CrudColumn<T> {
  key: string;
  header: string;
  render?: (row: T, context?: Record<string, unknown>) => React.ReactNode;
}

export type CrudValue = string | number | boolean | File | null;

export interface CrudRowAction<T> {
  title: string;
  icon?: React.ReactNode;
  onClick: (row: T) => Promise<void> | void;
  disabled?: (row: T) => boolean;
}

function StatCard({ stat }: { stat: CrudStat }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${stat.tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export interface CrudStat {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone: string;
}

export interface CrudFilter<T> {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  getValue: (row: T) => string;
}

export interface CrudTableProps<T> {
  title: string;
  subtitle: string;
  items: T[];
  loading?: boolean;
  columns: CrudColumn<T>[];
  fields: CrudField[];
  searchKeys?: string[];
  createLabel?: string;
  columnContext?: Record<string, unknown>;
  extraActions?: CrudRowAction<T>[];
  stats?: CrudStat[];
  filters?: CrudFilter<T>[];
  searchPlaceholder?: string;
  searchText?: (row: T) => string;
  error?: string;
  onRetry?: () => void;
  modalMaxWidth?: ModalProps['maxWidth'];
  getId: (row: T) => number;
  getDisplayName?: (row: T) => string;
  onSave: (values: Record<string, CrudValue>, id: number | null) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function CrudTable<T>({
  title,
  subtitle,
  items,
  loading = false,
  columns,
  fields,
  searchKeys = [],
  createLabel = 'Add New',
  columnContext,
  extraActions = [],
  stats = [],
  filters = [],
  searchPlaceholder = 'Search records...',
  searchText,
  error = '',
  onRetry,
  modalMaxWidth = 'lg',
  getId,
  getDisplayName,
  onSave,
  onDelete,
}: CrudTableProps<T>) {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Record<string, CrudValue>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    title: string;
    description: string;
    variant: 'danger' | 'warning' | 'info' | 'success';
    confirmLabel?: string;
    onConfirm?: () => void | Promise<void>;
  } | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) =>
      (!query ||
        (searchText ? searchText(item).toLowerCase().includes(query) : false) ||
        searchKeys.some((key) => {
          const value = (item as Record<string, unknown>)[key];
          return value != null && String(value).toLowerCase().includes(query);
        })) &&
      filters.every((filter) => {
        const selectedValue = filterValues[filter.key] ?? 'ALL';
        return selectedValue === 'ALL' || filter.getValue(item) === selectedValue;
      }),
    );
  }, [filters, filterValues, items, search, searchKeys, searchText]);

  const hasFilters = search.trim() !== '' || Object.values(filterValues).some((value) => value !== 'ALL');

  const clearFilters = () => {
    setSearch('');
    setFilterValues({});
  };

  const buildDefaultValues = (): Record<string, CrudValue> => {
    const values: Record<string, CrudValue> = {};
    fields.forEach((field) => {
      values[field.name] =
        field.defaultValue ??
        (field.type === 'checkbox' ? false : field.type === 'file' ? null : '');
    });
    return values;
  };

  const openCreate = () => {
    setEditingId(null);
    setFormError('');
    setFormValues(buildDefaultValues());
    setModalOpen(true);
  };

  const openEdit = (row: T) => {
    const values: Record<string, CrudValue> = {};
    fields.forEach((field) => {
      const raw = (row as Record<string, unknown>)[field.name];
      const rawString = raw == null ? '' : String(raw);
      const options =
        typeof field.options === 'function' ? field.options(values, getId(row)) : field.options;
      const normalizedSelectValue =
        field.type === 'select' && options
          ? options.find((option) => {
              const optionValue = option.value.toUpperCase();
              const optionLabel = option.label.toUpperCase();
              const value = rawString.toUpperCase().replace(/^ROLE_/, '');
              return optionValue === value || optionLabel === rawString.toUpperCase();
            })?.value
          : undefined;

      values[field.name] =
        field.type === 'file'
          ? null
          : normalizedSelectValue ??
            (raw != null
              ? (raw as CrudValue)
              : field.type === 'checkbox'
                ? false
                : '');
    });
    setEditingId(getId(row));
    setFormError('');
    setFormValues(values);
    setModalOpen(true);
  };

  const setFieldValue = (name: string, value: CrudValue) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const wasCreating = editingId == null;
      const resourceName = singularize(title);
      await onSave(formValues, editingId);
      setModalOpen(false);
      setAlert({
        title: wasCreating ? 'Created successfully' : 'Updated successfully',
        description: `${resourceName} ${wasCreating ? 'was created' : 'was updated'} successfully.`,
        variant: 'success',
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (row: T) => {
    const id = getId(row);
    const label = getDisplayName ? getDisplayName(row) : `item #${id}`;
    setAlert({
      title: 'Delete record?',
      description: `Delete "${label}"? This cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setDeletingId(id);
        try {
          await onDelete(id);
          setAlert({
            title: 'Deleted successfully',
            description: `"${label}" was deleted successfully.`,
            variant: 'success',
          });
        } catch (err) {
          setAlert({
            title: 'Delete failed',
            description: err instanceof Error ? err.message : 'Failed to delete item.',
            variant: 'danger',
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const runAction = async (title: string, row: T) => {
    const action = extraActions.find((a) => a.title === title);
    if (!action) return;
    setBusyAction(`${title}:${getId(row)}`);
    try {
      await action.onClick(row);
    } catch (err) {
      setAlert({
        title: `${title} failed`,
        description: err instanceof Error ? err.message : `Failed to ${title.toLowerCase()}.`,
        variant: 'danger',
      });
    } finally {
      setBusyAction(null);
    }
  };

  const renderActions = (row: T, compact = false) => {
    const id = getId(row);
    const deleting = deletingId === id;
    const buttonClass =
      'inline-flex items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50';

    return (
      <div className={compact ? 'flex gap-2' : 'inline-flex items-center gap-1.5'}>
        {extraActions.map((action) => {
          const key = `${action.title}:${id}`;
          const busy = busyAction === key;
          const isDisabled = busy || (action.disabled ? action.disabled(row) : false);
          return (
            <button
              key={action.title}
              type="button"
              onClick={() => void runAction(action.title, row)}
              disabled={isDisabled}
              title={action.title}
              className={`${buttonClass} ${compact ? 'h-9 flex-1 gap-2 px-3 text-xs font-semibold' : 'h-8 w-8'}`}
            >
              {action.icon}
              {compact && <span>{busy ? 'Working' : action.title}</span>}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => openEdit(row)}
          title="Edit"
          className={`${buttonClass} hover:bg-amber-500/10 hover:text-amber-400 ${compact ? 'h-9 flex-1 gap-2 px-3 text-xs font-semibold' : 'h-8 w-8'}`}
        >
          <Edit2 className="h-4 w-4" />
          {compact && <span>Edit</span>}
        </button>
        <button
          type="button"
          onClick={() => requestDelete(row)}
          disabled={deleting}
          title="Delete"
          className={`${buttonClass} hover:bg-rose-500/10 hover:text-rose-400 ${compact ? 'h-9 flex-1 gap-2 px-3 text-xs font-semibold' : 'h-8 w-8'}`}
        >
          <Trash2 className="h-4 w-4" />
          {compact && <span>{deleting ? 'Deleting' : 'Delete'}</span>}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#E50914]">{title} Management</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate} disabled={loading || saving} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {createLabel}
        </Button>
      </section>

      {stats.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </section>
      )}

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20"
            />
          </div>
          {filters.map((filter) => (
            <div key={filter.key} className="relative">
              <select
                value={filterValues[filter.key] ?? 'ALL'}
                onChange={(event) =>
                  setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }))
                }
                aria-label={filter.label}
                className="h-10 w-full appearance-none rounded-lg border border-border bg-muted px-3 pr-9 text-sm text-foreground outline-none transition-all focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 dark:[color-scheme:dark]"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value} className="bg-popover text-foreground">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          ))}
          <Button type="button" variant="outline" size="md" onClick={clearFilters} disabled={!hasFilters} className="h-10">
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        </div>
      </section>

      {error ? (
        <section className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Unable to load {title.toLowerCase()}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            {onRetry && (
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                Try again
              </Button>
            )}
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold text-foreground">{title} overview</h2>
              <p className="text-xs text-muted-foreground">
                Showing {filteredItems.length} of {items.length} records
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-3 text-sm text-muted-foreground">Loading {title.toLowerCase()}...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center px-6 py-12 text-center">
              <div className="max-w-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
                  {items.length === 0 ? <Database className="h-6 w-6" /> : <Search className="h-6 w-6" />}
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">
                  {items.length === 0 ? `No ${title.toLowerCase()} yet` : `No matching ${title.toLowerCase()}`}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {items.length === 0
                    ? `Add your first ${singularize(title).toLowerCase()} to get started.`
                    : 'Try another search term or clear the filters.'}
                </p>
                {items.length === 0 ? (
                  <Button type="button" variant="primary" size="sm" onClick={openCreate} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    {createLabel}
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="w-12 px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">#</th>
                      {columns.map((col) => (
                        <th key={col.key} className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                          {col.header}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
                  >
                    {filteredItems.map((row, index) => (
                      <motion.tr
                        key={getId(row)}
                        variants={{
                          hidden: { opacity: 0, y: 6 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                        }}
                        className="border-b border-border transition-colors hover:bg-muted/40"
                      >
                        <td className="px-4 py-3 text-xs text-muted-foreground">{index + 1}</td>
                        {columns.map((col) => (
                          <td key={col.key} className="px-4 py-3 text-sm text-foreground">
                            {col.render
                              ? col.render(row, columnContext)
                              : String((row as Record<string, unknown>)[col.key] ?? '')}
                          </td>
                        ))}
                        <td className="whitespace-nowrap px-4 py-3 text-right">{renderActions(row)}</td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>

              <div className="divide-y divide-border md:hidden">
                {filteredItems.map((row, index) => (
                  <article key={getId(row)} className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {getDisplayName ? getDisplayName(row) : `${title} #${getId(row)}`}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Record {index + 1} · ID #{getId(row)}</p>
                      </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-3">
                      {columns.map((col) => (
                        <div key={col.key} className="min-w-0 rounded-lg bg-muted/60 p-2.5">
                          <dt className="text-[10px] font-semibold uppercase text-muted-foreground">{col.header}</dt>
                          <dd className="mt-1 truncate text-xs font-medium text-foreground">
                            {col.render
                              ? col.render(row, columnContext)
                              : String((row as Record<string, unknown>)[col.key] ?? '')}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="border-t border-border pt-3">{renderActions(row, true)}</div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId == null ? `Add ${singularize(title)}` : `Edit ${singularize(title)}`}
        maxWidth={modalMaxWidth}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium"
            >
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              if (field.hidden?.(formValues, editingId)) return null;

              const value = formValues[field.name];
              const fieldId = `crud-field-${field.name}`;
              const fullWidth = field.type === 'textarea' || field.type === 'file';
              const fieldLayoutClass = fullWidth ? 'sm:col-span-2' : '';
              if (field.type === 'checkbox') {
                return (
                  <label
                    key={field.name}
                    className="flex items-center gap-3 text-sm text-foreground cursor-pointer sm:col-span-2"
                  >
                      <input
                        id={fieldId}
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => setFieldValue(field.name, e.target.checked)}
                        className="w-4 h-4 rounded bg-input border-border text-[#E50914] focus:ring-0"
                    />
                    <span>{field.label}</span>
                  </label>
                );
              }
              if (field.type === 'select' && field.options) {
                const options =
                  typeof field.options === 'function' ? field.options(formValues, editingId) : field.options;
                const disabled = field.disabled?.(formValues, editingId) ?? false;
                return (
                  <div key={field.name} className={`space-y-1.5 ${fieldLayoutClass}`}>
                    <label htmlFor={fieldId} className="block text-xs font-medium text-muted-foreground">
                      {field.label}
                    </label>
                    <div className="relative">
                      <select
                        id={fieldId}
                        value={String(value ?? '')}
                        onChange={(e) => setFieldValue(field.name, e.target.value)}
                        required={field.required || (field.requiredOnCreate && editingId == null)}
                        disabled={disabled}
                        className="w-full appearance-none bg-input text-foreground text-sm rounded-lg border border-border px-3.5 py-2.5 pr-10 outline-none transition-colors focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 disabled:opacity-50 disabled:cursor-not-allowed dark:[color-scheme:dark]"
                      >
                        <option value="" className="bg-popover text-foreground">Select...</option>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-popover text-foreground">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      />
                    </div>
                  </div>
                );
              }
              if (field.type === 'textarea') {
                return (
                  <div key={field.name} className={`space-y-1.5 ${fieldLayoutClass}`}>
                    <label htmlFor={fieldId} className="block text-xs font-medium text-muted-foreground">
                      {field.label}
                    </label>
                    <textarea
                      id={fieldId}
                      value={String(value ?? '')}
                      onChange={(e) => setFieldValue(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full bg-input text-foreground text-sm rounded-lg border border-border px-3.5 py-2.5 outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 resize-none"
                    />
                  </div>
                );
              }
              if (field.type === 'file') {
                return (
                  <div key={field.name} className={`space-y-1.5 ${fieldLayoutClass}`}>
                    <label htmlFor={fieldId} className="block text-xs font-medium text-muted-foreground">
                      {field.label}
                    </label>
                    <input
                      id={fieldId}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFieldValue(field.name, e.target.files?.[0] ?? null)
                      }
                      className="w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-secondary file:text-secondary-foreground file:text-xs file:font-semibold hover:file:bg-muted cursor-pointer"
                    />
                  </div>
                );
              }
              return (
                <div key={field.name} className={fieldLayoutClass}>
                  <Input
                    id={fieldId}
                    label={field.label}
                    type={
                      field.type === 'password'
                        ? 'password'
                        : field.type === 'number'
                        ? 'number'
                        : field.type === 'date'
                          ? 'date'
                          : field.type === 'datetime'
                            ? 'datetime-local'
                            : 'text'
                    }
                    placeholder={field.placeholder}
                    required={field.required || (field.requiredOnCreate && editingId == null)}
                    disabled={field.disabled?.(formValues, editingId) ?? false}
                    value={String(value ?? '')}
                    onChange={(e) =>
                      setFieldValue(
                        field.name,
                        field.type === 'number' ? Number(e.target.value) : e.target.value
                      )
                    }
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? 'Saving...' : editingId == null ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <AlertDialog
        isOpen={alert != null}
        onClose={() => setAlert(null)}
        title={alert?.title ?? ''}
        description={alert?.description ?? ''}
        variant={alert?.variant ?? 'info'}
        confirmLabel={alert?.confirmLabel}
        onConfirm={alert?.onConfirm}
      />
    </div>
  );
}
