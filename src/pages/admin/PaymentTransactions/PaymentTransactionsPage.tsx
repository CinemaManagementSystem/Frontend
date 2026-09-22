import React, { useEffect } from 'react';
import { CheckCircle2, Clock, DollarSign, ReceiptText, RefreshCw } from 'lucide-react';
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
import { usePaymentTransactionStore } from '@/store/paymentTransactionStore';
import { usePaymentStore } from '@/store/paymentStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useOrderStore } from '@/store/orderStore';
import { PaymentTransaction, PaymentTransactionInput } from '@/types/paymentTransaction';
import { formatCurrency, formatDateTime } from '@/utils/formatDate';

const TRANSACTION_TYPES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'KHQR', label: 'KHQR' },
];

const STATUS_OPTIONS = [
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'EXPIRED', label: 'Expired' },
];

const columns: CrudColumn<PaymentTransaction>[] = [
  {
    key: 'id',
    header: 'Txn ID',
    render: (row) => <span className="font-mono text-xs font-semibold text-foreground">#{row.id}</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (row) => <span className="font-bold text-foreground">{formatCurrency(row.amount)}</span>,
  },
  {
    key: 'transactionType',
    header: 'Method',
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
    key: 'paymentId',
    header: 'Payment',
    render: (row, context) => {
      const ids = context?.paymentIds as Record<number, string> | undefined;
      return (
        <span className="font-medium text-xs text-foreground">
          {ids?.[row.paymentId] ?? `Payment #${row.paymentId}`}
        </span>
      );
    },
  },
  {
    key: 'customerId',
    header: 'Customer',
    render: (row, context) => {
      const customerMap = context?.customers as Record<number, number> | undefined;
      const customerId = customerMap?.[row.id];
      return customerId ? (
        <span className="text-muted-foreground text-xs">User #{customerId}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    key: 'bookingId',
    header: 'Booking',
    render: (row, context) => {
      const codes = context?.bookingCodes as Record<number, string> | undefined;
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
      const nos = context?.orderNos as Record<number, string> | undefined;
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
    key: 'reference',
    header: 'Reference',
    render: (row) =>
      row.reference ? (
        <span className="font-mono text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded" title={row.reference}>
          {row.reference}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: 'createdAt',
    header: 'Date',
    render: (row) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDateTime(row.createdAt)}
      </span>
    ),
  },
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
  const {
    transactions,
    loading,
    fetchAll,
    create,
    update,
    remove,
  } = usePaymentTransactionStore();
  const { payments, fetchAll: fetchPayments, checkStatus, confirm } = usePaymentStore();
  const { bookings, fetchAll: fetchBookings } = useBookingAdminStore();
  const { orders, fetchAll: fetchOrders } = useOrderStore();

  useEffect(() => {
    void fetchAll();
    void fetchPayments();
    void fetchBookings();
    void fetchOrders();
  }, [fetchAll, fetchPayments, fetchBookings, fetchOrders]);

  const paymentIds: Record<number, string> = {};
  for (const p of payments) paymentIds[p.id] = `#${p.id} (${p.paymentMethod}) ${formatCurrency(p.amount)}`;
  const bookingCodes: Record<number, string> = {};
  const bookingCustomer: Record<number, number> = {};
  for (const b of bookings) {
    bookingCodes[b.id] = b.bookingCode;
    bookingCustomer[b.id] = b.customerId;
  }
  const orderNos: Record<number, string> = {};
  const orderCustomer: Record<number, number> = {};
  for (const o of orders) {
    orderNos[o.id] = o.orderNumber;
    orderCustomer[o.id] = o.customerId;
  }

  // Resolve customer ID per transaction
  const customers: Record<number, number> = {};
  for (const t of transactions) {
    if (t.bookingId && bookingCustomer[t.bookingId]) {
      customers[t.id] = bookingCustomer[t.bookingId];
    } else if (t.orderId && orderCustomer[t.orderId]) {
      customers[t.id] = orderCustomer[t.orderId];
    } else if (t.paymentId) {
      const p = payments.find((item) => item.id === t.paymentId);
      if (p?.customerId) customers[t.id] = p.customerId;
    }
  }

  const stats: CrudStat[] = [
    {
      label: 'Total Transactions',
      value: transactions.length,
      icon: ReceiptText,
      tone: 'border-border bg-muted text-foreground',
    },
    {
      label: 'Settled (Paid)',
      value: transactions.filter((t) => t.status === 'PAID').length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Pending Confirmation',
      value: transactions.filter((t) => t.status === 'PENDING').length,
      icon: Clock,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
    {
      label: 'Total Transacted',
      value: formatCurrency(
        transactions
          .filter((t) => t.status === 'PAID')
          .reduce((sum, t) => sum + t.amount, 0),
      ),
      icon: DollarSign,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
    },
  ];

  const filters: CrudFilter<PaymentTransaction>[] = [
    {
      key: 'status',
      label: 'Filter by status',
      options: [{ value: 'ALL', label: 'All statuses' }, ...STATUS_OPTIONS],
      getValue: (t) => t.status,
    },
    {
      key: 'type',
      label: 'Filter by method',
      options: [{ value: 'ALL', label: 'All methods' }, ...TRANSACTION_TYPES],
      getValue: (t) => t.transactionType,
    },
  ];

  const fields: CrudField[] = [
    { name: 'amount', label: 'Amount (USD)', type: 'number', placeholder: 'e.g. 12.00', required: true },
    {
      name: 'transactionType',
      label: 'Payment Method',
      type: 'select',
      options: TRANSACTION_TYPES.map((t) => ({ value: t.value, label: t.label })),
      required: true,
    },
    { name: 'reference', label: 'Reference', placeholder: 'e.g. TXN-XXXX (optional)' },
    {
      name: 'paymentId',
      label: 'Linked Payment',
      type: 'select',
      options: payments.map((p) => ({
        value: String(p.id),
        label: `#${p.id} ${p.paymentMethod} ${formatCurrency(p.amount)}`,
      })),
      required: true,
    },
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

  const extraActions: CrudRowAction<PaymentTransaction>[] = [
    {
      title: 'Check Status',
      icon: <RefreshCw className="w-4 h-4" />,
      onClick: async (row) => {
        if (row.paymentId) {
          await checkStatus(row.paymentId);
          await fetchAll();
        }
      },
    },
    {
      title: 'Confirm Payment',
      icon: <CheckCircle2 className="w-4 h-4" />,
      disabled: (row) => row.status !== 'PENDING',
      onClick: async (row) => {
        if (!window.confirm(`Confirm payment for transaction #${row.id}?`)) return;
        if (row.paymentId) {
          await confirm(row.paymentId);
          await fetchAll();
        }
      },
    },
  ];

  return (
    <CrudTable
      title="Payment Transactions"
      subtitle="Manage payment transaction logs, confirm fulfilment and track settlement status"
      items={transactions}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      filters={filters}
      searchPlaceholder="Search by reference, method, status, booking, or customer..."
      searchKeys={['reference', 'transactionType', 'status']}
      searchText={(t) =>
        `${t.id} ${t.reference ?? ''} ${t.transactionType} ${t.status} ${t.paymentId} ${customers[t.id] ?? ''} ${bookingCodes[t.bookingId ?? 0] ?? ''} ${orderNos[t.orderId ?? 0] ?? ''}`
      }
      columnContext={{ paymentIds, bookingCodes, orderNos, customers }}
      extraActions={extraActions}
      createLabel="Add Transaction"
      createUrl="/admin/payment-transactions/create"
      pageSize={10}
      getId={(row) => row.id}
      getDisplayName={(row) => `Transaction #${row.id}`}
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
