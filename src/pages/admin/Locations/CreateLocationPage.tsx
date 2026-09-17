import React from 'react';
import { Info, MapPin, Navigation } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useLocationStore } from '@/store/locationStore';
import { LocationInput } from '@/types/location';

export const CreateLocationPage: React.FC = () => {
  const { create } = useLocationStore();

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: LocationInput = {
      name: String(values.name ?? '').trim(),
      address: String(values.address ?? '').trim(),
      city: String(values.city ?? '').trim(),
      latitude: Number(values.latitude ?? 0),
      longitude: Number(values.longitude ?? 0),
      googleMapsUrl: String(values.googleMapsUrl ?? '').trim(),
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/locations"
      backLabel="locations"
      icon={MapPin}
      title="Add New Location"
      subtitle="Enter details to register a new cinema branch and its coordinates."
      submitLabel="Save Location"
      sections={[
        {
          title: 'Basic Information',
          description: 'Branch identity and full address details.',
          icon: Info,
          fields: [
            {
              name: 'name',
              label: 'Location Name',
              type: 'text',
              placeholder: 'e.g. Phnom Penh Central',
              required: true,
            },
            {
              name: 'city',
              label: 'City',
              type: 'text',
              placeholder: 'e.g. Phnom Penh',
              required: true,
            },
            {
              name: 'address',
              label: 'Full Address',
              type: 'text',
              placeholder: 'Street, district, city',
              required: true,
              spanFull: true,
            },
            {
              name: 'googleMapsUrl',
              label: 'Google Maps URL',
              type: 'text',
              placeholder: 'https://maps.google.com/?q=...',
              spanFull: true,
            },
          ],
        },
        {
          title: 'Geo Coordinates',
          description: 'Latitude and longitude used for maps and navigation.',
          icon: Navigation,
          fields: [
            {
              name: 'latitude',
              label: 'Latitude',
              type: 'number',
              placeholder: 'e.g. 11.5564',
              step: 'any',
              required: true,
            },
            {
              name: 'longitude',
              label: 'Longitude',
              type: 'number',
              placeholder: 'e.g. 104.9282',
              step: 'any',
              required: true,
            },
          ],
        },
      ]}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateLocationPage;