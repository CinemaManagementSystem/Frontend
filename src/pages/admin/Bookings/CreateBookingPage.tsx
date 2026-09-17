import React, { useCallback } from 'react';
import { CalendarClock, DollarSign, Info, Ticket } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { useShowStore } from '@/store/showStore';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { ApiBookingInput } from '@/types/bookingApi';

function normalizeDateTime(value: string): string {
  const v = String(value ?? '');
  return v.length === 16 ? `${v}:00` : v;
}

export const CreateBookingPage: React.FC = () => {
  const { create } = useBookingAdminStore();
  const { shows, fetchAll: fetchShows } = useShowStore();
  const { movies, fetchAll: fetchMovies } = useMovieAdminStore();

  const loadOptions = useCallback(async () => {
    await Promise.all([fetchShows(), fetchMovies()]);
  }, [fetchMovies, fetchShows]);

  const showOptions = shows.map((show) => {
    const movieTitle = movies.find((movie) => movie.id === show.movieId)?.title ?? `movie#${show.movieId}`;
    return { value: String(show.id), label: `#${show.id} · ${movieTitle}` };
  });

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: ApiBookingInput = {
      bookingCode: String(values.bookingCode ?? '').trim(),
      customerId: Number(values.customerId ?? 0),
      showId: Number(values.showId ?? 0),
      bookedAt: normalizeDateTime(String(values.bookedAt ?? '')),
      totalAmount: Number(values.totalAmount ?? 0),
      status: String(values.status ?? 'PENDING'),
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/bookings"
      backLabel="bookings"
      icon={Ticket}
      title="Add New Booking"
      subtitle="Enter details to register a new ticket booking."
      submitLabel="Create Booking"
      loadOptions={loadOptions}
      sections={[
        {
          title: 'Basic Information',
          description: 'Booking reference and customer.',
          icon: Info,
          fields: [
            {
              name: 'bookingCode',
              label: 'Booking Reference',
              type: 'text',
              placeholder: 'e.g. BK-XXXXXX',
              required: true,
            },
            {
              name: 'customerId',
              label: 'Customer ID',
              type: 'number',
              placeholder: 'User id of the customer',
              min: 1,
              required: true,
            },
          ],
        },
        {
          title: 'Show & Schedule',
          description: 'The screening the customer booked and when it was placed.',
          icon: CalendarClock,
          fields: [
            {
              name: 'showId',
              label: 'Show',
              type: 'select',
              required: true,
              options: showOptions,
            },
            {
              name: 'bookedAt',
              label: 'Booked At',
              type: 'datetime',
              required: true,
            },
          ],
        },
        {
          title: 'Pricing & Status',
          description: 'Order total and booking state.',
          icon: DollarSign,
          fields: [
            {
              name: 'totalAmount',
              label: 'Total Amount (USD)',
              type: 'number',
              placeholder: 'e.g. 12.00',
              min: 0,
              step: '0.01',
              required: true,
            },
            {
              name: 'status',
              label: 'Booking Status',
              type: 'segment',
              required: true,
              options: [
                { value: 'PENDING', label: 'Pending' },
                { value: 'CONFIRMED', label: 'Confirmed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ],
            },
          ],
        },
      ]}
      initialValues={{ status: 'PENDING' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateBookingPage;