import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useProductStore } from '@/store/productStore';
import { useProductCategoryStore } from '@/store/productCategoryStore';
import { Product, ProductInput } from '@/types/product';
import { formatCurrency } from '@/utils/formatDate';

const columns: CrudColumn<Product>[] = [
  {
    key: 'imageUrl',
    header: 'Product',
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
          {row.imageUrl && (
            <img
              src={row.imageUrl}
              alt={row.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
              }}
            />
          )}
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">{row.name}</h4>
          <p className="text-[11px] text-gray-400">Stock: {row.stockQuantity}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'productCategoryId',
    header: 'Category',
    render: (row, context) => {
      const names = context?.names as Record<number, string> | undefined;
      return names?.[row.productCategoryId] ?? `#${row.productCategoryId}`;
    },
  },
  { key: 'price', header: 'Price', render: (row) => formatCurrency(row.price) },
  {
    key: 'isAvailable',
    header: 'Available',
    render: (row) =>
      row.isAvailable ? (
        <Badge variant="success" size="sm">Yes</Badge>
      ) : (
        <Badge variant="secondary" size="sm">No</Badge>
      ),
  },
];

function toInput(values: Record<string, CrudValue>): ProductInput {
  return {
    name: String(values.name ?? ''),
    price: Number(values.price ?? 0),
    stockQuantity: Number(values.stockQuantity ?? 0),
    isAvailable: Boolean(values.isAvailable ?? true),
    productCategoryId: Number(values.productCategoryId ?? 0),
  };
}

export const ProductsPage: React.FC = () => {
  const { products, loading, fetchAll, create, update, remove } = useProductStore();
  const { categories, fetchAll: fetchCategories } = useProductCategoryStore();

  useEffect(() => {
    void fetchAll();
    void fetchCategories();
  }, [fetchAll, fetchCategories]);

  const names: Record<number, string> = {};
  for (const c of categories) names[c.id] = c.name;

  const fields: CrudField[] = [
    { name: 'name', label: 'Name', placeholder: 'e.g. Caramel Popcorn (L)', required: true },
    {
      name: 'productCategoryId',
      label: 'Category',
      type: 'select',
      options: categories.map((c) => ({ value: String(c.id), label: c.name })),
      required: true,
    },
    { name: 'price', label: 'Price (USD)', type: 'number', placeholder: 'e.g. 4.50', required: true },
    { name: 'stockQuantity', label: 'Stock Quantity', type: 'number', placeholder: 'e.g. 100', required: true },
    { name: 'isAvailable', label: 'Available', type: 'checkbox', required: true },
    { name: 'image', label: 'Product Image (multipart upload)', type: 'file' },
  ];

  return (
    <CrudTable
      title="Products"
      subtitle="Manage concession products, pricing, stock and images"
      items={products}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['name']}
      columnContext={{ names }}
      createLabel="Add Product"
      getId={(row) => row.id}
      getDisplayName={(row) => row.name}
      onSave={async (values, id) => {
        const image = values.image instanceof File ? values.image : null;
        if (id == null) {
          await create(toInput(values), image);
        } else {
          await update(id, toInput(values), image);
        }
      }}
      onDelete={remove}
    />
  );
};