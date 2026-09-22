import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Package } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useProductCategoryStore } from '@/store/productCategoryStore';
import { ProductCategory, ProductCategoryInput } from '@/types/productCategory';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const columns: CrudColumn<ProductCategory>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => <span className="font-mono text-xs font-semibold text-foreground">#{row.id}</span>,
  },
  {
    key: 'name',
    header: 'Category Name',
    render: (row) => <span className="font-semibold text-foreground text-sm">{row.name}</span>,
  },
  {
    key: 'description',
    header: 'Description',
    render: (row) => (
      <span className="text-muted-foreground text-xs line-clamp-1">{row.description || '—'}</span>
    ),
  },
  {
    key: 'isActive',
    header: 'Status',
    render: (row) =>
      row.isActive ? (
        <Badge variant="success" size="sm">Active</Badge>
      ) : (
        <Badge variant="secondary" size="sm">Inactive</Badge>
      ),
  },
];

function toInput(values: Record<string, CrudValue>): ProductCategoryInput {
  return {
    name: String(values.name ?? ''),
    description: String(values.description ?? ''),
    isActive: Boolean(values.isActive ?? true),
  };
}

export const ProductCategoriesPage: React.FC = () => {
  const { categories, loading, fetchAll, create, update, remove } = useProductCategoryStore();

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const stats: CrudStat[] = [
    {
      label: 'Total Categories',
      value: categories.length,
      icon: Package,
      tone: 'border-border bg-muted text-foreground',
    },
    {
      label: 'Active',
      value: categories.filter((c) => c.isActive).length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Inactive',
      value: categories.filter((c) => !c.isActive).length,
      icon: AlertTriangle,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
    {
      label: 'Operational Rate',
      value: `${categories.length ? Math.round((categories.filter((c) => c.isActive).length / categories.length) * 100) : 100}%`,
      icon: CheckCircle2,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
    },
  ];

  const filters: CrudFilter<ProductCategory>[] = [
    {
      key: 'status',
      label: 'Filter by status',
      options: [{ value: 'ALL', label: 'All statuses' }, ...STATUS_OPTIONS],
      getValue: (c) => (c.isActive ? 'ACTIVE' : 'INACTIVE'),
    },
  ];

  const fields: CrudField[] = [
    { name: 'name', label: 'Name', placeholder: 'e.g. Popcorn', required: true },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the category' },
    { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
  ];

  return (
    <CrudTable
      title="Product Categories"
      subtitle="Manage concessions categories: popcorn, beverages, snacks and combos"
      items={categories}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      filters={filters}
      searchPlaceholder="Search category name or description..."
      searchKeys={['name', 'description']}
      createLabel="Add Category"
      createUrl="/admin/product-categories/create"
      pageSize={10}
      getId={(row) => row.id}
      getDisplayName={(row) => row.name}
      onSave={async (values, id) => {
        if (id == null) {
          await create(toInput(values));
        } else {
          await update(id, toInput(values));
        }
      }}
      onDelete={remove}
    />
  );
};