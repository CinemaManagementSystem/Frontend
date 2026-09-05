import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useShowStore } from '@/store/showStore';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { ApiBooking, ApiBookingInput } from '@/types/bookingApi';
import { formatCurrency, formatDateTime } from '@/utils/formatDate';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'PENDING' },
  { value: 'CONFIRMED', label: 'CONFIRMED' },
  { value: 'CANCELLED', label: 'CANCELLED' },
];

const columns: CrudColumn<ApiBooking>[] = [
  { key: 'bookingCode', header: 'Booking Ref', render: (row) => (
      <span className="font-mono font-bold text-foreground">{row.bookingCode}</span>
    ) },
  { key: 'customerId', header: 'Customer Id', render: (row) => `#${row.customerId}` },
  {
    key: 'showId',
    header: 'Show',
    render: (row, context) => {
      const looks = context?.lookups as Record<number, string> | undefined;
      return looks?.[row.showId] ?? `#${row.showId}`;
    },
  },
  {
    key: 'bookedAt',
    header: 'Booked At',
    render: (row) => formatDateTime(row.bookedAt),
  },
  { key: 'totalAmount', header: 'Total', render: (row) => formatCurrency(row.totalAmount) },
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

function normalizeDateTime(value: string): string {
  const v = String(value ?? '');
  return v.length === 16 ? `${v}:00` : v;
}

function toInput(values: Record<string, CrudValue>): ApiBookingInput {
  return {
    bookingCode: String(values.bookingCode ?? ''),
    customerId: Number(values.customerId ?? 0),
    showId: Number(values.showId ?? 0),
    bookedAt: normalizeDateTime(String(values.bookedAt ?? '')),
    totalAmount: Number(values.totalAmount ?? 0),
    status: String(values.status ?? 'PENDING'),
  };
}

export const BookingsPage: React.FC = () => {
  const { bookings, loading, fetchAll, create, update, remove } = useBookingAdminStore();
  const { shows, fetchAll: fetchShows } = useShowStore();
  const { movies, fetchAll: fetchMovies } = useMovieAdminStore();

  useEffect(() => {
    void fetchAll();
    void fetchShows();
    void fetchMovies();
  }, [fetchAll, fetchShows, fetchMovies]);

  const showLookups: Record<number, string> = {};
  for (const s of shows) {
    const movieTitle = movies.find((m) => m.id === s.movieId)?.title ?? `movie#${s.movieId}`;
    showLookups[s.id] = `#${s.id} · ${movieTitle}`;
  }

  const fields: CrudField[] = [
    { name: 'bookingCode', label: 'Booking Code', placeholder: 'e.g. BK-XXXXXX', required: true },
    { name: 'customerId', label: 'Customer ID', type: 'number', placeholder: 'User id of the customer', required: true },
    { name: 'showId', label: 'Show', type: 'select', options: shows.map((s) => ({ value: String(s.id), label: showLookups[s.id] })), required: true },
    { name: 'bookedAt', label: 'Booked At', type: 'datetime', required: true },
    { name: 'totalAmount', label: 'Total Amount (USD)', type: 'number', placeholder: 'e.g. 12.00', required: true },
    { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
  ];

  return (
    <CrudTable
      title="Bookings & Order Records"
      subtitle="Monitor ticket sales, reservations and cancellation status"
      items={bookings}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['bookingCode', 'status']}
      columnContext={{ lookups: showLookups }}
      createLabel="Add Booking"
      getId={(row) => row.id}
      getDisplayName={(row) => row.bookingCode}
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