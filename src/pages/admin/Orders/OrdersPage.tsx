import React, { useEffect } from 'react';
import { CheckCircle2, Clock, DollarSign, ShoppingCart } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useOrderStore } from '@/store/orderStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { Order, OrderInput } from '@/types/order';
import { formatCurrency, formatDateTime } from '@/utils/formatDate';

const ORDER_TYPES = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'ONSITE', label: 'Onsite' },
];

const STATUS_OPTIONS = [
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const columns: CrudColumn<Order>[] = [
  {
    key: 'orderNumber',
    header: 'Order No',
    render: (row) => (
      <span className="font-mono font-bold text-foreground">{row.orderNumber}</span>
    ),
  },
  {
    key: 'customerId',
    header: 'Customer',
    render: (row) => <span className="text-muted-foreground text-xs">User #{row.customerId}</span>,
  },
  {
    key: 'bookingId',
    header: 'Booking',
    render: (row, context) => {
      const codes = context?.codes as Record<number, string> | undefined;
      return row.bookingId ? (
        <span className="font-mono text-xs font-semibold text-foreground">
          {codes?.[row.bookingId] ?? `#${row.bookingId}`}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    key: 'orderType',
    header: 'Type',
    render: (row) => (
      <Badge variant={row.orderType === 'ONLINE' ? 'outline' : 'secondary'} size="sm">
        {row.orderType}
      </Badge>
    ),
  },
  {
    key: 'orderedAt',
    header: 'Ordered At',
    render: (row) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDateTime(row.orderedAt)}
      </span>
    ),
  },
  {
    key: 'totalAmount',
    header: 'Total',
    render: (row) => <span className="font-bold text-foreground">{formatCurrency(row.totalAmount)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge
        variant={
          row.status === 'COMPLETED' || row.status === 'PAID'
            ? 'success'
            : row.status === 'CANCELLED'
            ? 'destructive'
            : 'warning'
        }
        size="sm"
      >
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

  const stats: CrudStat[] = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      tone: 'border-border bg-muted text-foreground',
    },
    {
      label: 'Fulfilled / Paid',
      value: orders.filter((o) => o.status === 'COMPLETED' || o.status === 'PAID').length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Pending',
      value: orders.filter((o) => o.status === 'PENDING').length,
      icon: Clock,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
    {
      label: 'Total Order Volume',
      value: formatCurrency(
        orders
          .filter((o) => o.status === 'COMPLETED' || o.status === 'PAID')
          .reduce((sum, o) => sum + o.totalAmount, 0),
      ),
      icon: DollarSign,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
    },
  ];

  const filters: CrudFilter<Order>[] = [
    {
      key: 'status',
      label: 'Filter by status',
      options: [{ value: 'ALL', label: 'All statuses' }, ...STATUS_OPTIONS],
      getValue: (order) => order.status,
    },
    {
      key: 'type',
      label: 'Filter by channel',
      options: [{ value: 'ALL', label: 'All channels' }, ...ORDER_TYPES],
      getValue: (order) => order.orderType,
    },
  ];

  const fields: CrudField[] = [
    { name: 'orderNumber', label: 'Order Number', placeholder: 'e.g. ORD-1001', required: true },
    { name: 'customerId', label: 'Customer ID', type: 'number', placeholder: 'User id of the customer', required: true },
    {
      name: 'bookingId',
      label: 'Booking',
      type: 'select',
      options: bookings.map((b) => ({ value: String(b.id), label: b.bookingCode })),
      required: true,
    },
    {
      name: 'orderType',
      label: 'Order Type',
      type: 'select',
      options: ORDER_TYPES.map((t) => ({ value: t.value, label: t.label })),
      required: true,
    },
    { name: 'orderedAt', label: 'Ordered At', type: 'datetime', required: true },
    { name: 'completedAt', label: 'Completed At', type: 'datetime', required: true },
    { name: 'subtotal', label: 'Subtotal (USD)', type: 'number', placeholder: 'e.g. 10.00', required: true },
    { name: 'totalAmount', label: 'Total Amount (USD)', type: 'number', placeholder: 'e.g. 11.50', required: true },
    { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
  ];

  return (
    <CrudTable
      title="Orders"
      subtitle="Manage concession purchases, payment fulfilment and order tracking"
      items={orders}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      filters={filters}
      searchPlaceholder="Search by order number, channel, customer ID, or status..."
      searchKeys={['orderNumber', 'orderType', 'status']}
      searchText={(o) => `${o.id} ${o.orderNumber} ${o.customerId} ${o.orderType} ${o.status} ${codes[o.bookingId] ?? ''}`}
      columnContext={{ codes }}
      createLabel="Add Order"
      createUrl="/admin/orders/create"
      pageSize={10}
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