import React, { useEffect } from 'react';
import { CheckCircle2, List, Tags, XCircle } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useCategoryStore } from '@/store/categoryStore';
import { MovieCategory, MovieCategoryInput } from '@/types/category';

const columns: CrudColumn<MovieCategory>[] = [
  { key: 'name', header: 'Category Name' },
  { key: 'description', header: 'Description' },
  {
    key: 'isActive',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.isActive ? 'success' : 'outline'}>
        {row.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
];

const fields: CrudField[] = [
  { name: 'name', label: 'Category Name', placeholder: 'e.g. Sci-Fi & Fantasy', required: true },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Short description of the category',
  },
  { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
];

function toInput(values: Record<string, CrudValue>): MovieCategoryInput {
  return {
    name: String(values.name ?? ''),
    description: String(values.description ?? ''),
    isActive: Boolean(values.isActive ?? true),
  };
}

export const CategoriesPage: React.FC = () => {
  const { categories, loading, fetchAll, create, update, remove } = useCategoryStore();

  const stats: CrudStat[] = [
    { label: 'Total Categories', value: categories.length, icon: List, tone: 'border-border bg-muted text-foreground' },
    {
      label: 'Active',
      value: categories.filter((category) => category.isActive).length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Inactive',
      value: categories.filter((category) => !category.isActive).length,
      icon: XCircle,
      tone: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
    },
    {
      label: 'Catalog Usage',
      value: categories.length ? 'Ready' : 'Empty',
      icon: Tags,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
  ];

  const filters: CrudFilter<MovieCategory>[] = [
    {
      key: 'status',
      label: 'Filter by status',
      options: [
        { value: 'ALL', label: 'All statuses' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
      ],
      getValue: (category) => (category.isActive ? 'ACTIVE' : 'INACTIVE'),
    },
  ];

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return (
    <CrudTable
      title="Movie Categories"
      subtitle="Categories used to organize the movie catalog"
      items={categories}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      filters={filters}
      searchPlaceholder="Search by category name or description..."
      modalMaxWidth="md"
      searchKeys={['name', 'description']}
      createLabel="Add Category"
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
