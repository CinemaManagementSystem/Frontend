import React, { useCallback, useRef } from 'react';
import { DollarSign, Link2, Ticket } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useBookingSeatStore } from '@/store/bookingSeatStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useSeatStore } from '@/store/seatStore';
import { BookingSeatInput } from '@/types/bookingSeat';

export const CreateBookingSeatPage: React.FC = () => {
  const { create } = useBookingSeatStore();
  const { bookings, fetchAll: fetchBookings } = useBookingAdminStore();
  const { seats, fetchAll: fetchSeats } = useSeatStore();

  const priceTouched = useRef(false);

  const loadOptions = useCallback(async () => {
    await Promise.all([fetchBookings(), fetchSeats()]);
  }, [fetchBookings, fetchSeats]);

  const handleValuesChange = useCallback(
    (values: Record<string, CreateFieldValue>, changedName: string) => {
      if (changedName === 'price') {
        priceTouched.current = true;
        return undefined;
      }
      if (changedName !== 'seats') return undefined;
      const selected = Array.isArray(values.seats) ? (values.seats as string[]) : [];
      if (priceTouched.current || selected.length === 0) return undefined;
      const firstSeat = seats.find((seat) => String(seat.id) === selected[0]);
      if (firstSeat) return { price: String(firstSeat.price) };
      return undefined;
    },
    [seats],
  );

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const selectedSeats = Array.isArray(values.seats) ? (values.seats as string[]) : [];
    const bookingId = Number(values.bookingId ?? 0);
    const price = Number(values.price ?? 0);
    const status = String(values.status ?? 'RESERVED');

    for (const seatId of selectedSeats) {
      const payload: BookingSeatInput = {
        bookingId,
        seatId: Number(seatId),
        price,
        status,
      };
      await create(payload);
    }
  };

  return (
    <CreateEntityPage
      backUrl="/admin/booking-seats"
      backLabel="booking seats"
      icon={Ticket}
      title="Add Booking Seats"
      subtitle="Allocate one or more seats to a booking reservation."
      submitLabel="Save Booking Seats"
      loadOptions={loadOptions}
      onValuesChange={handleValuesChange}
      sections={[
        {
          title: 'Allocation',
          description: 'Choose the booking and the seats to allocate.',
          icon: Link2,
          fields: [
            {
              name: 'bookingId',
              label: 'Booking',
              type: 'select',
              required: true,
              options: bookings.map((booking) => ({
                value: String(booking.id),
                label: booking.bookingCode,
              })),
            },
            {
              name: 'seats',
              label: 'Seat Allocation Picker',
              type: 'multiselect',
              required: true,
              spanFull: true,
              options: seats.map((seat) => ({
                value: String(seat.id),
                label: `${seat.seatNumber} (Row ${seat.rowName} · $${Number(seat.price).toFixed(2)})`,
              })),
              helper: 'Select every seat that belongs to this booking.',
            },
          ],
        },
        {
          title: 'Pricing & Status',
          description: 'Per-seat price and reservation state.',
          icon: DollarSign,
          fields: [
            {
              name: 'price',
              label: 'Price (USD)',
              type: 'number',
              placeholder: 'e.g. 8.00',
              min: 0,
              step: '0.01',
              required: true,
              helper: 'Auto-filled from the first selected seat — adjust if needed.',
            },
            {
              name: 'status',
              label: 'Seat Status',
              type: 'segment',
              required: true,
              options: [
                { value: 'RESERVED', label: 'Reserved' },
                { value: 'CONFIRMED', label: 'Confirmed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ],
            },
          ],
        },
      ]}
      initialValues={{ status: 'RESERVED' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateBookingSeatPage;