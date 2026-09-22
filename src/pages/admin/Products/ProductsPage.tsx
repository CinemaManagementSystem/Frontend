import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, DollarSign, Popcorn } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useProductStore } from '@/store/productStore';
import { useProductCategoryStore } from '@/store/productCategoryStore';
import { Product, ProductInput } from '@/types/product';
import { formatCurrency } from '@/utils/formatDate';

const AVAILABILITY_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
];

const columns: CrudColumn<Product>[] = [
  {
    key: 'imageUrl',
    header: 'Product',
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
          {row.imageUrl ? (
            <img
              src={row.imageUrl}
              alt={row.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
              }}
            />
          ) : (
            <Popcorn className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-foreground text-sm">{row.name}</h4>
          <p className="text-[11px] text-muted-foreground font-mono">ID #{row.id}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'productCategoryId',
    header: 'Category',
    render: (row, context) => {
      const names = context?.names as Record<number, string> | undefined;
      return (
        <Badge variant="secondary" size="sm">
          {names?.[row.productCategoryId] ?? `#${row.productCategoryId}`}
        </Badge>
      );
    },
  },
  {
    key: 'price',
    header: 'Price',
    render: (row) => <span className="font-bold text-foreground">{formatCurrency(row.price)}</span>,
  },
  {
    key: 'stockQuantity',
    header: 'Stock',
    render: (row) => {
      const isLow = row.stockQuantity <= 10;
      const isOut = row.stockQuantity === 0;
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            isOut
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : isLow
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-muted text-foreground border border-border'
          }`}
        >
          {row.stockQuantity} in stock
        </span>
      );
    },
  },
  {
    key: 'isAvailable',
    header: 'Available',
    render: (row) =>
      row.isAvailable ? (
        <Badge variant="success" size="sm">Active</Badge>
      ) : (
        <Badge variant="destructive" size="sm">Unavailable</Badge>
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

  const stats: CrudStat[] = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Popcorn,
      tone: 'border-border bg-muted text-foreground',
    },
    {
      label: 'Available in Store',
      value: products.filter((p) => p.isAvailable).length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Low / Out of Stock',
      value: products.filter((p) => p.stockQuantity <= 10).length,
      icon: AlertCircle,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
    {
      label: 'Average Price',
      value: products.length
        ? formatCurrency(products.reduce((sum, p) => sum + p.price, 0) / products.length)
        : formatCurrency(0),
      icon: DollarSign,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
    },
  ];

  const filters: CrudFilter<Product>[] = [
    {
      key: 'availability',
      label: 'Filter by availability',
      options: [{ value: 'ALL', label: 'All statuses' }, ...AVAILABILITY_OPTIONS],
      getValue: (p) => (p.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'),
    },
    {
      key: 'category',
      label: 'Filter by category',
      options: [
        { value: 'ALL', label: 'All categories' },
        ...categories.map((c) => ({ value: String(c.id), label: c.name })),
      ],
      getValue: (p) => String(p.productCategoryId),
    },
  ];

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
    { name: 'isAvailable', label: 'Available', type: 'checkbox', defaultValue: true },
    { name: 'image', label: 'Product Image (multipart upload)', type: 'file' },
  ];

  return (
    <CrudTable
      title="Products"
      subtitle="Manage concession items, pricing, inventory stock and high-res imagery"
      items={products}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      filters={filters}
      searchPlaceholder="Search product name, category, or price..."
      searchKeys={['name']}
      searchText={(p) => `${p.id} ${p.name} ${names[p.productCategoryId] ?? ''} ${p.price}`}
      columnContext={{ names }}
      createLabel="Add Product"
      createUrl="/admin/products/create"
      pageSize={10}
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