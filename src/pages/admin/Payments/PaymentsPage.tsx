import React, { useEffect } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { CrudTable, CrudColumn, CrudField, CrudRowAction, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { usePaymentStore } from '@/store/paymentStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useOrderStore } from '@/store/orderStore';
import { Payment, PaymentInput } from '@/types/payment';
import { formatCurrency, formatDateTime } from '@/utils/formatDate';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'CASH' },
  { value: 'KHQR', label: 'KHQR' },
];

const columns: CrudColumn<Payment>[] = [
  { key: 'amount', header: 'Amount', render: (row) => (
      <span className="font-bold text-white">{formatCurrency(row.amount)}</span>
    ) },
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
        variant={row.status === 'SUCCESS' ? 'success' : row.status === 'FAILED' ? 'destructive' : 'warning'}
        size="sm"
      >
        {row.status}
      </Badge>
    ),
  },
  {
    key: 'bookingId',
    header: 'Booking',
    render: (row, context) => {
      const codes = context?.codes as Record<number, string> | undefined;
      return row.bookingId ? (codes?.[row.bookingId] ?? `#${row.bookingId}`) : '—';
    },
  },
  {
    key: 'orderId',
    header: 'Order',
    render: (row, context) => {
      const nos = context?.nos as Record<number, string> | undefined;
      return row.orderId ? (nos?.[row.orderId] ?? `#${row.orderId}`) : '—';
    },
  },
  {
    key: 'transactionId',
    header: 'Transaction',
    render: (row) =>
      row.transactionId ? (
        <span className="font-mono text-[11px] text-gray-300" title={row.transactionId}>
          {row.transactionId}
        </span>
      ) : (
        <span className="text-gray-500">—</span>
      ),
  },
  {
    key: 'paidAt',
    header: 'Paid At',
    render: (row) => (row.paidAt ? formatDateTime(row.paidAt) : <span className="text-gray-500">—</span>),
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

  const fields: CrudField[] = [
    { name: 'amount', label: 'Amount (USD)', type: 'number', placeholder: 'e.g. 12.00', required: true },
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: PAYMENT_METHODS, required: true },
    { name: 'customerId', label: 'Customer ID', type: 'number', placeholder: 'User id of the customer', required: true },
    { name: 'bookingId', label: 'Booking (optional)', type: 'select', options: bookings.map((b) => ({ value: String(b.id), label: b.bookingCode })) },
    { name: 'orderId', label: 'Order (optional)', type: 'select', options: orders.map((o) => ({ value: String(o.id), label: o.orderNumber })) },
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
      subtitle="Manage payments, confirm fulfilment and track transaction status"
      items={payments}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['paymentMethod', 'status', 'transactionId']}
      columnContext={{ codes, nos }}
      extraActions={extraActions}
      createLabel="Add Payment"
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