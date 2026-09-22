import React, { useEffect } from 'react';
import { CheckCircle2, Clock, CreditCard, DollarSign, RefreshCw } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudRowAction,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { usePaymentStore } from '@/store/paymentStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useOrderStore } from '@/store/orderStore';
import { Payment, PaymentInput } from '@/types/payment';
import { formatCurrency, formatDateTime } from '@/utils/formatDate';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'KHQR', label: 'KHQR' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'EXPIRED', label: 'Expired' },
];

const columns: CrudColumn<Payment>[] = [
  {
    key: 'id',
    header: 'Payment ID',
    render: (row) => <span className="font-mono text-xs font-semibold text-foreground">#{row.id}</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (row) => <span className="font-bold text-foreground">{formatCurrency(row.amount)}</span>,
  },
  {
    key: 'paymentMethod',
    header: 'Method',
    render: (row) => (
      <Badge variant={row.paymentMethod === 'KHQR' ? 'outline' : 'secondary'} size="sm">
        {row.paymentMethod}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge
        variant={
          row.status === 'PAID'
            ? 'success'
            : row.status === 'PENDING'
            ? 'warning'
            : row.status === 'FAILED'
            ? 'destructive'
            : 'secondary'
        }
        size="sm"
      >
        {row.status}
      </Badge>
    ),
  },
  {
    key: 'customerId',
    header: 'Customer',
    render: (row) => <span className="text-muted-foreground">User #{row.customerId}</span>,
  },
  {
    key: 'bookingId',
    header: 'Booking',
    render: (row, context) => {
      const codes = context?.codes as Record<number, string> | undefined;
      return row.bookingId ? (
        <span className="font-mono text-xs font-medium text-foreground">
          {codes?.[row.bookingId] ?? `#${row.bookingId}`}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    key: 'orderId',
    header: 'Order',
    render: (row, context) => {
      const nos = context?.nos as Record<number, string> | undefined;
      return row.orderId ? (
        <span className="font-mono text-xs font-medium text-foreground">
          {nos?.[row.orderId] ?? `#${row.orderId}`}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    key: 'transactionId',
    header: 'Transaction ID',
    render: (row) =>
      row.transactionId ? (
        <span className="font-mono text-[11px] text-muted-foreground" title={row.transactionId}>
          {row.transactionId}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: 'paidAt',
    header: 'Paid At',
    render: (row) =>
      row.paidAt ? (
        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(row.paidAt)}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];

function toInput(values: Record<string, CrudValue>): PaymentInput {
  const bookingRaw = Number(values.bookingId ?? 0);
  const orderRaw = Number(values.orderId ?? 0);
  return {
    amount: Number(values.amount ?? 0),
    paymentMethod: String(values.paymentMethod ?? 'CASH') as 'CASH' | 'KHQR',
    customerId: Number(values.customerId ?? 0),
    bookingId: bookingRaw > 0 ? bookingRaw : null,
    orderId: orderRaw > 0 ? orderRaw : null,
  };
}

export const PaymentsPage: React.FC = () => {
  const { payments, loading, fetchAll, create, update, confirm, checkStatus, remove } = usePaymentStore();
  const { bookings, fetchAll: fetchBookings } = useBookingAdminStore();
  const { orders, fetchAll: fetchOrders } = useOrderStore();

  useEffect(() => {
    void fetchAll();
    void fetchBookings();
    void fetchOrders();
  }, [fetchAll, fetchBookings, fetchOrders]);

  const codes: Record<number, string> = {};
  for (const b of bookings) codes[b.id] = b.bookingCode;
  const nos: Record<number, string> = {};
  for (const o of orders) nos[o.id] = o.orderNumber;

  const stats: CrudStat[] = [
    {
      label: 'Total Payments',
      value: payments.length,
      icon: CreditCard,
      tone: 'border-border bg-muted text-foreground',
    },
    {
      label: 'Completed (Paid)',
      value: payments.filter((p) => p.status === 'PAID').length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Pending Confirmation',
      value: payments.filter((p) => p.status === 'PENDING').length,
      icon: Clock,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
    {
      label: 'Collected Revenue',
      value: formatCurrency(
        payments
          .filter((p) => p.status === 'PAID')
          .reduce((sum, p) => sum + p.amount, 0),
      ),
      icon: DollarSign,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
    },
  ];

  const filters: CrudFilter<Payment>[] = [
    {
      key: 'status',
      label: 'Filter by status',
      options: [{ value: 'ALL', label: 'All statuses' }, ...PAYMENT_STATUS_OPTIONS],
      getValue: (payment) => payment.status,
    },
    {
      key: 'method',
      label: 'Filter by method',
      options: [{ value: 'ALL', label: 'All methods' }, ...PAYMENT_METHODS],
      getValue: (payment) => payment.paymentMethod,
    },
  ];

  const fields: CrudField[] = [
    { name: 'amount', label: 'Amount (USD)', type: 'number', placeholder: 'e.g. 12.00', required: true },
    {
      name: 'paymentMethod',
      label: 'Payment Method',
      type: 'select',
      options: PAYMENT_METHODS.map((m) => ({ value: m.value, label: m.label })),
      required: true,
    },
    { name: 'customerId', label: 'Customer ID', type: 'number', placeholder: 'User id of the customer', required: true },
    {
      name: 'bookingId',
      label: 'Booking (optional)',
      type: 'select',
      options: bookings.map((b) => ({ value: String(b.id), label: b.bookingCode })),
    },
    {
      name: 'orderId',
      label: 'Order (optional)',
      type: 'select',
      options: orders.map((o) => ({ value: String(o.id), label: o.orderNumber })),
    },
  ];

  const extraActions: CrudRowAction<Payment>[] = [
    {
      title: 'Check Status',
      icon: <RefreshCw className="w-4 h-4" />,
      onClick: async (row) => {
        await checkStatus(row.id);
      },
    },
    {
      title: 'Confirm Payment',
      icon: <CheckCircle2 className="w-4 h-4" />,
      disabled: (row) => row.status !== 'PENDING',
      onClick: async (row) => {
        if (!window.confirm(`Confirm payment #${row.id}?`)) return;
        await confirm(row.id);
      },
    },
  ];

  return (
    <CrudTable
      title="Payments"
      subtitle="Manage payments, confirm fulfilment and track live transaction status"
      items={payments}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      filters={filters}
      searchPlaceholder="Search by transaction ID, method, status, booking, or customer..."
      searchKeys={['paymentMethod', 'status', 'transactionId']}
      searchText={(p) =>
        `${p.id} ${p.transactionId ?? ''} ${p.paymentMethod} ${p.status} ${p.customerId} ${codes[p.bookingId ?? 0] ?? ''} ${nos[p.orderId ?? 0] ?? ''}`
      }
      columnContext={{ codes, nos }}
      extraActions={extraActions}
      createLabel="Add Payment"
      createUrl="/admin/payments/create"
      pageSize={10}
      getId={(row) => row.id}
      getDisplayName={(row) => `Payment #${row.id}`}
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