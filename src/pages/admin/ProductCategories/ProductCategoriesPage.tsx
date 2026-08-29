import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useProductCategoryStore } from '@/store/productCategoryStore';
import { ProductCategory, ProductCategoryInput } from '@/types/productCategory';

const columns: CrudColumn<ProductCategory>[] = [
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  {
    key: 'isActive',
    header: 'Active',
    render: (row) =>
      row.isActive ? (
        <Badge variant="success" size="sm">Yes</Badge>
      ) : (
        <Badge variant="secondary" size="sm">No</Badge>
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

  const fields: CrudField[] = [
    { name: 'name', label: 'Name', placeholder: 'e.g. Popcorn', required: true },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the category' },
    { name: 'isActive', label: 'Active', type: 'checkbox', required: true },
  ];

  return (
    <CrudTable
      title="Product Categories"
      subtitle="Manage concessions categories: popcorn, beverages, snacks and combos"
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