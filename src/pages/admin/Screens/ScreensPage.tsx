import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
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
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'MAINTENANCE', label: 'MAINTENANCE' },
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