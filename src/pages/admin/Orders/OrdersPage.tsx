import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useOrderStore } from '@/store/orderStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { Order, OrderInput } from '@/types/order';
import { formatCurrency, formatDateTime } from '@/utils/formatDate';

const ORDER_TYPES = [
  { value: 'ONLINE', label: 'ONLINE' },
  { value: 'ONSITE', label: 'ONSITE' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'PENDING' },
  { value: 'PAID', label: 'PAID' },
  { value: 'COMPLETED', label: 'COMPLETED' },
  { value: 'CANCELLED', label: 'CANCELLED' },
];

const columns: CrudColumn<Order>[] = [
  { key: 'orderNumber', header: 'Order No', render: (row) => (
      <span className="font-mono font-bold text-foreground">{row.orderNumber}</span>
    ) },
  { key: 'customerId', header: 'Customer Id', render: (row) => `#${row.customerId}` },
  {
    key: 'bookingId',
    header: 'Booking',
    render: (row, context) => {
      const codes = context?.codes as Record<number, string> | undefined;
      return codes?.[row.bookingId] ?? `#${row.bookingId}`;
    },
  },
  {
    key: 'orderType',
    header: 'Type',
    render: (row) => (
      <Badge variant="secondary" size="sm">{row.orderType}</Badge>
    ),
  },
  {
    key: 'orderedAt',
    header: 'Ordered At',
    render: (row) => formatDateTime(row.orderedAt),
  },
  { key: 'totalAmount', header: 'Total', render: (row) => formatCurrency(row.totalAmount) },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'COMPLETED' || row.status === 'PAID' ? 'success' : row.status === 'CANCELLED' ? 'destructive' : 'warning'} size="sm">
        {row.status}
      </Badge>
    ),
  },
];

function normalizeDateTime(value: string): string {
  const v = String(value ?? '');
  return v.length === 16 ? `${v}:00` : v;
}

function toInput(values: Record<string, CrudValue>): OrderInput {
  return {
    orderNumber: String(values.orderNumber ?? ''),
    orderType: String(values.orderType ?? 'ONLINE'),
    status: String(values.status ?? 'PENDING'),
    orderedAt: normalizeDateTime(String(values.orderedAt ?? '')),
    completedAt: normalizeDateTime(String(values.completedAt ?? '')),
    subtotal: Number(values.subtotal ?? 0),
    totalAmount: Number(values.totalAmount ?? 0),
    bookingId: Number(values.bookingId ?? 0),
    customerId: Number(values.customerId ?? 0),
  };
}

export const OrdersPage: React.FC = () => {
  const { orders, loading, fetchAll, create, update, remove } = useOrderStore();
  const { bookings, fetchAll: fetchBookings } = useBookingAdminStore();

  useEffect(() => {
    void fetchAll();
    void fetchBookings();
  }, [fetchAll, fetchBookings]);

  const codes: Record<number, string> = {};
  for (const b of bookings) codes[b.id] = b.bookingCode;

  const fields: CrudField[] = [
    { name: 'orderNumber', label: 'Order Number', placeholder: 'e.g. ORD-1001', required: true },
    { name: 'customerId', label: 'Customer ID', type: 'number', placeholder: 'User id of the customer', required: true },
    { name: 'bookingId', label: 'Booking', type: 'select', options: bookings.map((b) => ({ value: String(b.id), label: b.bookingCode })), required: true },
    { name: 'orderType', label: 'Order Type', type: 'select', options: ORDER_TYPES, required: true },
    { name: 'orderedAt', label: 'Ordered At', type: 'datetime', required: true },
    { name: 'completedAt', label: 'Completed At', type: 'datetime', required: true },
    { name: 'subtotal', label: 'Subtotal (USD)', type: 'number', placeholder: 'e.g. 10.00', required: true },
    { name: 'totalAmount', label: 'Total Amount (USD)', type: 'number', placeholder: 'e.g. 11.50', required: true },
    { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
  ];

  return (
    <CrudTable
      title="Orders"
      subtitle="Manage concessions orders, totals and fulfillment status"
      items={orders}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['orderNumber', 'orderType', 'status']}
      columnContext={{ codes }}
      createLabel="Add Order"
      getId={(row) => row.id}
      getDisplayName={(row) => row.orderNumber}
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