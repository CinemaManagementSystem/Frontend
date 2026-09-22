import React, { useEffect } from 'react';
import { DollarSign, Package, TrendingUp, UtensilsCrossed } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
import { useOrderItemStore } from '@/store/orderItemStore';
import { useOrderStore } from '@/store/orderStore';
import { useProductStore } from '@/store/productStore';
import { OrderItem, OrderItemInput } from '@/types/orderItem';
import { formatCurrency } from '@/utils/formatDate';

const columns: CrudColumn<OrderItem>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => <span className="font-mono text-xs font-semibold text-foreground">#{row.id}</span>,
  },
  {
    key: 'productId',
    header: 'Product',
    render: (row, context) => {
      const products = context?.products as Record<number, string> | undefined;
      return (
        <span className="font-semibold text-xs text-foreground">
          {products?.[row.productId] ?? `#${row.productId}`}
        </span>
      );
    },
  },
  {
    key: 'orderId',
    header: 'Order',
    render: (row, context) => {
      const nos = context?.nos as Record<number, string> | undefined;
      return (
        <span className="font-mono text-xs font-medium text-foreground">
          {nos?.[row.orderId] ?? `#${row.orderId}`}
        </span>
      );
    },
  },
  {
    key: 'quantity',
    header: 'Qty',
    render: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
        {row.quantity}x
      </span>
    ),
  },
  {
    key: 'unitPrice',
    header: 'Unit Price',
    render: (row) => <span className="text-muted-foreground text-xs">{formatCurrency(row.unitPrice)}</span>,
  },
  {
    key: 'subtotal',
    header: 'Subtotal',
    render: (row) => (
      <span className="font-bold text-foreground">{formatCurrency(row.subtotal)}</span>
    ),
  },
];

function toInput(values: Record<string, CrudValue>): OrderItemInput {
  return {
    quantity: Number(values.quantity ?? 0),
    subtotal: Number(values.subtotal ?? 0),
    unitPrice: Number(values.unitPrice ?? 0),
    orderId: Number(values.orderId ?? 0),
    productId: Number(values.productId ?? 0),
  };
}

export const OrderItemsPage: React.FC = () => {
  const { orderItems, loading, fetchAll, create, update, remove } = useOrderItemStore();
  const { orders, fetchAll: fetchOrders } = useOrderStore();
  const { products, fetchAll: fetchProducts } = useProductStore();

  useEffect(() => {
    void fetchAll();
    void fetchOrders();
    void fetchProducts();
  }, [fetchAll, fetchOrders, fetchProducts]);

  const productNames: Record<number, string> = {};
  for (const p of products) productNames[p.id] = p.name;
  const orderNos: Record<number, string> = {};
  for (const o of orders) orderNos[o.id] = o.orderNumber;

  const stats: CrudStat[] = [
    {
      label: 'Total Line Items',
      value: orderItems.length,
      icon: UtensilsCrossed,
      tone: 'border-border bg-muted text-foreground',
    },
    {
      label: 'Units Ordered',
      value: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      icon: Package,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Average Unit Price',
      value: orderItems.length
        ? formatCurrency(orderItems.reduce((sum, item) => sum + item.unitPrice, 0) / orderItems.length)
        : formatCurrency(0),
      icon: TrendingUp,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
    {
      label: 'Total Items Value',
      value: formatCurrency(orderItems.reduce((sum, item) => sum + item.subtotal, 0)),
      icon: DollarSign,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
    },
  ];

  const fields: CrudField[] = [
    {
      name: 'productId',
      label: 'Product',
      type: 'select',
      options: products.map((p) => ({ value: String(p.id), label: p.name })),
      required: true,
    },
    {
      name: 'orderId',
      label: 'Order',
      type: 'select',
      options: orders.map((o) => ({ value: String(o.id), label: o.orderNumber })),
      required: true,
    },
    { name: 'quantity', label: 'Quantity', type: 'number', placeholder: 'e.g. 2', required: true },
    { name: 'unitPrice', label: 'Unit Price (USD)', type: 'number', placeholder: 'e.g. 4.50', required: true },
    { name: 'subtotal', label: 'Subtotal (USD)', type: 'number', placeholder: 'e.g. 9.00', required: true },
  ];

  return (
    <CrudTable
      title="Order Items"
      subtitle="Manage product quantities, line items and concession receipts"
      items={orderItems}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      searchPlaceholder="Search by product name, order number, or ID..."
      searchKeys={['quantity']}
      searchText={(item) => `${item.id} ${productNames[item.productId] ?? ''} ${orderNos[item.orderId] ?? ''}`}
      columnContext={{ products: productNames, nos: orderNos }}
      createLabel="Add Order Item"
      createUrl="/admin/order-items/create"
      pageSize={10}
      getId={(row) => row.id}
      getDisplayName={(row) => `#${row.id}`}
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