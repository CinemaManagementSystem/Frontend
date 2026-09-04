import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { usePaymentTransactionStore } from '@/store/paymentTransactionStore';
import { usePaymentStore } from '@/store/paymentStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useOrderStore } from '@/store/orderStore';
import { PaymentTransaction, PaymentTransactionInput } from '@/types/paymentTransaction';
import { formatCurrency, formatDateTime } from '@/utils/formatDate';

const columns: CrudColumn<PaymentTransaction>[] = [
  { key: 'amount', header: 'Amount', render: (row) => (
      <span className="font-bold text-white">{formatCurrency(row.amount)}</span>
    ) },
  {
    key: 'transactionType',
    header: 'Type',
    render: (row) => (
      <Badge variant={row.transactionType === 'KHQR' ? 'outline' : 'secondary'} size="sm">
        {row.transactionType}
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
    key: 'paymentId',
    header: 'Payment',
    render: (row, context) => {
      const ids = context?.paymentIds as Record<number, string> | undefined;
      return ids?.[row.paymentId] ?? `#${row.paymentId}`;
    },
  },
  {
    key: 'reference',
    header: 'Reference',
    render: (row) =>
      row.reference ? (
        <span className="font-mono text-[11px] text-muted-foreground">{row.reference}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: 'createdAt',
    header: 'Created At',
    render: (row) => formatDateTime(row.createdAt),
  },
];

const TRANSACTION_TYPES = [
  { value: 'CASH', label: 'CASH' },
  { value: 'KHQR', label: 'KHQR' },
];

function toInput(values: Record<string, CrudValue>): PaymentTransactionInput {
  const bookingRaw = Number(values.bookingId ?? 0);
  const orderRaw = Number(values.orderId ?? 0);
  return {
    amount: Number(values.amount ?? 0),
    transactionType: String(values.transactionType ?? 'CASH') as 'CASH' | 'KHQR',
    reference: String(values.reference ?? ''),
    paymentId: Number(values.paymentId ?? 0),
    bookingId: bookingRaw > 0 ? bookingRaw : null,
    orderId: orderRaw > 0 ? orderRaw : null,
  };
}

export const PaymentTransactionsPage: React.FC = () => {
  const { transactions, loading, fetchAll, create, update, remove } = usePaymentTransactionStore();
  const { payments, fetchAll: fetchPayments } = usePaymentStore();
  const { bookings, fetchAll: fetchBookings } = useBookingAdminStore();
  const { orders, fetchAll: fetchOrders } = useOrderStore();

  useEffect(() => {
    void fetchAll();
    void fetchPayments();
    void fetchBookings();
    void fetchOrders();
  }, [fetchAll, fetchPayments, fetchBookings, fetchOrders]);

  const paymentIds: Record<number, string> = {};
  for (const p of payments) paymentIds[p.id] = `#${p.id} ${p.paymentMethod} ${formatCurrency(p.amount)}`;

  const fields: CrudField[] = [
    { name: 'amount', label: 'Amount (USD)', type: 'number', placeholder: 'e.g. 12.00', required: true },
    { name: 'transactionType', label: 'Transaction Type', type: 'select', options: TRANSACTION_TYPES, required: true },
    { name: 'reference', label: 'Reference', placeholder: 'e.g. TXN-XXXX (optional)' },
    { name: 'paymentId', label: 'Payment', type: 'select', options: payments.map((p) => ({ value: String(p.id), label: `#${p.id} ${p.paymentMethod} ${formatCurrency(p.amount)}` })), required: true },
    { name: 'bookingId', label: 'Booking (optional)', type: 'select', options: bookings.map((b) => ({ value: String(b.id), label: b.bookingCode })) },
    { name: 'orderId', label: 'Order (optional)', type: 'select', options: orders.map((o) => ({ value: String(o.id), label: o.orderNumber })) },
  ];

  return (
    <CrudTable
      title="Payment Transactions"
      subtitle="Manage payment transaction logs, references and filtering"
      items={transactions}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['reference', 'transactionType', 'status']}
      columnContext={{ paymentIds }}
      createLabel="Add Transaction"
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