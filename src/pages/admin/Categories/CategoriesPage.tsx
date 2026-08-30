import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
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
  { name: 'isActive', label: 'Active', type: 'checkbox' },
];

function toInput(values: Record<string, CrudValue>): MovieCategoryInput {
  return {
    name: String(values.name ?? ''),
    description: String(values.description ?? ''),
    isActive: Boolean(values.isActive),
  };
}

export const CategoriesPage: React.FC = () => {
  const { categories, loading, fetchAll, create, update, remove } = useCategoryStore();

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