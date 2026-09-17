import React, { useCallback } from 'react';
import { CalendarClock, DollarSign, Link2 } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useShowStore } from '@/store/showStore';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { useScreenStore } from '@/store/screenStore';
import { ShowInput } from '@/types/show';

function normalizeDateTime(value: string): string {
  const v = String(value ?? '');
  return v.length === 16 ? `${v}:00` : v;
}

export const CreateShowPage: React.FC = () => {
  const { create } = useShowStore();
  const { movies, fetchAll: fetchMovies } = useMovieAdminStore();
  const { screens, fetchAll: fetchScreens } = useScreenStore();

  const loadOptions = useCallback(async () => {
    await Promise.all([fetchMovies(), fetchScreens()]);
  }, [fetchMovies, fetchScreens]);

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: ShowInput = {
      movieId: Number(values.movieId ?? 0),
      screenId: Number(values.screenId ?? 0),
      startTime: normalizeDateTime(String(values.startTime ?? '')),
      endTime: normalizeDateTime(String(values.endTime ?? '')),
      ticketPrice: Number(values.ticketPrice ?? 0),
      status: String(values.status ?? 'ACTIVE'),
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/shows"
      backLabel="shows"
      icon={CalendarClock}
      title="Add New Show"
      subtitle="Enter details to schedule a new screening showtime."
      submitLabel="Create Show"
      loadOptions={loadOptions}
      sections={[
        {
          title: 'Schedule',
          description: 'Movie, screen and screening window.',
          icon: Link2,
          fields: [
            {
              name: 'movieId',
              label: 'Movie',
              type: 'select',
              required: true,
              options: movies.map((movie) => ({
                value: String(movie.id),
                label: movie.title,
              })),
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
            },
            {
              name: 'startTime',
              label: 'Start Time',
              type: 'datetime',
              required: true,
            },
            {
              name: 'endTime',
              label: 'End Time',
              type: 'datetime',
              required: true,
            },
          ],
        },
        {
          title: 'Pricing & Status',
          description: 'Base ticket price and show availability.',
          icon: DollarSign,
          fields: [
            {
              name: 'ticketPrice',
              label: 'Base Ticket Price (USD)',
              type: 'number',
              placeholder: 'e.g. 8.00',
              min: 0,
              step: '0.01',
              required: true,
            },
            {
              name: 'status',
              label: 'Show Status',
              type: 'segment',
              required: true,
              options: [
                { value: 'ACTIVE', label: 'Active' },
                { value: 'SOLD_OUT', label: 'Sold Out' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'COMPLETED', label: 'Completed' },
              ],
            },
          ],
        },
      ]}
      initialValues={{ status: 'ACTIVE' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateShowPage;