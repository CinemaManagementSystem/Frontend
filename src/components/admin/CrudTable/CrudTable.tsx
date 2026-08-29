import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Spinner } from '@/components/ui/Spinner/Spinner';

export type CrudFieldType = 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'checkbox' | 'select';

export interface CrudField {
  name: string;
  label: string;
  type?: CrudFieldType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface CrudColumn<T> {
  key: string;
  header: string;
  render?: (row: T, context?: Record<string, unknown>) => React.ReactNode;
}

export type CrudValue = string | number | boolean;

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
  getId,
  getDisplayName,
  onSave,
  onDelete,
}: CrudTableProps<T>) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Record<string, CrudValue>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = (item as Record<string, unknown>)[key];
        return value != null && String(value).toLowerCase().includes(query);
      })
    );
  }, [items, search, searchKeys]);

  const buildDefaultValues = (): Record<string, CrudValue> => {
    const values: Record<string, CrudValue> = {};
    fields.forEach((field) => {
      values[field.name] = field.type === 'checkbox' ? false : '';
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
      values[field.name] =
        raw != null
          ? (raw as CrudValue)
          : field.type === 'checkbox'
            ? false
            : '';
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
      await onSave(formValues, editingId);
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: T) => {
    const id = getId(row);
    const label = getDisplayName ? getDisplayName(row) : `item #${id}`;
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to delete item.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          {createLabel}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#141417] border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="w-full bg-transparent text-sm text-white pl-9 pr-4 py-1.5 outline-none placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#141417] border border-white/10 shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-12">
                    #
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400"
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <motion.tbody
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
              >
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-14 text-center">
                      <p className="text-sm text-gray-500">No records found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((row, index) => {
                    const id = getId(row);
                    const deleting = deletingId === id;
                    return (
                      <motion.tr
                        key={id}
                        variants={{
                          hidden: { opacity: 0, y: 6 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                        }}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-gray-500">{index + 1}</td>
                        {columns.map((col) => (
                          <td key={col.key} className="px-4 py-3 text-sm text-gray-200">
                            {col.render
                              ? col.render(row, columnContext)
                              : String((row as Record<string, unknown>)[col.key] ?? '')}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openEdit(row)}
                              title="Edit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-white/10 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(row)}
                              disabled={deleting}
                              title="Delete"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId == null ? `Add ${title}` : `Edit ${title}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field) => {
              const value = formValues[field.name];
              if (field.type === 'checkbox') {
                return (
                  <label
                    key={field.name}
                    className="flex items-center gap-3 text-sm text-gray-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) => setFieldValue(field.name, e.target.checked)}
                      className="w-4 h-4 rounded bg-[#1e1e22] border-white/20 text-[#E50914] focus:ring-0"
                    />
                    <span>{field.label}</span>
                  </label>
                );
              }
              if (field.type === 'select' && field.options) {
                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-300">
                      {field.label}
                    </label>
                    <select
                      value={String(value ?? '')}
                      onChange={(e) => setFieldValue(field.name, e.target.value)}
                      className="w-full bg-[#1e1e22]/80 text-white text-sm rounded-lg border border-white/10 px-3.5 py-2.5 outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20"
                    >
                      <option value="">Select...</option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              if (field.type === 'textarea') {
                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-300">
                      {field.label}
                    </label>
                    <textarea
                      value={String(value ?? '')}
                      onChange={(e) => setFieldValue(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full bg-[#1e1e22]/80 text-white text-sm rounded-lg border border-white/10 px-3.5 py-2.5 outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 resize-none"
                    />
                  </div>
                );
              }
              return (
                <Input
                  key={field.name}
                  label={field.label}
                  type={
                    field.type === 'number'
                      ? 'number'
                      : field.type === 'date'
                        ? 'date'
                        : field.type === 'datetime'
                          ? 'datetime-local'
                          : 'text'
                  }
                  placeholder={field.placeholder}
                  required={field.required}
                  value={String(value ?? '')}
                  onChange={(e) =>
                    setFieldValue(
                      field.name,
                      field.type === 'number' ? Number(e.target.value) : e.target.value
                    )
                  }
                />
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? 'Saving...' : editingId == null ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}