import React, { useEffect } from 'react';
import { CrudTable, CrudColumn, CrudField, CrudValue } from '@/components/admin/CrudTable/CrudTable';
import { Badge } from '@/components/ui/Badge/Badge';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { useCategoryStore } from '@/store/categoryStore';
import { ApiMovie, ApiMovieInput } from '@/types/movieApi';

const STATUS_OPTIONS = [
  { value: 'NOW_SHOWING', label: 'NOW SHOWING' },
  { value: 'COMING_SOON', label: 'COMING SOON' },
];

const columns: CrudColumn<ApiMovie>[] = [
  {
    key: 'posterUrl',
    header: 'Movie',
    render: (row) => (
      <div className="flex items-center gap-3">
        <img
          src={row.posterUrl}
          alt={row.title}
          className="w-10 h-14 object-cover rounded-lg bg-zinc-800 border border-white/10 shrink-0"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
        <div>
          <h4 className="font-bold text-white text-sm">{row.title}</h4>
          <p className="text-[11px] text-gray-400">{row.genre}</p>
        </div>
      </div>
    ),
  },
  { key: 'language', header: 'Language' },
  {
    key: 'durationMinutes',
    header: 'Duration',
    render: (row) => `${row.durationMinutes} min`,
  },
  {
    key: 'releaseDate',
    header: 'Release Date',
    render: (row) => row.releaseDate,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'NOW_SHOWING' ? 'warning' : 'secondary'} size="sm">
        {row.status.replace('_', ' ')}
      </Badge>
    ),
  },
];

function categoryOptions(categories: { id: number; name: string }[]) {
  return categories.map((c) => ({ value: String(c.id), label: c.name }));
}

function toInput(values: Record<string, CrudValue>): ApiMovieInput {
  return {
    title: String(values.title ?? ''),
    categoryId: Number(values.categoryId ?? 0),
    description: String(values.description ?? ''),
    posterUrl: String(values.posterUrl ?? ''),
    genre: String(values.genre ?? ''),
    language: String(values.language ?? ''),
    durationMinutes: Number(values.durationMinutes ?? 0),
    releaseDate: String(values.releaseDate ?? ''),
    status: String(values.status ?? 'NOW_SHOWING'),
  };
}

export const MoviesPage: React.FC = () => {
  const { movies, loading, fetchAll, create, update, remove } = useMovieAdminStore();
  const { categories, fetchAll: fetchCategories } = useCategoryStore();

  useEffect(() => {
    void fetchAll();
    void fetchCategories();
  }, [fetchAll, fetchCategories]);

  const fields: CrudField[] = [
    { name: 'title', label: 'Title', placeholder: 'e.g. Inception', required: true },
    {
      name: 'categoryId',
      label: 'Category',
      type: 'select',
      options: categoryOptions(categories),
      required: true,
    },
    { name: 'genre', label: 'Genre', placeholder: 'e.g. Sci-Fi, Thriller', required: true },
    { name: 'language', label: 'Language', placeholder: 'e.g. English', required: true },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Movie synopsis' },
    { name: 'posterUrl', label: 'Poster URL', placeholder: 'https://.../poster.jpg', required: true },
    { name: 'durationMinutes', label: 'Duration (minutes)', type: 'number', required: true },
    { name: 'releaseDate', label: 'Release Date', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
  ];

  return (
    <CrudTable
      title="Movie Catalog"
      subtitle="Manage movie metadata, posters and catalog status"
      items={movies}
      loading={loading}
      columns={columns}
      fields={fields}
      searchKeys={['title', 'genre', 'language']}
      createLabel="Add Movie"
      getId={(row) => row.id}
      getDisplayName={(row) => row.title}
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