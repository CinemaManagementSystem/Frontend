import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Clapperboard,
  FileText,
  Film,
  ImagePlus,
  Info,
  LoaderCircle,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { AdminFormField, adminInputClass, adminTextareaClass } from '@/components/admin/Form/AdminFormField';
import { AdminSectionCard } from '@/components/admin/Form/AdminSectionCard';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { useCategoryStore } from '@/store/categoryStore';
import type { ApiMovieInput } from '@/types/movieApi';

type MovieDraft = {
  title: string;
  categoryId: string;
  genre: string;
  language: string;
  durationMinutes: string;
  releaseDate: string;
  status: string;
  description: string;
  posterUrl: string;
  posterFile: File | null;
};

const initialDraft: MovieDraft = {
  title: '',
  categoryId: '',
  genre: '',
  language: '',
  durationMinutes: '',
  releaseDate: '',
  status: 'NOW_SHOWING',
  description: '',
  posterUrl: '',
  posterFile: null,
};

const focusClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export const CreateMoviePage: React.FC = () => {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { create } = useMovieAdminStore();
  const { categories, fetchAll: fetchCategories } = useCategoryStore();
  const [draft, setDraft] = useState<MovieDraft>(initialDraft);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filePreview, setFilePreview] = useState('');

  useEffect(() => {
    let active = true;
    fetchCategories()
      .catch(() => {
        if (active) setError('Categories could not be loaded. Refresh and try again.');
      })
      .finally(() => {
        if (active) setLoadingCategories(false);
      });
    return () => {
      active = false;
    };
  }, [fetchCategories]);

  useEffect(() => {
    if (!draft.posterFile) {
      setFilePreview('');
      return undefined;
    }
    const url = URL.createObjectURL(draft.posterFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [draft.posterFile]);

  const previewUrl = draft.posterFile ? filePreview : draft.posterUrl.trim();
  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === draft.categoryId),
    [categories, draft.categoryId],
  );

  const update = <K extends keyof MovieDraft>(key: K, value: MovieDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (error) setError('');
  };

  const chooseFile = (file: File | null) => {
    if (file && !file.type.startsWith('image/')) {
      setError('Choose a PNG, JPG, or WebP image.');
      return;
    }
    update('posterFile', file);
    if (file) update('posterUrl', '');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const posterUrl = draft.posterUrl.trim();
    if (!draft.title.trim() || !draft.categoryId || !draft.genre.trim() || !draft.language.trim() || !draft.durationMinutes || !draft.releaseDate) {
      setError('Complete the required movie details before creating the movie.');
      return;
    }
    if (!posterUrl && !draft.posterFile) {
      setError('Add a poster URL or upload an image file.');
      return;
    }
    const payload: ApiMovieInput = {
      title: draft.title.trim(),
      categoryId: Number(draft.categoryId),
      description: draft.description.trim(),
      posterUrl,
      posterFile: draft.posterFile,
      genre: draft.genre.trim(),
      language: draft.language.trim(),
      durationMinutes: Number(draft.durationMinutes),
      releaseDate: draft.releaseDate,
      status: draft.status,
    };
    setSaving(true);
    setError('');
    try {
      await create(payload);
      navigate('/admin/movies');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Movie could not be created. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm">
            <Link to="/admin/movies" className={`font-semibold text-zinc-400 transition hover:text-white ${focusClass}`}>
              Movies
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="font-semibold text-white">Add new</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E50914]/10 text-[#ff3341] ring-1 ring-[#E50914]/20">
              <Clapperboard className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff3341]">Movie studio</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">Add movie</h1>
            </div>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
          <Sparkles className="h-4 w-4 text-[#ff3341]" aria-hidden="true" />
          Draft a polished listing
        </div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={reducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="space-y-6">
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <AdminSectionCard
            icon={Film}
            title="Movie details"
            description="Core catalog information guests use to recognize and find this movie."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminFormField label="Title" required className="sm:col-span-2">
                <input
                  className={adminInputClass}
                  value={draft.title}
                  onChange={(event) => update('title', event.target.value)}
                  placeholder="e.g. Inception"
                  disabled={saving}
                  autoFocus
                />
              </AdminFormField>

              <AdminFormField label="Category" required>
                <div className="relative">
                  <select
                    className={`${adminInputClass} appearance-none pr-10`}
                    value={draft.categoryId}
                    onChange={(event) => update('categoryId', event.target.value)}
                    disabled={saving || loadingCategories}
                  >
                    <option value="">{loadingCategories ? 'Loading categories...' : 'Select category'}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-zinc-500" aria-hidden="true" />
                </div>
              </AdminFormField>

              <AdminFormField label="Genre" required helperText="For now, use comma-separated genres. Tags come in the next step.">
                <input
                  className={adminInputClass}
                  value={draft.genre}
                  onChange={(event) => update('genre', event.target.value)}
                  placeholder="Sci-Fi, Thriller"
                  disabled={saving}
                />
              </AdminFormField>

              <AdminFormField label="Language" required helperText="Searchable language selection comes in the next step.">
                <input
                  className={adminInputClass}
                  value={draft.language}
                  onChange={(event) => update('language', event.target.value)}
                  placeholder="English"
                  disabled={saving}
                />
              </AdminFormField>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            icon={CalendarDays}
            title="Release details"
            description="Set runtime, release date, and catalog visibility."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <AdminFormField label="Duration" required>
                <div className="relative">
                  <input
                    className={`${adminInputClass} pr-20`}
                    type="number"
                    min="1"
                    value={draft.durationMinutes}
                    onChange={(event) => update('durationMinutes', event.target.value)}
                    placeholder="148"
                    disabled={saving}
                  />
                  <span className="pointer-events-none absolute right-3 top-3 text-sm text-zinc-400">minutes</span>
                </div>
              </AdminFormField>

              <AdminFormField label="Release date" required helperText="The extra calendar icon will be removed in the date-picker step.">
                <div className="relative">
                  <input
                    className={`${adminInputClass} pr-10 dark:[color-scheme:dark]`}
                    type="date"
                    value={draft.releaseDate}
                    onChange={(event) => update('releaseDate', event.target.value)}
                    disabled={saving}
                  />
                  <CalendarDays className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-zinc-500" aria-hidden="true" />
                </div>
              </AdminFormField>

              <AdminFormField label="Status">
                <div className="relative">
                  <select
                    className={`${adminInputClass} appearance-none pr-10`}
                    value={draft.status}
                    onChange={(event) => update('status', event.target.value)}
                    disabled={saving}
                  >
                    <option value="NOW_SHOWING">Now showing</option>
                    <option value="COMING_SOON">Coming soon</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-zinc-500" aria-hidden="true" />
                </div>
              </AdminFormField>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            icon={FileText}
            title="Synopsis"
            description="Give guests a quick reason to choose this movie."
          >
            <AdminFormField label="Description" helperText="Character counter and recommended length come in the next step.">
              <textarea
                className={adminTextareaClass}
                value={draft.description}
                onChange={(event) => update('description', event.target.value)}
                placeholder="A short, engaging description..."
                disabled={saving}
              />
            </AdminFormField>
          </AdminSectionCard>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-sm">
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white">Movie poster</h2>
                  <p className="mt-1 text-sm text-zinc-400">URL or local image</p>
                </div>
                <ImagePlus className="h-5 w-5 text-[#ff3341]" aria-hidden="true" />
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="relative mx-auto flex aspect-[2/3] max-w-[230px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Poster preview"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="px-6 text-center">
                    <Film className="mx-auto h-9 w-9 text-zinc-500" aria-hidden="true" />
                    <p className="mt-3 text-sm font-semibold text-zinc-300">Your poster preview</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">Use a vertical 2:3 image for the best result.</p>
                  </div>
                )}
              </div>
              <div className="mt-5 space-y-4">
                <AdminFormField label="Poster URL">
                  <input
                    className={adminInputClass}
                    type="url"
                    value={draft.posterUrl}
                    onChange={(event) => {
                      update('posterUrl', event.target.value);
                      if (event.target.value) update('posterFile', null);
                    }}
                    placeholder="https://.../poster.jpg"
                    disabled={saving || Boolean(draft.posterFile)}
                  />
                </AdminFormField>
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                  <span className="h-px flex-1 bg-white/10" />
                  or
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#E50914]/40 bg-[#E50914]/5 px-4 py-3 text-sm font-semibold text-[#ff3341] transition hover:border-[#E50914] hover:bg-[#E50914]/10 ${saving ? 'pointer-events-none opacity-50' : ''}`}>
                  <UploadCloud className="h-4 w-4" aria-hidden="true" />
                  {draft.posterFile ? 'Change image' : 'Upload from disk'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={saving}
                    onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                  />
                </label>
                {draft.posterFile && (
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-3 py-2 text-xs">
                    <span className="min-w-0 truncate text-zinc-400">{draft.posterFile.name}</span>
                    <button
                      type="button"
                      className={`shrink-0 rounded p-1 text-zinc-400 hover:text-white ${focusClass}`}
                      onClick={() => chooseFile(null)}
                      aria-label="Remove poster file"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
                <p className="text-xs leading-5 text-zinc-400">
                  The selected image will be uploaded and hosted in Cloudinary when you create the movie.
                </p>
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-400">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Info className="h-4 w-4 text-[#ff3341]" aria-hidden="true" />
              Catalog readiness
            </div>
            <p className="mt-2">
              {selectedCategory ? `${selectedCategory.name} · ` : ''}
              A live completion checklist comes in Step 5.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#E50914] px-5 text-sm font-bold text-white shadow-lg shadow-[#E50914]/15 transition hover:bg-[#ff1f2d] disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
            >
              {saving ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating movie...
                </>
              ) : (
                <>
                  <Clapperboard className="h-4 w-4" aria-hidden="true" />
                  Create movie
                </>
              )}
            </button>
            <Link
              to="/admin/movies"
              className={`inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06] hover:text-white ${focusClass}`}
            >
              Cancel
            </Link>
          </div>
        </aside>
      </motion.form>
    </main>
  );
};

export default CreateMoviePage;
