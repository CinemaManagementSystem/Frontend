import React, { useEffect } from 'react';
import { CalendarDays, CheckCircle2, CircleAlert, Clapperboard } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useShowStore } from '@/store/showStore';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { useScreenStore } from '@/store/screenStore';
import { Show, ShowInput } from '@/types/show';
import { formatCurrency, formatDateTime } from '@/utils/formatDate';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SOLD_OUT', label: 'Sold Out' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
];

const columns: CrudColumn<Show>[] = [
  {
    key: 'movieId',
    header: 'Movie',
    render: (row, context) => {
      const movies = context?.movies as Record<number, string> | undefined;
      return movies?.[row.movieId] ?? `#${row.movieId}`;
    },
  },
  {
    key: 'screenId',
    header: 'Screen',
    render: (row, context) => {
      const screens = context?.screens as Record<number, string> | undefined;
      return screens?.[row.screenId] ?? `#${row.screenId}`;
    },
  },
  {
    key: 'startTime',
    header: 'Start',
    render: (row) => formatDateTime(row.startTime),
  },
  {
    key: 'endTime',
    header: 'End',
    render: (row) => formatDateTime(row.endTime),
  },
  { key: 'ticketPrice', header: 'Ticket Price', render: (row) => formatCurrency(row.ticketPrice) },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'ACTIVE' ? 'success' : row.status === 'CANCELLED' ? 'destructive' : 'warning'} size="sm">
        {row.status.replace('_', ' ')}
      </Badge>
    ),
  },
];

function normalizeDateTime(value: string): string {
  const v = String(value ?? '');
  return v.length === 16 ? `${v}:00` : v;
}

function toInput(values: Record<string, CrudValue>): ShowInput {
  return {
    movieId: Number(values.movieId ?? 0),
    screenId: Number(values.screenId ?? 0),
    startTime: normalizeDateTime(String(values.startTime ?? '')),
    endTime: normalizeDateTime(String(values.endTime ?? '')),
    ticketPrice: Number(values.ticketPrice ?? 0),
    status: String(values.status ?? 'ACTIVE'),
  };
}

export const ShowsPage: React.FC = () => {
  const { shows, loading, fetchAll, create, update, remove } = useShowStore();
  const { movies, fetchAll: fetchMovies } = useMovieAdminStore();
  const { screens, fetchAll: fetchScreens } = useScreenStore();

  const stats: CrudStat[] = [
    { label: 'Total Shows', value: shows.length, icon: CalendarDays, tone: 'border-border bg-muted text-foreground' },
    {
      label: 'Active',
      value: shows.filter((show) => show.status === 'ACTIVE').length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Sold Out',
      value: shows.filter((show) => show.status === 'SOLD_OUT').length,
      icon: Clapperboard,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
    {
      label: 'Cancelled',
      value: shows.filter((show) => show.status === 'CANCELLED').length,
      icon: CircleAlert,
      tone: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
    },
  ];

  const filters: CrudFilter<Show>[] = [
    {
      key: 'status',
      label: 'Filter by status',
      options: [{ value: 'ALL', label: 'All statuses' }, ...STATUS_OPTIONS],
      getValue: (show) => show.status,
    },
  ];

  useEffect(() => {
    void fetchAll();
    void fetchMovies();
    void fetchScreens();
  }, [fetchAll, fetchMovies, fetchScreens]);

  const movieNames: Record<number, string> = {};
  for (const m of movies) movieNames[m.id] = m.title;
  const screenNames: Record<number, string> = {};
  for (const s of screens) screenNames[s.id] = s.name;

  const fields: CrudField[] = [
    {
      name: 'movieId',
      label: 'Movie',
      type: 'select',
      options: movies.map((m) => ({ value: String(m.id), label: m.title })),
      required: true,
    },
    {
      name: 'screenId',
      label: 'Screen',
      type: 'select',
      options: screens.map((s) => ({ value: String(s.id), label: s.name })),
      required: true,
    },
    { name: 'startTime', label: 'Start Time', type: 'datetime', required: true },
    { name: 'endTime', label: 'End Time', type: 'datetime', required: true },
    {
      name: 'ticketPrice',
      label: 'Ticket Price (USD)',
      type: 'number',
      placeholder: 'e.g. 8.00',
      required: true,
    },
    { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
  ];

  return (
    <CrudTable
      title="Shows"
      subtitle="Manage screening schedules, pricing and availability"
      items={shows}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      filters={filters}
      searchPlaceholder="Search by show status..."
      searchKeys={['status']}
      searchText={(show) => `${movieNames[show.movieId] ?? ''} ${screenNames[show.screenId] ?? ''} ${show.status}`}
      columnContext={{ movies: movieNames, screens: screenNames }}
      createLabel="Add Show"
      getId={(row) => row.id}
      getDisplayName={(row) => `#${row.id} · ${movieNames[row.movieId] ?? row.movieId}`}
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
