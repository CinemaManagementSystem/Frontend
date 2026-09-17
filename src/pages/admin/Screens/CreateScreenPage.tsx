import React, { useCallback } from 'react';
import { Gauge, Info, MonitorPlay, Settings2 } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useScreenStore } from '@/store/screenStore';
import { useTheaterStore } from '@/store/theaterStore';
import { ScreenInput } from '@/types/screen';

export const CreateScreenPage: React.FC = () => {
  const { create } = useScreenStore();
  const { theaters, fetchAll: fetchTheaters } = useTheaterStore();

  const loadOptions = useCallback(async () => {
    await fetchTheaters();
  }, [fetchTheaters]);

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: ScreenInput = {
      name: String(values.name ?? '').trim(),
      screenType: String(values.screenType ?? 'STANDARD'),
      status: String(values.status ?? 'ACTIVE'),
      totalSeats: Number(values.totalSeats ?? 0),
      theaterId: Number(values.theaterId ?? 0),
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/screens"
      backLabel="screens"
      icon={MonitorPlay}
      title="Add New Screen"
      subtitle="Enter details to register a new auditorium screen."
      submitLabel="Save Screen"
      loadOptions={loadOptions}
      sections={[
        {
          title: 'Basic Information',
          description: 'Screen identity and display type.',
          icon: Info,
          fields: [
            {
              name: 'name',
              label: 'Screen Name',
              type: 'text',
              placeholder: 'e.g. Hall 1 - IMAX',
              required: true,
            },
            {
              name: 'screenType',
              label: 'Screen Type',
              type: 'segment',
              required: true,
              options: [
                { value: 'STANDARD', label: 'Standard' },
                { value: 'IMAX', label: 'IMAX' },
                { value: 'VIP', label: 'VIP' },
                { value: '4DX', label: '4DX' },
                { value: 'DOLBY', label: 'Dolby' },
              ],
            },
          ],
        },
        {
          title: 'Specifications',
          description: 'Theater assignment and seating capacity.',
          icon: Settings2,
          fields: [
            {
              name: 'theaterId',
              label: 'Theater',
              type: 'select',
              required: true,
              options: theaters.map((theater) => ({
                value: String(theater.id),
                label: theater.name,
              })),
            },
            {
              name: 'totalSeats',
              label: 'Total Seats',
              type: 'number',
              placeholder: 'e.g. 40',
              min: 1,
              required: true,
            },
          ],
        },
        {
          title: 'Status',
          description: 'Operational status of the screen.',
          icon: Gauge,
          fields: [
            {
              name: 'status',
              label: 'Screen Status',
              type: 'segment',
              required: true,
              options: [
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'MAINTENANCE', label: 'Maintenance' },
              ],
            },
          ],
        },
      ]}
      initialValues={{ status: 'ACTIVE', screenType: 'STANDARD' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateScreenPage;