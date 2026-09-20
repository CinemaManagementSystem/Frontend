import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Clapperboard,
  Film,
  ImagePlus,
  LoaderCircle,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
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
  title: '', categoryId: '', genre: '', language: '', durationMinutes: '',
  releaseDate: '', status: 'NOW_SHOWING', description: '', posterUrl: '', posterFile: null,
};

const inputClass = 'h-11 w-full rounded-xl border border-border bg-muted/50 px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50';
const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{children}{required && <span className="ml-1 text-primary">*</span>}</label>;
}

function SectionCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-base font-bold tracking-tight text-foreground">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div><div className="h-1.5 w-8 rounded-full bg-primary" aria-hidden="true" /></div>{children}</section>;
}

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
    fetchCategories().catch(() => { if (active) setError('Categories could not be loaded. Refresh and try again.'); }).finally(() => {
      if (active) setLoadingCategories(false);
    });
    return () => { active = false; };
  }, [fetchCategories]);

  useEffect(() => {
    if (!draft.posterFile) { setFilePreview(''); return undefined; }
    const url = URL.createObjectURL(draft.posterFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [draft.posterFile]);

  const previewUrl = draft.posterFile ? filePreview : draft.posterUrl.trim();
  const selectedCategory = useMemo(() => categories.find((category) => String(category.id) === draft.categoryId), [categories, draft.categoryId]);
  const update = <K extends keyof MovieDraft>(key: K, value: MovieDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (error) setError('');
  };
  const chooseFile = (file: File | null) => {
    if (file && !file.type.startsWith('image/')) { setError('Choose a PNG, JPG, or WebP image.'); return; }
    update('posterFile', file);
    if (file) update('posterUrl', '');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const posterUrl = draft.posterUrl.trim();
    if (!draft.title.trim() || !draft.categoryId || !draft.genre.trim() || !draft.language.trim() || !draft.durationMinutes || !draft.releaseDate) {
      setError('Complete the required movie details before creating the movie.'); return;
    }
    if (!posterUrl && !draft.posterFile) { setError('Add a poster URL or upload an image file.'); return; }
    const payload: ApiMovieInput = {
      title: draft.title.trim(), categoryId: Number(draft.categoryId), description: draft.description.trim(),
      posterUrl, posterFile: draft.posterFile, genre: draft.genre.trim(), language: draft.language.trim(),
      durationMinutes: Number(draft.durationMinutes), releaseDate: draft.releaseDate, status: draft.status,
    };
    setSaving(true); setError('');
    try { await create(payload); navigate('/admin/movies'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Movie could not be created. Try again.'); }
    finally { setSaving(false); }
  };

  return <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <Link to="/admin/movies" className={`mb-4 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground ${focusClass}`}><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to movies</Link>
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20"><Clapperboard className="h-5 w-5" aria-hidden="true" /></div><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Movie studio</p><h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">Add a new movie</h1></div></div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Create the title once. We’ll handle the poster hosting and make it ready for your cinema catalog.</p>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground sm:flex"><Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Draft a polished listing</div>
    </div>

    <motion.form onSubmit={handleSubmit} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        {error && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{error}</span></div>}
        <SectionCard title="Movie details" description="The information guests use to recognize and find this movie.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><FieldLabel required>Title</FieldLabel><input className={inputClass} value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Inception" disabled={saving} autoFocus /></div>
            <div><FieldLabel required>Category</FieldLabel><div className="relative"><select className={`${inputClass} appearance-none pr-10`} value={draft.categoryId} onChange={(event) => update('categoryId', event.target.value)} disabled={saving || loadingCategories}><option value="">{loadingCategories ? 'Loading categories…' : 'Select category'}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" /></div></div>
            <div><FieldLabel required>Genre</FieldLabel><input className={inputClass} value={draft.genre} onChange={(event) => update('genre', event.target.value)} placeholder="Sci-Fi, Thriller" disabled={saving} /></div>
            <div><FieldLabel required>Language</FieldLabel><input className={inputClass} value={draft.language} onChange={(event) => update('language', event.target.value)} placeholder="English" disabled={saving} /></div>
          </div>
        </SectionCard>
        <SectionCard title="Release details" description="Set the runtime, release date, and current catalog visibility.">
          <div className="grid gap-4 sm:grid-cols-3">
            <div><FieldLabel required>Duration</FieldLabel><div className="relative"><input className={`${inputClass} pr-16`} type="number" min="1" value={draft.durationMinutes} onChange={(event) => update('durationMinutes', event.target.value)} placeholder="148" disabled={saving} /><span className="pointer-events-none absolute right-3 top-3 text-xs text-muted-foreground">minutes</span></div></div>
            <div><FieldLabel required>Release date</FieldLabel><div className="relative"><input className={`${inputClass} pr-10`} type="date" value={draft.releaseDate} onChange={(event) => update('releaseDate', event.target.value)} disabled={saving} /><CalendarDays className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" /></div></div>
            <div><FieldLabel>Status</FieldLabel><div className="relative"><select className={`${inputClass} appearance-none pr-10`} value={draft.status} onChange={(event) => update('status', event.target.value)} disabled={saving}><option value="NOW_SHOWING">Now showing</option><option value="COMING_SOON">Coming soon</option><option value="INACTIVE">Inactive</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" /></div></div>
          </div>
        </SectionCard>
        <SectionCard title="Synopsis" description="Give guests a quick reason to choose this movie."><textarea className="min-h-32 w-full resize-y rounded-xl border border-border bg-muted/50 px-3.5 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={draft.description} onChange={(event) => update('description', event.target.value)} placeholder="A short, engaging description…" disabled={saving} /></SectionCard>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-6">
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4 sm:px-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-bold tracking-tight">Movie poster</h2><p className="mt-1 text-xs text-muted-foreground">URL or local image</p></div><ImagePlus className="h-5 w-5 text-primary" aria-hidden="true" /></div></div>
          <div className="p-5 sm:p-6">
            <div className="relative mx-auto flex aspect-[2/3] max-w-[220px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/50 shadow-inner">{previewUrl ? <img src={previewUrl} alt="Poster preview" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="px-6 text-center"><Film className="mx-auto h-9 w-9 text-muted-foreground/50" aria-hidden="true" /><p className="mt-3 text-sm font-semibold text-muted-foreground">Your poster preview</p><p className="mt-1 text-xs leading-5 text-muted-foreground/80">Use a vertical image for the best result.</p></div>}</div>
            <div className="mt-5 space-y-3">
              <div><FieldLabel>Poster URL</FieldLabel><input className={inputClass} type="url" value={draft.posterUrl} onChange={(event) => { update('posterUrl', event.target.value); if (event.target.value) update('posterFile', null); }} placeholder="https://…/poster.jpg" disabled={saving || Boolean(draft.posterFile)} /></div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
              <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10 ${saving ? 'pointer-events-none opacity-50' : ''}`}><UploadCloud className="h-4 w-4" aria-hidden="true" />{draft.posterFile ? 'Change image' : 'Upload from disk'}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={saving} onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} /></label>
              {draft.posterFile && <div className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2 text-xs"><span className="min-w-0 truncate text-muted-foreground">{draft.posterFile.name}</span><button type="button" className={`shrink-0 rounded p-1 text-muted-foreground hover:text-foreground ${focusClass}`} onClick={() => chooseFile(null)} aria-label="Remove poster file"><X className="h-4 w-4" aria-hidden="true" /></button></div>}
              <p className="text-[11px] leading-5 text-muted-foreground">The selected image will be hosted in Cloudinary when you create the movie.</p>
            </div>
          </div>
        </section>
        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-xs leading-5 text-muted-foreground"><div className="flex items-center gap-2 font-semibold text-foreground"><Check className="h-4 w-4 text-emerald-500" aria-hidden="true" /> Ready to publish</div><p className="mt-2">{selectedCategory ? `${selectedCategory.name} · ` : ''}Your movie will appear in the catalog after creation.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col"><button type="submit" disabled={saving} className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}>{saving ? <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Creating movie…</> : <><Clapperboard className="h-4 w-4" aria-hidden="true" /> Create movie</>}</button><Link to="/admin/movies" className={`inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground ${focusClass}`}>Cancel</Link></div>
      </aside>
    </motion.form>
  </main>;
};

export default CreateMoviePage;
