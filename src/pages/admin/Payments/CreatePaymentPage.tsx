import React, { useCallback } from 'react';
import { CreditCard, Info, Link2, Wallet } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { usePaymentStore } from '@/store/paymentStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useOrderStore } from '@/store/orderStore';
import { PaymentInput } from '@/types/payment';

export const CreatePaymentPage: React.FC = () => {
  const { create } = usePaymentStore();
  const { bookings, fetchAll: fetchBookings } = useBookingAdminStore();
  const { orders, fetchAll: fetchOrders } = useOrderStore();

  const loadOptions = useCallback(async () => {
    await Promise.all([fetchBookings(), fetchOrders()]);
  }, [fetchBookings, fetchOrders]);

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const bookingId = Number(values.bookingId ?? 0);
    const orderId = Number(values.orderId ?? 0);
    const payload: PaymentInput = {
      amount: Number(values.amount ?? 0),
      paymentMethod: String(values.paymentMethod ?? 'CASH') as PaymentInput['paymentMethod'],
      customerId: Number(values.customerId ?? 0),
      bookingId: bookingId > 0 ? bookingId : null,
      orderId: orderId > 0 ? orderId : null,
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/payments"
      backLabel="payments"
      icon={CreditCard}
      title="Add New Payment"
      subtitle="Enter details to record a new payment against a booking or order."
      submitLabel="Create Payment"
      loadOptions={loadOptions}
      sections={[
        {
          title: 'Basic Information',
          description: 'Amount and paying customer.',
          icon: Info,
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
              name: 'customerId',
              label: 'Customer ID',
              type: 'number',
              placeholder: 'User id of the customer',
              min: 1,
              required: true,
            },
          ],
        },
        {
          title: 'Payment Method',
          description: 'How the customer is paying.',
          icon: Wallet,
          fields: [
            {
              name: 'paymentMethod',
              label: 'Method',
              type: 'segment',
              required: true,
              options: [
                { value: 'CASH', label: 'Cash' },
                { value: 'KHQR', label: 'QR (KHQR)' },
              ],
            },
          ],
        },
        {
          title: 'Relations',
          description: 'Link the payment to a booking, an order, or both.',
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
      initialValues={{ paymentMethod: 'CASH' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreatePaymentPage;