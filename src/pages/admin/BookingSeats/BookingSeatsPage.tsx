import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useBookingSeatStore } from '@/store/bookingSeatStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useSeatStore } from '@/store/seatStore';
import { BookingSeat, BookingSeatInput } from '@/types/bookingSeat';
import { formatCurrency } from '@/utils/formatDate';

const STATUS_OPTIONS = [
  { value: 'RESERVED', label: 'RESERVED' },
  { value: 'CONFIRMED', label: 'CONFIRMED' },
  { value: 'CANCELLED', label: 'CANCELLED' },
];

const columns: CrudColumn<BookingSeat>[] = [
  {
    key: 'bookingId',
    header: 'Booking',
    render: (row, context) => {
      const codes = context?.codes as Record<number, string> | undefined;
      return codes?.[row.bookingId] ?? `#${row.bookingId}`;
    },
  },
  {
    key: 'seatId',
    header: 'Seat',
    render: (row, context) => {
      const seats = context?.seats as Record<number, string> | undefined;
      return seats?.[row.seatId] ?? `#${row.seatId}`;
    },
  },
  { key: 'price', header: 'Price', render: (row) => formatCurrency(row.price) },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'CONFIRMED' ? 'success' : row.status === 'CANCELLED' ? 'destructive' : 'warning'} size="sm">
        {row.status}
      </Badge>
    ),
  },
];

function toInput(values: Record<string, CrudValue>): BookingSeatInput {
  return {
    bookingId: Number(values.bookingId ?? 0),
    seatId: Number(values.seatId ?? 0),
    price: Number(values.price ?? 0),
    status: String(values.status ?? 'RESERVED'),
  };
}

export const BookingSeatsPage: React.FC = () => {
  const { bookingSeats, loading, fetchAll, create, update, remove } = useBookingSeatStore();
  const { bookings, fetchAll: fetchBookings } = useBookingAdminStore();
  const { seats, fetchAll: fetchSeats } = useSeatStore();

  useEffect(() => {
    void fetchAll();
    void fetchBookings();
    void fetchSeats();
  }, [fetchAll, fetchBookings, fetchSeats]);

  const bookingCodes: Record<number, string> = {};
  for (const b of bookings) bookingCodes[b.id] = b.bookingCode;
  const seatLabels: Record<number, string> = {};
  for (const s of seats) seatLabels[s.id] = `${s.seatNumber} (screen ${s.screenId})`;

  const fields: CrudField[] = [
    {
      name: 'bookingId',
      label: 'Booking',
      type: 'select',
      options: bookings.map((b) => ({ value: String(b.id), label: b.bookingCode })),
      required: true,
    },
    {
      name: 'seatId',
      label: 'Seat',
      type: 'select',
      options: seats.map((s) => ({ value: String(s.id), label: seatLabels[s.id] })),
      required: true,
    },
    { name: 'price', label: 'Price (USD)', type: 'number', placeholder: 'e.g. 8.00', required: true },
    { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
  ];

  return (
    <CrudTable
      title="Booking Seats"
      subtitle="Manage seats linked to each booking reservation"
      items={bookingSeats}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['status']}
      columnContext={{ codes: bookingCodes, seats: seatLabels }}
      createLabel="Add Booking Seat"
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