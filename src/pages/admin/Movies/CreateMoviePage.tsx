import React, { useCallback } from 'react';
import { Clapperboard, Film, Gauge, Image, Info, Settings2 } from 'lucide-react';
import { CreateEntityPage, CreateFieldValue } from '@/components/admin/CreatePage/CreateEntityPage';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { useCategoryStore } from '@/store/categoryStore';
import { ApiMovieInput } from '@/types/movieApi';

export const CreateMoviePage: React.FC = () => {
  const { create } = useMovieAdminStore();
  const { categories, fetchAll: fetchCategories } = useCategoryStore();

  const loadOptions = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (values: Record<string, CreateFieldValue>) => {
    const payload: ApiMovieInput = {
      title: String(values.title ?? '').trim(),
      categoryId: Number(values.categoryId ?? 0),
      description: String(values.description ?? '').trim(),
      posterUrl: String(values.posterUrl ?? '').trim(),
      genre: String(values.genre ?? '').trim(),
      language: String(values.language ?? '').trim(),
      durationMinutes: Number(values.durationMinutes ?? 0),
      releaseDate: String(values.releaseDate ?? ''),
      status: String(values.status ?? 'NOW_SHOWING'),
    };
    await create(payload);
  };

  return (
    <CreateEntityPage
      backUrl="/admin/movies"
      backLabel="movies"
      icon={Clapperboard}
      title="Add New Movie"
      subtitle="Enter details to register a new movie in the catalog."
      submitLabel="Create Movie"
      loadOptions={loadOptions}
      sections={[
        {
          title: 'Basic Information',
          description: 'Core movie identity and catalog grouping.',
          icon: Info,
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              placeholder: 'e.g. Inception',
              required: true,
            },
            {
              name: 'categoryId',
              label: 'Category',
              type: 'select',
              required: true,
              options: categories.map((category) => ({
                value: String(category.id),
                label: category.name,
              })),
            },
            {
              name: 'genre',
              label: 'Genre',
              type: 'text',
              placeholder: 'e.g. Sci-Fi, Thriller',
              required: true,
            },
            {
              name: 'language',
              label: 'Language',
              type: 'text',
              placeholder: 'e.g. English',
              required: true,
            },
          ],
        },
        {
          title: 'Specifications',
          description: 'Runtime and release date.',
          icon: Settings2,
          fields: [
            {
              name: 'durationMinutes',
              label: 'Duration (minutes)',
              type: 'number',
              placeholder: 'e.g. 148',
              min: 1,
              required: true,
            },
            {
              name: 'releaseDate',
              label: 'Release Date',
              type: 'date',
              required: true,
            },
          ],
        },
        {
          title: 'Media & Assets',
          description: 'Poster image used across the catalog and booking flows.',
          icon: Image,
          fields: [
            {
              name: 'posterUrl',
              label: 'Poster URL',
              type: 'imageUrl',
              placeholder: 'https://.../poster.jpg',
              required: true,
              spanFull: true,
            },
          ],
        },
        {
          title: 'Synopsis',
          description: 'Short description shown on the movie detail page.',
          icon: Film,
          fields: [
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              placeholder: 'Movie synopsis',
              rows: 5,
              spanFull: true,
            },
          ],
        },
        {
          title: 'Status',
          description: 'Screening lifecycle of the movie.',
          icon: Gauge,
          fields: [
            {
              name: 'status',
              label: 'Movie Status',
              type: 'segment',
              required: true,
              options: [
                { value: 'NOW_SHOWING', label: 'Now Showing' },
                { value: 'COMING_SOON', label: 'Coming Soon' },
                { value: 'INACTIVE', label: 'Inactive' },
              ],
            },
          ],
        },
      ]}
      initialValues={{ status: 'NOW_SHOWING' }}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateMoviePage;