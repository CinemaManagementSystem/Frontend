import React, { useCallback } from 'react';
import { Building2, Gauge, ImagePlus, Info, Link2 } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useTheaterStore } from '@/store/theaterStore';
import { useLocationStore } from '@/store/locationStore';
import { TheaterInput } from '@/types/theater';

export const CreateTheaterPage: React.FC = () => {
  const { create } = useTheaterStore();
  const { locations, fetchAll: fetchLocations } = useLocationStore();

  const loadOptions = useCallback(async () => {
    await fetchLocations();
  }, [fetchLocations]);

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: TheaterInput = {
      name: String(values.name ?? '').trim(),
      address: String(values.address ?? '').trim(),
      phone: String(values.phone ?? '').trim(),
      status: String(values.status ?? 'OPEN'),
      locationId: Number(values.locationId ?? 0),
      managerId: Number(values.managerId ?? 0),
      imageUrl: values.imageUrl ? String(values.imageUrl).trim() : null,
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/theaters"
      backLabel="theaters"
      icon={Building2}
      title="Add New Theater"
      subtitle="Enter details to register a new cinema branch theater."
      submitLabel="Save Theater"
      loadOptions={loadOptions}
      sections={[
        {
          title: 'Basic Information',
          description: 'Theater identity and contact information.',
          icon: Info,
          fields: [
            {
              name: 'name',
              label: 'Theater Name',
              type: 'text',
              placeholder: 'e.g. Legend Cinema Central',
              required: true,
            },
            {
              name: 'phone',
              label: 'Contact Phone',
              type: 'tel',
              placeholder: 'e.g. 023-888-999',
              required: true,
            },
            {
              name: 'address',
              label: 'Full Address',
              type: 'text',
              placeholder: 'Level, mall, district',
              required: true,
              spanFull: true,
            },
          ],
        },
        {
          title: 'Location & Assignment',
          description: 'Link the theater to a registered branch and manager.',
          icon: Link2,
          fields: [
            {
              name: 'locationId',
              label: 'Location',
              type: 'select',
              required: true,
              options: locations.map((location) => ({
                value: String(location.id),
                label: location.name,
              })),
            },
            {
              name: 'managerId',
              label: 'Manager ID',
              type: 'number',
              placeholder: 'User id of the theater manager',
              required: true,
            },
          ],
        },
        {
          title: 'Media & Branding',
          description: 'Cinema exterior or hall photo displayed on the discovery page.',
          icon: ImagePlus,
          fields: [
            {
              name: 'imageUrl',
              label: 'Theater Image URL',
              type: 'imageUrl',
              placeholder: 'https://images.unsplash.com/... or public image URL',
              required: false,
              spanFull: true,
              helper: 'Provide a high-quality landscape photo of the theater branch.',
            },
          ],
        },
        {
          title: 'Status',
          description: 'Operational status of the theater.',
          icon: Gauge,
          fields: [
            {
              name: 'status',
              label: 'Operating Status',
              type: 'segment',
              required: true,
              options: [
                { value: 'OPEN', label: 'Open' },
                { value: 'CLOSED', label: 'Closed' },
                { value: 'MAINTENANCE', label: 'Maintenance' },
              ],
            },
          ],
        },
      ]}
      initialValues={{ status: 'OPEN' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateTheaterPage;