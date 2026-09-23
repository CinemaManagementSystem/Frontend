import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clapperboard,
  Clock,
  FileText,
  Film,
  Globe,
  ImagePlus,
  Info,
  LoaderCircle,
  Sparkles,
  Tag,
  UploadCloud,
  X,
} from 'lucide-react';
import { AdminFormField, adminInputClass, adminTextareaClass } from '@/components/admin/Form/AdminFormField';
import { AdminSectionCard } from '@/components/admin/Form/AdminSectionCard';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { useCategoryStore } from '@/store/categoryStore';
import { getApiErrorMessage } from '@/services/apiClient';
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

const POPULAR_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
];

const COMMON_LANGUAGES = ['English', 'Khmer', 'French', 'Japanese', 'Korean', 'Chinese', 'Thai'];

const DURATION_PRESETS = [90, 105, 120, 148, 165, 180];

const focusClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] focus-visible:ring-offset-2 focus-visible:ring-offset-background';

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
  const [posterMode, setPosterMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);

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

  const update = <K extends keyof MovieDraft>(key: K, value: MovieDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (error) setError('');
  };

  const chooseFile = (file: File | null) => {
    if (file && !file.type.startsWith('image/')) {
      setError('Please choose a valid PNG, JPG, or WebP image.');
      return;
    }
    update('posterFile', file);
    if (file) {
      update('posterUrl', '');
    }
  };

  // Toggle Genre Chip
  const activeGenres = useMemo(() => {
    return draft.genre
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
  }, [draft.genre]);

  const toggleGenre = (genreToToggle: string) => {
    const set = new Set(activeGenres);
    if (set.has(genreToToggle)) {
      set.delete(genreToToggle);
    } else {
      set.add(genreToToggle);
    }
    update('genre', Array.from(set).join(', '));
  };

  // Readiness checklist calculations
  const readiness = useMemo(() => {
    const checks = [
      { id: 'title', label: 'Movie Title', valid: Boolean(draft.title.trim()) },
      { id: 'category', label: 'Category', valid: Boolean(draft.categoryId) },
      { id: 'genre', label: 'Genres', valid: activeGenres.length > 0 },
      { id: 'language', label: 'Language', valid: Boolean(draft.language.trim()) },
      {
        id: 'runtime',
        label: 'Duration & Date',
        valid: Boolean(draft.durationMinutes && Number(draft.durationMinutes) > 0 && draft.releaseDate),
      },
      { id: 'poster', label: 'Poster Artwork', valid: Boolean(previewUrl) },
    ];
    const completed = checks.filter((c) => c.valid).length;
    const percent = Math.round((completed / checks.length) * 100);
    return { checks, completed, total: checks.length, percent };
  }, [draft, activeGenres, previewUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const posterUrl = draft.posterUrl.trim();
    if (
      !draft.title.trim() ||
      !draft.categoryId ||
      !draft.genre.trim() ||
      !draft.language.trim() ||
      !draft.durationMinutes ||
      !draft.releaseDate
    ) {
      setError('Please fill in all required movie details before saving.');
      return;
    }
    if (!posterUrl && !draft.posterFile) {
      setError('Please provide a poster URL or upload a movie poster.');
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
      setError(getApiErrorMessage(reason, 'movie creation'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* ─── PAGE HEADER & BREADCRUMBS ─────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs font-semibold">
            <Link
              to="/admin/movies"
              className={`text-zinc-400 transition hover:text-white ${focusClass}`}
            >
              Movies
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-[#ff3341]">Add New Movie</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E50914]/15 text-[#ff3341] ring-1 ring-[#E50914]/30 shadow-lg shadow-red-500/10">
              <Clapperboard className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff3341]">Movie Catalog</p>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Add New Movie
              </h1>
            </div>
          </div>
        </div>

        {/* Catalog Progress Pill */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-[#ff3341]" aria-hidden="true" />
          <span>Catalog Readiness:</span>
          <span className="font-bold text-white">{readiness.percent}%</span>
          <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-[#ff3341] transition-all duration-500"
              style={{ width: `${readiness.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── CREATE MOVIE FORM ─────────────────────────────────────── */}
      <motion.form
        onSubmit={handleSubmit}
        initial={reducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]"
      >
        <div className="space-y-6">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 shadow-md shadow-red-500/10"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Section 1: Basic Movie Information */}
          <AdminSectionCard
            icon={Film}
            title="General Information"
            description="Core movie details displayed to customers across the booking portal."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminFormField label="Movie Title" required className="sm:col-span-2">
                <input
                  className={adminInputClass}
                  value={draft.title}
                  onChange={(event) => update('title', event.target.value)}
                  placeholder="e.g. Inception, Oppenheimer, Avatar"
                  disabled={saving}
                  autoFocus
                />
              </AdminFormField>

              {/* Category Dropdown */}
              <AdminFormField label="Category" required>
                <div className="relative">
                  <select
                    className={`${adminInputClass} appearance-none pr-10 bg-zinc-900`}
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
                  <ChevronDown
                    className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-zinc-400"
                    aria-hidden="true"
                  />
                </div>
              </AdminFormField>

              {/* Language Selection */}
              <AdminFormField label="Language" required>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      className={`${adminInputClass} pl-9`}
                      value={draft.language}
                      onChange={(event) => update('language', event.target.value)}
                      placeholder="e.g. English, Khmer"
                      disabled={saving}
                    />
                    <Globe
                      className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-500"
                      aria-hidden="true"
                    />
                  </div>
                  {/* Quick Language Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COMMON_LANGUAGES.map((lang) => (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => update('language', lang)}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                          draft.language.toLowerCase() === lang.toLowerCase()
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-white/[0.04] text-zinc-400 border border-white/5 hover:bg-white/[0.08] hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </AdminFormField>

              {/* Genre Selector with Interactive Chips */}
              <AdminFormField
                label="Genres"
                required
                className="sm:col-span-2"
                helperText="Select from popular tags or enter custom genres separated by commas."
              >
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      className={`${adminInputClass} pl-9`}
                      value={draft.genre}
                      onChange={(event) => update('genre', event.target.value)}
                      placeholder="Sci-Fi, Thriller, Action"
                      disabled={saving}
                    />
                    <Tag
                      className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-500"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Interactive Genre Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_GENRES.map((g) => {
                      const active = activeGenres.some((ag) => ag.toLowerCase() === g.toLowerCase());
                      return (
                        <button
                          type="button"
                          key={g}
                          onClick={() => toggleGenre(g)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                            active
                              ? 'bg-[var(--primary)] text-white shadow-sm shadow-red-500/30'
                              : 'border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {active && <Check className="h-3 w-3" />}
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </AdminFormField>
            </div>
          </AdminSectionCard>

          {/* Section 2: Release & Runtime Details */}
          <AdminSectionCard
            icon={CalendarDays}
            title="Release & Scheduling"
            description="Set runtime duration, cinema release date, and listing visibility status."
          >
            <div className="grid gap-5 md:grid-cols-3">
              {/* Duration with Presets */}
              <AdminFormField label="Duration" required>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      className={`${adminInputClass} pl-9 pr-16`}
                      type="number"
                      min="1"
                      value={draft.durationMinutes}
                      onChange={(event) => update('durationMinutes', event.target.value)}
                      placeholder="148"
                      disabled={saving}
                    />
                    <Clock
                      className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-500"
                      aria-hidden="true"
                    />
                    <span className="pointer-events-none absolute right-3 top-3 text-xs text-zinc-400">
                      mins
                    </span>
                  </div>

                  {/* Quick Duration Presets */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {DURATION_PRESETS.map((mins) => (
                      <button
                        type="button"
                        key={mins}
                        onClick={() => update('durationMinutes', String(mins))}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                          draft.durationMinutes === String(mins)
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </AdminFormField>

              {/* Release Date */}
              <AdminFormField label="Release Date" required>
                <div className="relative">
                  <input
                    className={`${adminInputClass} [color-scheme:dark]`}
                    type="date"
                    value={draft.releaseDate}
                    onChange={(event) => update('releaseDate', event.target.value)}
                    disabled={saving}
                  />
                </div>
              </AdminFormField>

              {/* Status Selector */}
              <AdminFormField label="Listing Status">
                <div className="relative">
                  <select
                    className={`${adminInputClass} appearance-none pr-10 bg-zinc-900`}
                    value={draft.status}
                    onChange={(event) => update('status', event.target.value)}
                    disabled={saving}
                  >
                    <option value="NOW_SHOWING">Now showing</option>
                    <option value="COMING_SOON">Coming soon</option>
                    <option value="INACTIVE">Inactive / Hidden</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-zinc-400"
                    aria-hidden="true"
                  />
                </div>
              </AdminFormField>
            </div>
          </AdminSectionCard>

          {/* Section 3: Synopsis & Description */}
          <AdminSectionCard
            icon={FileText}
            title="Synopsis & Storyline"
            description="Brief plot summary displayed on movie detail pages and search results."
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Engaging description for guests</span>
                <span className={draft.description.length > 500 ? 'text-amber-400 font-bold' : ''}>
                  {draft.description.length} / 500 characters
                </span>
              </div>
              <textarea
                className={`${adminTextareaClass} min-h-[120px]`}
                value={draft.description}
                onChange={(event) => update('description', event.target.value)}
                placeholder="A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O..."
                disabled={saving}
              />
            </div>
          </AdminSectionCard>
        </div>

        {/* ─── ASIDE: POSTER ARTWORK & READINESS ───────────────────────── */}
        <aside className="space-y-6 xl:sticky xl:top-6">
          {/* Movie Poster Card */}
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-xl backdrop-blur-md">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white">Movie Poster</h2>
                  <p className="mt-0.5 text-xs text-zinc-400">Vertical 2:3 key art</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-[#ff3341] border border-red-500/20">
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="mt-4 grid grid-cols-2 rounded-xl bg-white/[0.04] p-1 border border-white/5">
                <button
                  type="button"
                  onClick={() => setPosterMode('upload')}
                  className={`rounded-lg py-1.5 text-xs font-bold transition ${
                    posterMode === 'upload'
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPosterMode('url')}
                  className={`rounded-lg py-1.5 text-xs font-bold transition ${
                    posterMode === 'url'
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            <div className="p-5">
              {/* Poster Preview Frame */}
              <div className="relative mx-auto flex aspect-[2/3] max-w-[220px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-2xl">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Poster preview"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        update('posterFile', null);
                        update('posterUrl', '');
                      }}
                      className="absolute right-2.5 top-2.5 rounded-full bg-black/70 p-1.5 text-white backdrop-blur-md transition hover:bg-red-600"
                      title="Remove poster"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="px-5 text-center">
                    <Film className="mx-auto h-10 w-10 text-zinc-600" aria-hidden="true" />
                    <p className="mt-3 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Poster Preview
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                      Standard 2:3 theatrical poster recommended
                    </p>
                  </div>
                )}
              </div>

              {/* Upload or URL Inputs */}
              <div className="mt-5 space-y-3">
                {posterMode === 'upload' ? (
                  <div>
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) chooseFile(file);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition ${
                        isDragging
                          ? 'border-[var(--primary)] bg-red-500/10'
                          : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                      } ${saving ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <UploadCloud className="h-6 w-6 text-[#ff3341]" aria-hidden="true" />
                      <div className="text-xs">
                        <span className="font-bold text-white">Click to upload</span>
                        <span className="text-zinc-400"> or drag &amp; drop</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">PNG, JPG, or WebP (max 10MB)</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        disabled={saving}
                        onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                      />
                    </label>

                    {draft.posterFile && (
                      <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs border border-white/5">
                        <span className="min-w-0 truncate text-zinc-300 font-medium">
                          {draft.posterFile.name}
                        </span>
                        <button
                          type="button"
                          className="shrink-0 text-zinc-400 hover:text-white"
                          onClick={() => chooseFile(null)}
                          aria-label="Remove poster file"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      className={adminInputClass}
                      type="url"
                      value={draft.posterUrl}
                      onChange={(event) => {
                        update('posterUrl', event.target.value);
                        if (event.target.value) update('posterFile', null);
                      }}
                      placeholder="https://image.tmdb.org/.../poster.jpg"
                      disabled={saving}
                    />
                    <p className="mt-1 text-[11px] text-zinc-500">
                      Paste a public image URL ending with .jpg, .png, or .webp
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Catalog Readiness Checklist */}
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Info className="h-4 w-4 text-[#ff3341]" aria-hidden="true" />
                <span>Catalog Checklist</span>
              </div>
              <span className="text-xs font-semibold text-zinc-400">
                {readiness.completed} / {readiness.total} ready
              </span>
            </div>

            <ul className="mt-3.5 space-y-2 text-xs">
              {readiness.checks.map((check) => (
                <li
                  key={check.id}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition ${
                    check.valid
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-white/[0.02] text-zinc-500'
                  }`}
                >
                  {check.valid ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-600 shrink-0" />
                  )}
                  <span className={check.valid ? 'font-medium' : ''}>{check.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-6 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
            >
              {saving ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating Movie...
                </>
              ) : (
                <>
                  <Clapperboard className="h-4 w-4" aria-hidden="true" />
                  Create Movie
                </>
              )}
            </button>
            <Link
              to="/admin/movies"
              className={`inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white ${focusClass}`}
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
