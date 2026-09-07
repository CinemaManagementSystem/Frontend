import React, { useEffect } from 'react';
import { Building2, CheckCircle2, MonitorPlay, Wrench } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useScreenStore } from '@/store/screenStore';
import { useTheaterStore } from '@/store/theaterStore';
import { Screen, ScreenInput } from '@/types/screen';

const SCREEN_TYPES = [
  { value: 'IMAX', label: 'IMAX' },
  { value: 'VIP', label: 'VIP' },
  { value: 'STANDARD', label: 'STANDARD' },
  { value: '4DX', label: '4DX' },
  { value: 'DOLBY', label: 'DOLBY' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

const columns: CrudColumn<Screen>[] = [
  { key: 'name', header: 'Name' },
  {
    key: 'screenType',
    header: 'Type',
    render: (row) => (
      <Badge variant="secondary" size="sm">
        {row.screenType}
      </Badge>
    ),
  },
  {
    key: 'theaterId',
    header: 'Theater',
    render: (row, context) => {
      const names = context?.names as Record<number, string> | undefined;
      return names?.[row.theaterId] ?? `#${row.theaterId}`;
    },
  },
  { key: 'totalSeats', header: 'Seats' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'ACTIVE' ? 'success' : row.status === 'INACTIVE' ? 'destructive' : 'warning'} size="sm">
        {row.status}
      </Badge>
    ),
  },
];

function toInput(values: Record<string, CrudValue>): ScreenInput {
  return {
    name: String(values.name ?? ''),
    screenType: String(values.screenType ?? 'STANDARD'),
    status: String(values.status ?? 'ACTIVE'),
    totalSeats: Number(values.totalSeats ?? 0),
    theaterId: Number(values.theaterId ?? 0),
  };
}

export const ScreensPage: React.FC = () => {
  const { screens, loading, fetchAll, create, update, remove } = useScreenStore();
  const { theaters, fetchAll: fetchTheaters } = useTheaterStore();

  const stats: CrudStat[] = [
    { label: 'Total Screens', value: screens.length, icon: MonitorPlay, tone: 'border-border bg-muted text-foreground' },
    {
      label: 'Active',
      value: screens.filter((screen) => screen.status === 'ACTIVE').length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Maintenance',
      value: screens.filter((screen) => screen.status === 'MAINTENANCE').length,
      icon: Wrench,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
    { label: 'Total Capacity', value: screens.reduce((sum, screen) => sum + screen.totalSeats, 0), icon: Building2, tone: 'border-sky-500/20 bg-sky-500/10 text-sky-400' },
  ];

  const filters: CrudFilter<Screen>[] = [
    {
      key: 'status',
      label: 'Filter by status',
      options: [{ value: 'ALL', label: 'All statuses' }, ...STATUS_OPTIONS],
      getValue: (screen) => screen.status,
    },
    {
      key: 'type',
      label: 'Filter by type',
      options: [{ value: 'ALL', label: 'All types' }, ...SCREEN_TYPES],
      getValue: (screen) => screen.screenType,
    },
  ];

  useEffect(() => {
    void fetchAll();
    void fetchTheaters();
  }, [fetchAll, fetchTheaters]);

  const names: Record<number, string> = {};
  for (const t of theaters) names[t.id] = t.name;

  const fields: CrudField[] = [
    { name: 'name', label: 'Name', placeholder: 'e.g. Hall 1 - IMAX', required: true },
    { name: 'screenType', label: 'Screen Type', type: 'select', options: SCREEN_TYPES, required: true },
    {
      name: 'theaterId',
      label: 'Theater',
      type: 'select',
      options: theaters.map((t) => ({ value: String(t.id), label: t.name })),
      required: true,
    },
    {
      name: 'totalSeats',
      label: 'Total Seats',
      type: 'number',
      placeholder: 'e.g. 40',
      required: true,
    },
    { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
  ];

  return (
    <CrudTable
      title="Screens"
      subtitle="Manage auditorium halls, screen types and seating capacity"
      items={screens}
      loading={loading}
      columns={columns}
      fields={fields}
      stats={stats}
      filters={filters}
      searchPlaceholder="Search by screen name or type..."
      searchKeys={['name', 'screenType']}
      columnContext={{ names }}
      createLabel="Add Screen"
      getId={(row) => row.id}
      getDisplayName={(row) => row.name}
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
