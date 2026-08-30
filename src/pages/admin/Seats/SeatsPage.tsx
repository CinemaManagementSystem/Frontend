import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useSeatStore } from '@/store/seatStore';
import { useScreenStore } from '@/store/screenStore';
import { Seat, SeatInput } from '@/types/seat';
import { formatCurrency } from '@/utils/formatDate';

const SEAT_TYPES = [
  { value: 'STANDARD', label: 'STANDARD' },
  { value: 'VIP', label: 'VIP' },
  { value: 'COUPLE', label: 'COUPLE' },
];

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'AVAILABLE' },
  { value: 'RESERVED', label: 'RESERVED' },
  { value: 'OCCUPIED', label: 'OCCUPIED' },
  { value: 'MAINTENANCE', label: 'MAINTENANCE' },
];

const columns: CrudColumn<Seat>[] = [
  { key: 'seatNumber', header: 'Seat' },
  { key: 'rowName', header: 'Row' },
  {
    key: 'screenId',
    header: 'Screen',
    render: (row, context) => {
      const names = context?.names as Record<number, string> | undefined;
      return names?.[row.screenId] ?? `#${row.screenId}`;
    },
  },
  {
    key: 'seatType',
    header: 'Type',
    render: (row) => (
      <Badge variant={row.seatType === 'VIP' ? 'warning' : row.seatType === 'COUPLE' ? 'primary' : 'secondary'} size="sm">
        {row.seatType}
      </Badge>
    ),
  },
  { key: 'price', header: 'Price', render: (row) => formatCurrency(row.price) },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'AVAILABLE' ? 'success' : row.status === 'OCCUPIED' ? 'destructive' : 'warning'} size="sm">
        {row.status}
      </Badge>
    ),
  },
];

function toInput(values: Record<string, CrudValue>): SeatInput {
  return {
    price: Number(values.price ?? 0),
    rowName: String(values.rowName ?? '').toUpperCase(),
    seatNumber: String(values.seatNumber ?? ''),
    seatType: String(values.seatType ?? 'STANDARD'),
    status: String(values.status ?? 'AVAILABLE'),
    screenId: Number(values.screenId ?? 0),
  };
}

export const SeatsPage: React.FC = () => {
  const { seats, loading, fetchAll, create, update, remove } = useSeatStore();
  const { screens, fetchAll: fetchScreens } = useScreenStore();

  useEffect(() => {
    void fetchAll();
    void fetchScreens();
  }, [fetchAll, fetchScreens]);

  const names: Record<number, string> = {};
  for (const s of screens) names[s.id] = s.name;

  const fields: CrudField[] = [
    { name: 'seatNumber', label: 'Seat Number', placeholder: 'e.g. A1', required: true },
    { name: 'rowName', label: 'Row', placeholder: 'e.g. A', required: true },
    {
      name: 'screenId',
      label: 'Screen',
      type: 'select',
      options: screens.map((s) => ({ value: String(s.id), label: s.name })),
      required: true,
    },
    { name: 'seatType', label: 'Seat Type', type: 'select', options: SEAT_TYPES, required: true },
    { name: 'price', label: 'Price (USD)', type: 'number', placeholder: 'e.g. 6.00', required: true },
    { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
  ];

  return (
    <CrudTable
      title="Seats"
      subtitle="Manage auditorium seating layout, seat types and pricing"
      items={seats}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['seatNumber', 'rowName', 'seatType']}
      columnContext={{ names }}
      createLabel="Add Seat"
      getId={(row) => row.id}
      getDisplayName={(row) => row.seatNumber}
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