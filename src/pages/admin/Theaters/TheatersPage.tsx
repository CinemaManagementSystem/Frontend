import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useTheaterStore } from '@/store/theaterStore';
import { useLocationStore } from '@/store/locationStore';
import { Theater, TheaterInput } from '@/types/theater';

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'OPEN' },
  { value: 'CLOSED', label: 'CLOSED' },
  { value: 'MAINTENANCE', label: 'MAINTENANCE' },
];

const columns: CrudColumn<Theater>[] = [
  { key: 'name', header: 'Name' },
  { key: 'address', header: 'Address' },
  { key: 'phone', header: 'Phone' },
  {
    key: 'locationId',
    header: 'Location',
    render: (row, context) => {
      const names = context?.names as Record<number, string> | undefined;
      return names?.[row.locationId] ?? `#${row.locationId}`;
    },
  },
  { key: 'managerId', header: 'Manager ID', render: (row) => `#${row.managerId}` },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'OPEN' ? 'success' : row.status === 'CLOSED' ? 'destructive' : 'warning'} size="sm">
        {row.status}
      </Badge>
    ),
  },
];

function toInput(values: Record<string, CrudValue>): TheaterInput {
  return {
    name: String(values.name ?? ''),
    address: String(values.address ?? ''),
    phone: String(values.phone ?? ''),
    status: String(values.status ?? 'OPEN'),
    locationId: Number(values.locationId ?? 0),
    managerId: Number(values.managerId ?? 0),
  };
}

export const TheatersPage: React.FC = () => {
  const { theaters, loading, fetchAll, create, update, remove } = useTheaterStore();
  const { locations, fetchAll: fetchLocations } = useLocationStore();

  useEffect(() => {
    void fetchAll();
    void fetchLocations();
  }, [fetchAll, fetchLocations]);

  const names: Record<number, string> = {};
  for (const loc of locations) names[loc.id] = loc.name;

  const fields: CrudField[] = [
    { name: 'name', label: 'Name', placeholder: 'e.g. Legend Cinema Central', required: true },
    {
      name: 'locationId',
      label: 'Location',
      type: 'select',
      options: locations.map((l) => ({ value: String(l.id), label: l.name })),
      required: true,
    },
    { name: 'address', label: 'Address', placeholder: 'Level, mall, district', required: true },
    { name: 'phone', label: 'Phone', placeholder: 'e.g. 023-888-999', required: true },
    { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
    {
      name: 'managerId',
      label: 'Manager ID',
      placeholder: 'User id of the theater manager',
      required: true,
    },
  ];

  return (
    <CrudTable
      title="Theaters"
      subtitle="Manage cinema branches, contact info and manager assignment"
      items={theaters}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['name', 'address', 'phone']}
      columnContext={{ names }}
      createLabel="Add Theater"
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