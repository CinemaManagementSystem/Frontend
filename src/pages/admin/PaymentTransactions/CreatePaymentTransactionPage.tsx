import React, { useCallback } from 'react';
import { Hash, Link2, ReceiptText, Wallet } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { usePaymentTransactionStore } from '@/store/paymentTransactionStore';
import { usePaymentStore } from '@/store/paymentStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useOrderStore } from '@/store/orderStore';
import { PaymentTransactionInput } from '@/types/paymentTransaction';
import { formatCurrency } from '@/utils/formatDate';

export const CreatePaymentTransactionPage: React.FC = () => {
  const { create } = usePaymentTransactionStore();
  const { payments, fetchAll: fetchPayments } = usePaymentStore();
  const { bookings, fetchAll: fetchBookings } = useBookingAdminStore();
  const { orders, fetchAll: fetchOrders } = useOrderStore();

  const loadOptions = useCallback(async () => {
    await Promise.all([fetchPayments(), fetchBookings(), fetchOrders()]);
  }, [fetchBookings, fetchOrders, fetchPayments]);

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const bookingId = Number(values.bookingId ?? 0);
    const orderId = Number(values.orderId ?? 0);
    const payload: PaymentTransactionInput = {
      amount: Number(values.amount ?? 0),
      transactionType: String(values.transactionType ?? 'CASH') as PaymentTransactionInput['transactionType'],
      reference: String(values.reference ?? '').trim(),
      paymentId: Number(values.paymentId ?? 0),
      bookingId: bookingId > 0 ? bookingId : null,
      orderId: orderId > 0 ? orderId : null,
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/payment-transactions"
      backLabel="payment transactions"
      icon={ReceiptText}
      title="Add New Transaction"
      subtitle="Enter details to log a new payment transaction."
      submitLabel="Create Transaction"
      loadOptions={loadOptions}
      sections={[
        {
          title: 'Basic Information',
          description: 'Amount and payment reference.',
          icon: Hash,
          fields: [
            {
              name: 'amount',
              label: 'Amount (USD)',
              type: 'number',
              placeholder: 'e.g. 12.00',
              min: 0,
              step: '0.01',
              required: true,
            },
            {
              name: 'reference',
              label: 'Transaction Reference',
              type: 'text',
              placeholder: 'e.g. TXN-XXXX (optional)',
            },
          ],
        },
        {
          title: 'Method & Payment',
          description: 'Transaction channel and the linked payment record.',
          icon: Wallet,
          fields: [
            {
              name: 'transactionType',
              label: 'Payment Method',
              type: 'segment',
              required: true,
              options: [
                { value: 'CASH', label: 'Cash' },
                { value: 'KHQR', label: 'QR (KHQR)' },
              ],
            },
            {
              name: 'paymentId',
              label: 'Payment',
              type: 'select',
              required: true,
              options: payments.map((payment) => ({
                value: String(payment.id),
                label: `#${payment.id} ${payment.paymentMethod} ${formatCurrency(payment.amount)}`,
              })),
            },
          ],
        },
        {
          title: 'Relations',
          description: 'Optional booking or order association.',
          icon: Link2,
          fields: [
            {
              name: 'bookingId',
              label: 'Booking (optional)',
              type: 'select',
              options: bookings.map((booking) => ({
                value: String(booking.id),
                label: booking.bookingCode,
              })),
            },
            {
              name: 'orderId',
              label: 'Order (optional)',
              type: 'select',
              options: orders.map((order) => ({
                value: String(order.id),
                label: order.orderNumber,
              })),
            },
          ],
        },
      ]}
      initialValues={{ transactionType: 'CASH' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreatePaymentTransactionPage;