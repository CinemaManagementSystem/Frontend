import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  Clapperboard,
  Clock,
  Edit2,
  Eye,
  Film,
  ImageOff,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { AlertDialog } from '@/components/ui/Alert/AlertDialog';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { useCategoryStore } from '@/store/categoryStore';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { cn } from '@/lib/utils';
import { ApiMovie, ApiMovieInput } from '@/types/movieApi';

const STATUS_OPTIONS = [
  { value: 'NOW_SHOWING', label: 'Now Showing' },
  { value: 'COMING_SOON', label: 'Coming Soon' },
  { value: 'INACTIVE', label: 'Inactive' },
];

type MovieFormState = {
  title: string;
  categoryId: string;
  description: string;
  posterUrl: string;
  genre: string;
  language: string;
  durationMinutes: string;
  releaseDate: string;
  status: string;
};

const emptyForm: MovieFormState = {
  title: '',
  categoryId: '',
  description: '',
  posterUrl: '',
  genre: '',
  language: '',
  durationMinutes: '',
  releaseDate: '',
  status: 'NOW_SHOWING',
};

function normalizeStatus(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function statusVariant(status: string): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (status === 'NOW_SHOWING') return 'success';
  if (status === 'COMING_SOON') return 'warning';
  if (status === 'INACTIVE') return 'destructive';
  return 'secondary';
}

function movieToForm(movie: ApiMovie): MovieFormState {
  return {
    title: movie.title,
    categoryId: String(movie.categoryId),
    description: movie.description,
    posterUrl: movie.posterUrl,
    genre: movie.genre,
    language: movie.language,
    durationMinutes: String(movie.durationMinutes),
    releaseDate: movie.releaseDate,
    status: movie.status || 'NOW_SHOWING',
  };
}

function toInput(values: MovieFormState): ApiMovieInput {
  return {
    title: values.title.trim(),
    categoryId: Number(values.categoryId),
    description: values.description.trim(),
    posterUrl: values.posterUrl.trim(),
    genre: values.genre.trim(),
    language: values.language.trim(),
    durationMinutes: Number(values.durationMinutes),
    releaseDate: values.releaseDate,
    status: values.status,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function PosterThumbnail({ src, title, large = false }: { src: string; title: string; large?: boolean }) {
  const [hasError, setHasError] = useState(false);
  const showImage = src && !hasError;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-muted-foreground',
        large ? 'h-32 w-24' : 'h-14 w-10'
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={title}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <ImageOff className={large ? 'h-7 w-7' : 'h-4 w-4'} />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg border', tone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export const MoviesPage: React.FC = () => {
  const { movies, loading, fetchAll, create, update, remove } = useMovieAdminStore();
  const { categories, loading: categoriesLoading, fetchAll: fetchCategories } = useCategoryStore();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genreFilter, setGenreFilter] = useState('ALL');
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<ApiMovie | null>(null);
  const [viewingMovie, setViewingMovie] = useState<ApiMovie | null>(null);
  const [formValues, setFormValues] = useState<MovieFormState>(emptyForm);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{
    title: string;
    description: string;
    variant: 'danger' | 'warning' | 'info' | 'success';
    confirmLabel?: string;
    onConfirm?: () => void | Promise<void>;
  } | null>(null);

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const stats = useMemo(
    () => ({
      total: movies.length,
      nowShowing: movies.filter((movie) => movie.status === 'NOW_SHOWING').length,
      comingSoon: movies.filter((movie) => movie.status === 'COMING_SOON').length,
      inactive: movies.filter((movie) => movie.status === 'INACTIVE').length,
    }),
    [movies]
  );

  const statusOptions = useMemo(() => {
    const known = new Set(STATUS_OPTIONS.map((option) => option.value));
    const dynamic = movies
      .map((movie) => movie.status)
      .filter((status) => status && !known.has(status))
      .map((status) => ({ value: status, label: normalizeStatus(status) }));
    return [...STATUS_OPTIONS, ...dynamic];
  }, [movies]);

  const genreOptions = useMemo(
    () =>
      Array.from(new Set(movies.map((movie) => movie.genre).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [movies]
  );

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return movies.filter((movie) => {
      const matchesSearch =
        !normalizedQuery || movie.title.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === 'ALL' || movie.status === statusFilter;
      const matchesGenre = genreFilter === 'ALL' || movie.genre === genreFilter;

      return matchesSearch && matchesStatus && matchesGenre;
    });
  }, [genreFilter, movies, query, statusFilter]);

  const hasFilters = query.trim() !== '' || statusFilter !== 'ALL' || genreFilter !== 'ALL';

  const loadMovies = useCallback(async () => {
    setLoadError('');
    try {
      await Promise.all([fetchAll(), fetchCategories()]);
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Failed to load movies. Please try again.'));
    }
  }, [fetchAll, fetchCategories]);

  useEffect(() => {
    void loadMovies();
  }, [loadMovies]);

  const setFieldValue = (name: keyof MovieFormState, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('ALL');
    setGenreFilter('ALL');
  };

  const openCreate = () => {
    setEditingMovie(null);
    setFormValues(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (movie: ApiMovie) => {
    setEditingMovie(movie);
    setFormValues(movieToForm(movie));
    setFormError('');
    setModalOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingMovie(null);
    setFormError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const payload = toInput(formValues);
      if (editingMovie) {
        await update(editingMovie.id, payload);
      } else {
        await create(payload);
      }
      setModalOpen(false);
      setAlert({
        title: editingMovie ? 'Movie updated' : 'Movie created',
        description: `"${payload.title}" was ${editingMovie ? 'updated' : 'created'} successfully.`,
        variant: 'success',
      });
      setEditingMovie(null);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Failed to save movie. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (movie: ApiMovie) => {
    setAlert({
      title: 'Delete movie?',
      description: `Delete "${movie.title}"? This cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setDeletingId(movie.id);
        try {
          await remove(movie.id);
          setAlert({
            title: 'Movie deleted',
            description: `"${movie.title}" was deleted successfully.`,
            variant: 'success',
          });
        } catch (error) {
          setAlert({
            title: 'Delete failed',
            description: getErrorMessage(error, 'Failed to delete movie. Please try again.'),
            variant: 'danger',
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const renderActions = (movie: ApiMovie, compact = false) => {
    const deleting = deletingId === movie.id;
    const buttonClass =
      'inline-flex items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50';

    return (
      <div className={cn('flex items-center', compact ? 'gap-2' : 'justify-end gap-1')}>
        <button
          type="button"
          onClick={() => setViewingMovie(movie)}
          title="View"
          className={cn(buttonClass, compact ? 'h-9 flex-1 gap-2 px-3 text-xs font-semibold' : 'h-8 w-8')}
        >
          <Eye className="h-4 w-4" />
          {compact && <span>View</span>}
        </button>
        <button
          type="button"
          onClick={() => openEdit(movie)}
          title="Edit"
          className={cn(buttonClass, compact ? 'h-9 flex-1 gap-2 px-3 text-xs font-semibold' : 'h-8 w-8')}
        >
          <Edit2 className="h-4 w-4" />
          {compact && <span>Edit</span>}
        </button>
        <button
          type="button"
          onClick={() => requestDelete(movie)}
          disabled={deleting}
          title="Delete"
          className={cn(
            buttonClass,
            'hover:bg-rose-500/10 hover:text-rose-400',
            compact ? 'h-9 flex-1 gap-2 px-3 text-xs font-semibold' : 'h-8 w-8'
          )}
        >
          <Trash2 className="h-4 w-4" />
          {compact && <span>{deleting ? 'Deleting' : 'Delete'}</span>}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#E50914]">Movie Management</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Movies</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage movie details, posters, release schedules, and catalog status for the admin portal.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={openCreate}
          disabled={loading || categoriesLoading || saving}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Movie
        </Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Movies"
          value={stats.total}
          icon={Film}
          tone="border-border bg-muted text-foreground"
        />
        <StatCard
          label="Now Showing"
          value={stats.nowShowing}
          icon={Clapperboard}
          tone="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          label="Coming Soon"
          value={stats.comingSoon}
          icon={CalendarDays}
          tone="border-amber-500/20 bg-amber-500/10 text-amber-400"
        />
        <StatCard
          label="Inactive Movies"
          value={stats.inactive}
          icon={AlertCircle}
          tone="border-rose-500/20 bg-rose-500/10 text-rose-400"
        />
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by movie title..."
              className="h-10 w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none transition-all focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20"
          >
            <option value="ALL">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={genreFilter}
            onChange={(event) => setGenreFilter(event.target.value)}
            className="h-10 rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none transition-all focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20"
          >
            <option value="ALL">All genres</option>
            {genreOptions.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="h-10"
          >
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        </div>
      </section>

      {loadError ? (
        <section className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Unable to load movies</h2>
                <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadMovies()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-bold text-foreground">Movie Catalog</h2>
              <p className="text-xs text-muted-foreground">
                Showing {filteredMovies.length} of {movies.length} movies
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-3 text-sm text-muted-foreground">Loading movies...</p>
              </div>
            </div>
          ) : movies.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center px-6 py-12 text-center">
              <div className="max-w-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
                  <Film className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">No movies yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first movie to start building the catalog.
                </p>
                <Button type="button" variant="primary" size="sm" onClick={openCreate} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Movie
                </Button>
              </div>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center px-6 py-12 text-center">
              <div className="max-w-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">No matching movies</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try another title, status, or genre filter.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                  Clear filters
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="min-w-[280px] px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                        Movie
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                        Genre
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                        Release Date
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovies.map((movie) => (
                      <tr key={movie.id} className="border-b border-border last:border-b-0 hover:bg-muted/35">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <PosterThumbnail src={movie.posterUrl} title={movie.title} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-foreground">{movie.title}</p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {movie.language || 'No language'} | {categoryNameById.get(movie.categoryId) || 'No category'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{movie.genre || 'Not set'}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {movie.durationMinutes ? `${movie.durationMinutes} min` : 'Not set'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(movie.releaseDate)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(movie.status)} size="sm">
                            {normalizeStatus(movie.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{renderActions(movie)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-border md:hidden">
                {filteredMovies.map((movie) => (
                  <article key={movie.id} className="p-4">
                    <div className="flex gap-3">
                      <PosterThumbnail src={movie.posterUrl} title={movie.title} large />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold leading-5 text-foreground">{movie.title}</h3>
                          <Badge variant={statusVariant(movie.status)} size="sm" className="shrink-0">
                            {normalizeStatus(movie.status)}
                          </Badge>
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Film className="h-3.5 w-3.5" />
                            {movie.genre || 'Not set'}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            {movie.durationMinutes ? `${movie.durationMinutes} min` : 'Not set'}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(movie.releaseDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">{renderActions(movie, true)}</div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeForm}
        title={editingMovie ? 'Edit Movie' : 'Add Movie'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
              {formError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Title"
              value={formValues.title}
              onChange={(event) => setFieldValue('title', event.target.value)}
              placeholder="e.g. Inception"
              required
              disabled={saving}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={formValues.categoryId}
                onChange={(event) => setFieldValue('categoryId', event.target.value)}
                required
                disabled={saving || categoriesLoading}
                className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none transition-all focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{categoriesLoading ? 'Loading categories...' : 'Select category'}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Genre"
              value={formValues.genre}
              onChange={(event) => setFieldValue('genre', event.target.value)}
              placeholder="e.g. Sci-Fi, Thriller"
              required
              disabled={saving}
            />
            <Input
              label="Language"
              value={formValues.language}
              onChange={(event) => setFieldValue('language', event.target.value)}
              placeholder="e.g. English"
              required
              disabled={saving}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              min="1"
              value={formValues.durationMinutes}
              onChange={(event) => setFieldValue('durationMinutes', event.target.value)}
              required
              disabled={saving}
            />
            <Input
              label="Release Date"
              type="date"
              value={formValues.releaseDate}
              onChange={(event) => setFieldValue('releaseDate', event.target.value)}
              required
              disabled={saving}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={formValues.status}
                onChange={(event) => setFieldValue('status', event.target.value)}
                required
                disabled={saving}
                className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none transition-all focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Poster URL"
              value={formValues.posterUrl}
              onChange={(event) => setFieldValue('posterUrl', event.target.value)}
              placeholder="https://.../poster.jpg"
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              value={formValues.description}
              onChange={(event) => setFieldValue('description', event.target.value)}
              placeholder="Movie synopsis"
              rows={4}
              disabled={saving}
              className="w-full resize-none rounded-lg border border-border bg-muted px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving || categoriesLoading}>
              {saving ? 'Saving...' : editingMovie ? 'Save Changes' : 'Create Movie'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={viewingMovie != null}
        onClose={() => setViewingMovie(null)}
        title="Movie Details"
        maxWidth="xl"
      >
        {viewingMovie && (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row">
              <PosterThumbnail src={viewingMovie.posterUrl} title={viewingMovie.title} large />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{viewingMovie.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {viewingMovie.language || 'No language'} | {categoryNameById.get(viewingMovie.categoryId) || 'No category'}
                    </p>
                  </div>
                  <Badge variant={statusVariant(viewingMovie.status)} size="md">
                    {normalizeStatus(viewingMovie.status)}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Genre</p>
                    <p className="mt-1 font-semibold text-foreground">{viewingMovie.genre || 'Not set'}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {viewingMovie.durationMinutes ? `${viewingMovie.durationMinutes} min` : 'Not set'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Release</p>
                    <p className="mt-1 font-semibold text-foreground">{formatDate(viewingMovie.releaseDate)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Description</p>
              <p className="mt-2 whitespace-pre-line rounded-lg border border-border bg-muted p-3 text-sm leading-6 text-foreground">
                {viewingMovie.description || 'No description provided.'}
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setViewingMovie(null)}>
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setViewingMovie(null);
                  openEdit(viewingMovie);
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Movie
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <AlertDialog
        isOpen={alert != null}
        onClose={() => setAlert(null)}
        title={alert?.title ?? ''}
        description={alert?.description ?? ''}
        variant={alert?.variant ?? 'info'}
        confirmLabel={alert?.confirmLabel}
        onConfirm={alert?.onConfirm}
      />
    </div>
  );
};
