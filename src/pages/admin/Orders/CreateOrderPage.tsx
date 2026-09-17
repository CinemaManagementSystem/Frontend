import React, { useCallback } from 'react';
import { CalendarDays, Info, Receipt, ShoppingCart } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useOrderStore } from '@/store/orderStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { OrderInput } from '@/types/order';

function normalizeDateTime(value: string): string {
  const v = String(value ?? '');
  return v.length === 16 ? `${v}:00` : v;
}

export const CreateOrderPage: React.FC = () => {
  const { create } = useOrderStore();
  const { bookings, fetchAll: fetchBookings } = useBookingAdminStore();

  const loadOptions = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: OrderInput = {
      orderNumber: String(values.orderNumber ?? '').trim(),
      orderType: String(values.orderType ?? 'ONLINE'),
      status: String(values.status ?? 'PENDING'),
      orderedAt: normalizeDateTime(String(values.orderedAt ?? '')),
      completedAt: normalizeDateTime(String(values.completedAt ?? '')),
      subtotal: Number(values.subtotal ?? 0),
      totalAmount: Number(values.totalAmount ?? 0),
      bookingId: Number(values.bookingId ?? 0),
      customerId: Number(values.customerId ?? 0),
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/orders"
      backLabel="orders"
      icon={ShoppingCart}
      title="Add New Order"
      subtitle="Enter details to record a new concessions order."
      submitLabel="Create Order"
      loadOptions={loadOptions}
      sections={[
        {
          title: 'Basic Information',
          description: 'Order identity, customer and linked booking.',
          icon: Info,
          fields: [
            {
              name: 'orderNumber',
              label: 'Order Number',
              type: 'text',
              placeholder: 'e.g. ORD-1001',
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
            {
              name: 'bookingId',
              label: 'Booking',
              type: 'select',
              options: bookings.map((booking) => ({
                value: String(booking.id),
                label: booking.bookingCode,
              })),
            },
          ],
        },
        {
          title: 'Order Timeline',
          description: 'When the order was placed and completed.',
          icon: CalendarDays,
          fields: [
            {
              name: 'orderedAt',
              label: 'Ordered At',
              type: 'datetime',
              required: true,
            },
            {
              name: 'completedAt',
              label: 'Completed At',
              type: 'datetime',
            },
          ],
        },
        {
          title: 'Pricing & Status',
          description: 'Totals and fulfillment status.',
          icon: Receipt,
          fields: [
            {
              name: 'orderType',
              label: 'Order Type',
              type: 'segment',
              required: true,
              options: [
                { value: 'ONLINE', label: 'Online' },
                { value: 'ONSITE', label: 'Onsite' },
              ],
            },
            {
              name: 'subtotal',
              label: 'Subtotal (USD)',
              type: 'number',
              placeholder: 'e.g. 10.00',
              min: 0,
              step: '0.01',
              required: true,
            },
            {
              name: 'totalAmount',
              label: 'Total Amount (USD)',
              type: 'number',
              placeholder: 'e.g. 11.50',
              min: 0,
              step: '0.01',
              required: true,
            },
            {
              name: 'status',
              label: 'Order Status',
              type: 'segment',
              required: true,
              options: [
                { value: 'PENDING', label: 'Pending' },
                { value: 'PAID', label: 'Paid' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ],
            },
          ],
        },
      ]}
      initialValues={{ status: 'PENDING', orderType: 'ONLINE' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateOrderPage;