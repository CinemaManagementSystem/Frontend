import React, { useEffect } from 'react';
import { Armchair, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useBookingSeatStore } from '@/store/bookingSeatStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useSeatStore } from '@/store/seatStore';
import { BookingSeat, BookingSeatInput } from '@/types/bookingSeat';
import { formatCurrency } from '@/utils/formatDate';

const STATUS_OPTIONS = [
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const columns: CrudColumn<BookingSeat>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => <span className="font-mono text-xs font-semibold text-foreground">#{row.id}</span>,
  },
  {
    key: 'bookingId',
    header: 'Booking',
    render: (row, context) => {
      const codes = context?.codes as Record<number, string> | undefined;
      return (
        <span className="font-mono text-xs font-semibold text-foreground">
          {codes?.[row.bookingId] ?? `#${row.bookingId}`}
        </span>
      );
    },
  },
  {
    key: 'seatId',
    header: 'Seat',
    render: (row, context) => {
      const seats = context?.seats as Record<number, string> | undefined;
      return (
        <span className="font-medium text-xs text-foreground">
          {seats?.[row.seatId] ?? `#${row.seatId}`}
        </span>
      );
    },
  },
  {
    key: 'price',
    header: 'Price',
    render: (row) => <span className="font-bold text-foreground">{formatCurrency(row.price)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge
        variant={row.status === 'CONFIRMED' ? 'success' : row.status === 'CANCELLED' ? 'destructive' : 'warning'}
        size="sm"
      >
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
  for (const s of seats) seatLabels[s.id] = `${s.seatNumber} (Screen #${s.screenId})`;

  const stats: CrudStat[] = [
    {
      label: 'Total Booking Seats',
      value: bookingSeats.length,
      icon: Armchair,
      tone: 'border-border bg-muted text-foreground',
    },
    {
      label: 'Confirmed',
      value: bookingSeats.filter((s) => s.status === 'CONFIRMED').length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Reserved (Pending)',
      value: bookingSeats.filter((s) => s.status === 'RESERVED').length,
      icon: Clock,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
    {
      label: 'Average Seat Price',
      value: bookingSeats.length
        ? formatCurrency(bookingSeats.reduce((sum, s) => sum + s.price, 0) / bookingSeats.length)
        : formatCurrency(0),
      icon: DollarSign,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
    },
  ];

  const filters: CrudFilter<BookingSeat>[] = [
    {
      key: 'status',
      label: 'Filter by status',
      options: [{ value: 'ALL', label: 'All statuses' }, ...STATUS_OPTIONS],
      getValue: (seat) => seat.status,
    },
  ];

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
      subtitle="Manage assigned auditorium seats linked to each cinema booking reservation"
      items={bookingSeats}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      filters={filters}
      searchPlaceholder="Search by booking code, seat label, or status..."
      searchKeys={['status']}
      searchText={(s) => `${s.id} ${s.status} ${bookingCodes[s.bookingId] ?? ''} ${seatLabels[s.seatId] ?? ''}`}
      columnContext={{ codes: bookingCodes, seats: seatLabels }}
      createLabel="Add Booking Seat"
      createUrl="/admin/booking-seats/create"
      pageSize={10}
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