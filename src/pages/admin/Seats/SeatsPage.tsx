import React, { useEffect } from 'react';
import { Armchair, CheckCircle2, CircleAlert, DollarSign } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
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
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
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

  const stats: CrudStat[] = [
    { label: 'Total Seats', value: seats.length, icon: Armchair, tone: 'border-border bg-muted text-foreground' },
    {
      label: 'Available',
      value: seats.filter((seat) => seat.status === 'AVAILABLE').length,
      icon: CheckCircle2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Occupied',
      value: seats.filter((seat) => seat.status === 'OCCUPIED').length,
      icon: CircleAlert,
      tone: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
    },
    {
      label: 'Average Price',
      value: seats.length ? formatCurrency(seats.reduce((sum, seat) => sum + seat.price, 0) / seats.length) : formatCurrency(0),
      icon: DollarSign,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    },
  ];

  const filters: CrudFilter<Seat>[] = [
    {
      key: 'status',
      label: 'Filter by status',
      options: [{ value: 'ALL', label: 'All statuses' }, ...STATUS_OPTIONS],
      getValue: (seat) => seat.status,
    },
    {
      key: 'type',
      label: 'Filter by type',
      options: [{ value: 'ALL', label: 'All types' }, ...SEAT_TYPES],
      getValue: (seat) => seat.seatType,
    },
  ];

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
      stats={stats}
      filters={filters}
      searchPlaceholder="Search by seat number, row, or type..."
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
