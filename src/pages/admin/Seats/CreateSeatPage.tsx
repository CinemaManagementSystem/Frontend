import React, { useCallback } from 'react';
import { Armchair, DollarSign, Gauge, Info } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useSeatStore } from '@/store/seatStore';
import { useScreenStore } from '@/store/screenStore';
import { SeatInput } from '@/types/seat';

export const CreateSeatPage: React.FC = () => {
  const { create } = useSeatStore();
  const { screens, fetchAll: fetchScreens } = useScreenStore();

  const loadOptions = useCallback(async () => {
    await fetchScreens();
  }, [fetchScreens]);

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: SeatInput = {
      price: Number(values.price ?? 0),
      rowName: String(values.rowName ?? '').toUpperCase(),
      seatNumber: String(values.seatNumber ?? '').toUpperCase(),
      seatType: String(values.seatType ?? 'STANDARD'),
      status: String(values.status ?? 'AVAILABLE'),
      screenId: Number(values.screenId ?? 0),
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/seats"
      backLabel="seats"
      icon={Armchair}
      title="Add New Seat"
      subtitle="Enter details to register a new seat in an auditorium."
      submitLabel="Save Seat"
      loadOptions={loadOptions}
      sections={[
        {
          title: 'Basic Information',
          description: 'Seat identity within its screen.',
          icon: Info,
          fields: [
            {
              name: 'seatNumber',
              label: 'Seat Number',
              type: 'text',
              placeholder: 'e.g. A1',
              required: true,
            },
            {
              name: 'rowName',
              label: 'Row',
              type: 'text',
              placeholder: 'e.g. A',
              required: true,
            },
            {
              name: 'screenId',
              label: 'Screen',
              type: 'select',
              required: true,
              options: screens.map((screen) => ({
                value: String(screen.id),
                label: screen.name,
              })),
              spanFull: true,
            },
          ],
        },
        {
          title: 'Pricing & Seat Type',
          description: 'Seat category and ticket price.',
          icon: DollarSign,
          fields: [
            {
              name: 'seatType',
              label: 'Seat Type',
              type: 'segment',
              required: true,
              options: [
                { value: 'STANDARD', label: 'Standard' },
                { value: 'VIP', label: 'VIP' },
                { value: 'COUPLE', label: 'Couple' },
              ],
            },
            {
              name: 'price',
              label: 'Price (USD)',
              type: 'number',
              placeholder: 'e.g. 6.00',
              min: 0,
              step: '0.01',
              required: true,
            },
          ],
        },
        {
          title: 'Status',
          description: 'Current availability of the seat.',
          icon: Gauge,
          fields: [
            {
              name: 'status',
              label: 'Seat Status',
              type: 'segment',
              required: true,
              options: [
                { value: 'AVAILABLE', label: 'Available' },
                { value: 'RESERVED', label: 'Reserved' },
                { value: 'OCCUPIED', label: 'Occupied' },
                { value: 'MAINTENANCE', label: 'Maintenance' },
              ],
            },
          ],
        },
      ]}
      initialValues={{ status: 'AVAILABLE', seatType: 'STANDARD' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateSeatPage;