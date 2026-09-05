import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { useOrderItemStore } from '@/store/orderItemStore';
import { useOrderStore } from '@/store/orderStore';
import { useProductStore } from '@/store/productStore';
import { OrderItem, OrderItemInput } from '@/types/orderItem';
import { formatCurrency } from '@/utils/formatDate';

const columns: CrudColumn<OrderItem>[] = [
  {
    key: 'productId',
    header: 'Product',
    render: (row, context) => {
      const products = context?.products as Record<number, string> | undefined;
      return products?.[row.productId] ?? `#${row.productId}`;
    },
  },
  {
    key: 'orderId',
    header: 'Order',
    render: (row, context) => {
      const nos = context?.nos as Record<number, string> | undefined;
      return nos?.[row.orderId] ?? `#${row.orderId}`;
    },
  },
  { key: 'quantity', header: 'Qty' },
  { key: 'unitPrice', header: 'Unit Price', render: (row) => formatCurrency(row.unitPrice) },
  {
    key: 'subtotal',
    header: 'Subtotal',
    render: (row) => (
      <span className="font-semibold text-foreground">{formatCurrency(row.subtotal)}</span>
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

  const context: Record<string, unknown> = {};
  const productNames: Record<number, string> = {};
  for (const p of products) productNames[p.id] = p.name;
  context.products = productNames;
  const orderNos: Record<number, string> = {};
  for (const o of orders) orderNos[o.id] = o.orderNumber;
  context.nos = orderNos;

  const fields: CrudField[] = [
    { name: 'productId', label: 'Product', type: 'select', options: products.map((p) => ({ value: String(p.id), label: p.name })), required: true },
    { name: 'orderId', label: 'Order', type: 'select', options: orders.map((o) => ({ value: String(o.id), label: o.orderNumber })), required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', placeholder: 'e.g. 2', required: true },
    { name: 'unitPrice', label: 'Unit Price (USD)', type: 'number', placeholder: 'e.g. 4.50', required: true },
    { name: 'subtotal', label: 'Subtotal (USD)', type: 'number', placeholder: 'e.g. 9.00', required: true },
  ];

  return (
    <CrudTable
      title="Order Items"
      subtitle="Manage line items attached to orders"
      items={orderItems}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['quantity']}
      columnContext={context}
      createLabel="Add Order Item"
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