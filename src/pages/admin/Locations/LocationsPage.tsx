import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { useLocationStore } from '@/store/locationStore';
import { Location, LocationInput } from '@/types/location';

const columns: CrudColumn<Location>[] = [
  { key: 'name', header: 'Name' },
  { key: 'city', header: 'City' },
  { key: 'address', header: 'Address' },
  {
    key: 'latitude',
    header: 'Coordinates',
    render: (row) => `${row.latitude}, ${row.longitude}`,
  },
  {
    key: 'googleMapsUrl',
    header: 'Map',
    render: (row) =>
      row.googleMapsUrl ? (
        <a
          href={row.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E50914] hover:underline"
        >
          Open map
        </a>
      ) : (
        <span className="text-gray-500">—</span>
      ),
  },
];

function toInput(values: Record<string, CrudValue>): LocationInput {
  return {
    name: String(values.name ?? ''),
    address: String(values.address ?? ''),
    city: String(values.city ?? ''),
    latitude: Number(values.latitude ?? 0),
    longitude: Number(values.longitude ?? 0),
    googleMapsUrl: String(values.googleMapsUrl ?? ''),
  };
}

export const LocationsPage: React.FC = () => {
  const { locations, loading, fetchAll, create, update, remove } = useLocationStore();

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const fields: CrudField[] = [
    { name: 'name', label: 'Name', placeholder: 'e.g. Phnom Penh Central', required: true },
    { name: 'city', label: 'City', placeholder: 'e.g. Phnom Penh', required: true },
    { name: 'address', label: 'Address', placeholder: 'Street, district, city', required: true },
    { name: 'latitude', label: 'Latitude', type: 'number', placeholder: 'e.g. 11.5564', required: true },
    { name: 'longitude', label: 'Longitude', type: 'number', placeholder: 'e.g. 104.9282', required: true },
    { name: 'googleMapsUrl', label: 'Google Maps URL', placeholder: 'https://maps.google.com/?q=...' },
  ];

  return (
    <CrudTable
      title="Cinema Locations"
      subtitle="Manage cinema branches and their geo-coordinates"
      items={locations}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['name', 'city', 'address']}
      createLabel="Add Location"
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