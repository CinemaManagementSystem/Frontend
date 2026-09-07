import React, { useEffect } from 'react';
import { Building2, Globe2, Link2, MapPin } from 'lucide-react';
import {
  CrudTable,
  CrudColumn,
  CrudField,
  CrudFilter,
  CrudStat,
  CrudValue,
} from '@/components/admin/CrudTable/CrudTable';
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
        <span className="text-muted-foreground">—</span>
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
  const { locations, loading, error, fetchAll, create, update, remove } = useLocationStore();

  const cities = Array.from(new Set(locations.map((location) => location.city).filter(Boolean))).sort();
  const stats: CrudStat[] = [
    { label: 'Total Locations', value: locations.length, icon: MapPin, tone: 'border-border bg-muted text-foreground' },
    { label: 'Cities', value: cities.length, icon: Globe2, tone: 'border-sky-500/20 bg-sky-500/10 text-sky-400' },
    {
      label: 'Map Links',
      value: locations.filter((location) => Boolean(location.googleMapsUrl)).length,
      icon: Link2,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
    { label: 'Branch Network', value: locations.length ? 'Active' : 'Empty', icon: Building2, tone: 'border-amber-500/20 bg-amber-500/10 text-amber-400' },
  ];

  const filters: CrudFilter<Location>[] = [
    {
      key: 'city',
      label: 'Filter by city',
      options: [{ value: 'ALL', label: 'All cities' }, ...cities.map((city) => ({ value: city, label: city }))],
      getValue: (location) => location.city,
    },
  ];

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
        stats={stats}
        filters={filters}
        searchPlaceholder="Search by location, city, or address..."
        error={error ?? ''}
        onRetry={() => void fetchAll()}
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
