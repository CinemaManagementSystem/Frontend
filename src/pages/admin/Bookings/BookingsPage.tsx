import React, { useEffect } from 'react';
import { CheckCircle2, Clock, DollarSign, Ticket } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useShowStore } from '@/store/showStore';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { ApiBooking, ApiBookingInput } from '@/types/bookingApi';
import { formatCurrency, formatDateTime } from '@/utils/formatDate';

const STATUS_OPTIONS = [
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const columns: CrudColumn<ApiBooking>[] = [
  {
    key: 'bookingCode',
    header: 'Booking Ref',
    render: (row) => (
      <span className="font-mono font-bold text-foreground">{row.bookingCode}</span>
    ),
  },
  {
    key: 'customerId',
    header: 'Customer',
    render: (row) => <span className="text-muted-foreground text-xs">User #{row.customerId}</span>,
  },
  {
    key: 'showId',
    header: 'Show',
    render: (row, context) => {
      const looks = context?.lookups as Record<number, string> | undefined;
      return (
        <span className="text-xs text-foreground font-medium">
          {looks?.[row.showId] ?? `#${row.showId}`}
        </span>
      );
    },
  },
  {
    key: 'bookedAt',
    header: 'Booked At',
    render: (row) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDateTime(row.bookedAt)}
      </span>
    ),
  },
  {
    key: 'totalAmount',
    header: 'Total',
    render: (row) => <span className="font-bold text-foreground">{formatCurrency(row.totalAmount)}</span>,
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

  const stats: CrudStat[] = [
    {
      label: 'Total Bookings',
      value: bookings.length,
      icon: Ticket,
      tone: 'border-border bg-muted text-foreground',
    },
    {
      label: 'Confirmed',
      value: bookings.filter((b) => b.status === 'CONFIRMED').length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Pending',
      value: bookings.filter((b) => b.status === 'PENDING').length,
      icon: Clock,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
    {
      label: 'Total Sales Volume',
      value: formatCurrency(
        bookings
          .filter((b) => b.status === 'CONFIRMED')
          .reduce((sum, b) => sum + b.totalAmount, 0),
      ),
      icon: DollarSign,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
    },
  ];

  const filters: CrudFilter<ApiBooking>[] = [
    {
      key: 'status',
      label: 'Filter by status',
      options: [{ value: 'ALL', label: 'All statuses' }, ...STATUS_OPTIONS],
      getValue: (booking) => booking.status,
    },
  ];

  const fields: CrudField[] = [
    { name: 'bookingCode', label: 'Booking Code', placeholder: 'e.g. BK-XXXXXX', required: true },
    { name: 'customerId', label: 'Customer ID', type: 'number', placeholder: 'User id of the customer', required: true },
    {
      name: 'showId',
      label: 'Show',
      type: 'select',
      options: shows.map((s) => ({ value: String(s.id), label: showLookups[s.id] })),
      required: true,
    },
    { name: 'bookedAt', label: 'Booked At', type: 'datetime', required: true },
    { name: 'totalAmount', label: 'Total Amount (USD)', type: 'number', placeholder: 'e.g. 12.00', required: true },
    { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
  ];

  return (
    <CrudTable
      title="Bookings"
      subtitle="Monitor ticket reservations, confirm sales and manage booking records"
      items={bookings}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      filters={filters}
      searchPlaceholder="Search by booking code, customer ID, show, or status..."
      searchKeys={['bookingCode', 'status']}
      searchText={(b) => `${b.id} ${b.bookingCode} ${b.customerId} ${b.status} ${showLookups[b.showId] ?? ''}`}
      columnContext={{ lookups: showLookups }}
      createLabel="Add Booking"
      createUrl="/admin/bookings/create"
      pageSize={10}
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