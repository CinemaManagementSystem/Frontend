import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  GripVertical,
  ImageIcon,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { BannerFrame, BANNER_UPLOAD_HELP_TEXT } from '@/components/common/BannerCarousel';
import { bannerService } from '@/services/bannerService';
import type {
  BannerAdmin,
  BannerFormData,
  BannerSection,
  BannerStatus,
} from '@/types/banner';

const SECTIONS: Array<{ id: BannerSection; label: string; description: string }> = [
  { id: 'HOME', label: 'Home Page', description: 'Hero banners featured on the main landing page' },
  { id: 'CINEMA', label: 'Cinemas', description: 'Showcase theater locations, VIP halls, and IMAX auditoriums' },
  { id: 'OFFER', label: 'Offers & Promos', description: 'Special ticket discounts, bank card deals, and partner promos' },
  { id: 'FNB', label: 'F&B Concessions', description: 'Popcorn combos, seasonal beverages, and snack specials' },
  { id: 'MEMBERSHIP', label: 'Membership', description: 'Loyalty perks, VIP tiers, and rewards club benefits' },
];

function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

function toLocalInputString(dateStr?: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface SortableBannerRowProps {
  banner: BannerAdmin;
  index: number;
  total: number;
  renderStatusBadge: (status: BannerStatus) => React.ReactNode;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onToggleActive: (banner: BannerAdmin) => void;
  onEdit: (banner: BannerAdmin) => void;
  onDelete: (banner: BannerAdmin) => void;
}

interface BannerCropPreviewProps {
  src: string;
  title: string;
}

const BannerCropPreview: React.FC<BannerCropPreviewProps> = ({ src, title }) => (
  <div className="mt-4">
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
        Live site crop preview
      </span>
      <span className="text-[11px] text-neutral-500">21:8.5 crop</span>
    </div>
    <BannerFrame
      maxWidth={500}
      shadow={false}
      className="border border-neutral-700 bg-neutral-950"
    >
      {src ? (
        <>
          <img
            src={src}
            alt={title || 'Banner crop preview'}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <span className="absolute bottom-2 right-2 rounded-md bg-black/65 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
            Cropped preview
          </span>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-neutral-500">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs font-medium">Choose an image to preview the live crop.</span>
        </div>
      )}
    </BannerFrame>
    <p className="mt-2 max-w-[500px] text-[11px] leading-5 text-neutral-500">
      {BANNER_UPLOAD_HELP_TEXT}
    </p>
  </div>
);

const SortableBannerRow: React.FC<SortableBannerRowProps> = ({
  banner,
  index,
  total,
  renderStatusBadge,
  onMove,
  onToggleActive,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 transition-colors ${
        isDragging ? 'relative z-10 bg-neutral-800/70 opacity-80 shadow-2xl' : 'hover:bg-neutral-900/40'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex items-center gap-1 text-neutral-500">
          <button
            type="button"
            className="cursor-grab touch-none rounded p-1 text-neutral-400 hover:bg-neutral-800 active:cursor-grabbing"
            title="Drag to reorder"
            aria-label={`Drag ${banner.title} to reorder`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMove(index, 'up')}
              className="p-0.5 text-neutral-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none"
              title="Move Up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => onMove(index, 'down')}
              className="p-0.5 text-neutral-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none"
              title="Move Down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-neutral-800 text-xs font-mono text-neutral-400">
          {index + 1}
        </span>

        <BannerFrame
          maxWidth={144}
          shadow={false}
          className="w-28 flex-shrink-0 border border-neutral-800 bg-neutral-900 sm:w-36"
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </BannerFrame>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4 className="font-semibold text-white truncate text-base">{banner.title}</h4>
            {renderStatusBadge(banner.status)}
          </div>
          {banner.subtitle && (
            <p className="text-xs text-neutral-400 truncate mt-0.5">{banner.subtitle}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
            {banner.linkUrl && (
              <div className="flex items-center gap-1 text-primary-400 max-w-[200px] truncate">
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{banner.linkUrl}</span>
              </div>
            )}
            {(banner.startDate || banner.endDate) && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-neutral-500" />
                <span>
                  {banner.startDate ? formatDateTime(banner.startDate) : 'Now'} &rarr;{' '}
                  {banner.endDate ? formatDateTime(banner.endDate) : 'Indefinite'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800/80">
        <button
          type="button"
          role="switch"
          aria-checked={banner.isActive}
          onClick={() => onToggleActive(banner)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            banner.isActive ? 'bg-primary-600' : 'bg-neutral-800'
          }`}
          title={banner.isActive ? 'Deactivate banner' : 'Activate banner'}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              banner.isActive ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(banner)}
            className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-neutral-800"
            title="Edit banner"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(banner)}
            className="h-8 w-8 p-0 text-rose-400 hover:text-rose-200 hover:bg-rose-500/10"
            title="Delete banner"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const BannersPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<BannerSection>('HOME');
  const [allBanners, setAllBanners] = useState<BannerAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerAdmin | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BannerAdmin | null>(null);

  // Form states
  const [formSection, setFormSection] = useState<BannerSection>('HOME');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formLinkUrl, setFormLinkUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const loadBanners = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await bannerService.getAllBanners();
      setAllBanners(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load banners.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  // Filter banners for the selected section tab
  const sectionBanners = useMemo(() => {
    return allBanners
      .filter((b) => b.section === activeSection)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [allBanners, activeSection]);

  // Section badge counts
  const sectionCounts = useMemo(() => {
    const counts: Record<BannerSection, number> = {
      HOME: 0,
      CINEMA: 0,
      OFFER: 0,
      FNB: 0,
      MEMBERSHIP: 0,
    };
    allBanners.forEach((b) => {
      if (counts[b.section] !== undefined) {
        counts[b.section]++;
      }
    });
    return counts;
  }, [allBanners]);

  const openAddModal = () => {
    setEditingBanner(null);
    setFormSection(activeSection);
    setFormTitle('');
    setFormSubtitle('');
    setFormLinkUrl('');
    setFormIsActive(true);
    setFormStartDate('');
    setFormEndDate('');
    setImageMode('upload');
    setFormImageUrl('');
    setSelectedFile(null);
    setFilePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (banner: BannerAdmin) => {
    setEditingBanner(banner);
    setFormSection(banner.section);
    setFormTitle(banner.title);
    setFormSubtitle(banner.subtitle || '');
    setFormLinkUrl(banner.linkUrl || '');
    setFormIsActive(banner.isActive);
    setFormStartDate(toLocalInputString(banner.startDate));
    setFormEndDate(toLocalInputString(banner.endDate));
    setImageMode(banner.imageUrl && !banner.imagePublicId ? 'url' : 'upload');
    setFormImageUrl(banner.imageUrl || '');
    setSelectedFile(null);
    setFilePreview(banner.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formTitle.trim()) {
      setError('Banner title is required.');
      return;
    }

    if (imageMode === 'upload' && !selectedFile && !editingBanner?.imageUrl) {
      setError('Please upload a banner image file.');
      return;
    }

    if (imageMode === 'url' && !formImageUrl.trim()) {
      setError('Please enter a valid image URL.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: BannerFormData = {
        section: formSection,
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || undefined,
        linkUrl: formLinkUrl.trim() || undefined,
        isActive: formIsActive,
        startDate: formStartDate || undefined,
        endDate: formEndDate || undefined,
        image: imageMode === 'upload' && selectedFile ? selectedFile : null,
        imageUrl: imageMode === 'url' ? formImageUrl.trim() : (editingBanner ? editingBanner.imageUrl : undefined),
      };

      if (editingBanner) {
        const updated = await bannerService.updateBanner(editingBanner.id, payload);
        setAllBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        setSuccess(`Banner "${updated.title}" updated successfully.`);
      } else {
        const created = await bannerService.createBanner(payload);
        setAllBanners((prev) => [...prev, created]);
        setSuccess(`Banner "${created.title}" created successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save banner.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (banner: BannerAdmin) => {
    try {
      const updated = await bannerService.toggleBannerStatus(banner.id);
      setAllBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setSuccess(`Banner "${banner.title}" status set to ${updated.isActive ? 'Active' : 'Disabled'}.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to toggle status.';
      setError(message);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await bannerService.deleteBanner(deleteConfirm.id);
      setAllBanners((prev) => prev.filter((b) => b.id !== deleteConfirm.id));
      setSuccess(`Banner "${deleteConfirm.title}" deleted.`);
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete banner.';
      setError(message);
    }
  };

  const persistReorder = async (orderedBanners: BannerAdmin[]) => {
    const ids = orderedBanners.map((b) => b.id);
    try {
      await bannerService.reorderBanners(ids, activeSection);
      setSuccess('Banner order saved.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sync banner order.';
      setError(message);
      void loadBanners();
    }
  };

  const applyLocalReorder = (orderedBanners: BannerAdmin[]) => {
    const reordered = orderedBanners.map((item, idx) => ({ ...item, sortOrder: idx }));
    setAllBanners((prev) =>
      prev.map((b) => {
        if (b.section !== activeSection) return b;
        const match = reordered.find((item) => item.id === b.id);
        return match || b;
      })
    );
    return reordered;
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = sectionBanners.findIndex((banner) => banner.id === active.id);
    const newIndex = sectionBanners.findIndex((banner) => banner.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = applyLocalReorder(arrayMove(sectionBanners, oldIndex, newIndex));
    await persistReorder(reordered);
  };

  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionBanners.length) return;

    const reordered = applyLocalReorder(arrayMove(sectionBanners, index, targetIndex));
    await persistReorder(reordered);
  };

  const renderStatusBadge = (status: BannerStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Active
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-400 border border-sky-500/20">
            <Clock className="h-3 w-3" />
            Scheduled
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <Calendar className="h-3 w-3" />
            Expired
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-400 border border-neutral-700">
            Disabled
          </span>
        );
    }
  };

  const cropPreviewSrc = imageMode === 'url' ? formImageUrl.trim() : filePreview;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Banner Management</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Configure dynamic hero carousels for the 5 cinema pages with drag-and-drop ordering and scheduling.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBanners}
            disabled={isLoading}
            className="flex items-center gap-2 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={openAddModal}
            size="sm"
            className="flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20"
          >
            <Plus className="h-4 w-4" />
            Add Banner
          </Button>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 5 Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          const count = sectionCounts[sec.id] || 0;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-neutral-800 text-white shadow-md border border-neutral-700'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 border border-transparent'
              }`}
            >
              <span>{sec.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  isActive ? 'bg-primary-600 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Description & Reorder Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <p className="text-xs text-neutral-400">
          {SECTIONS.find((s) => s.id === activeSection)?.description}
        </p>
        <span className="text-xs text-neutral-400">
          Drag handles or use arrows to set carousel display order.
        </span>
      </div>

      {/* Banner List / Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950">
          <Spinner size="lg" />
        </div>
      ) : sectionBanners.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-neutral-500 mb-4">
            <ImageIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">No banners in this section</h3>
          <p className="mt-1 text-sm text-neutral-400 max-w-md">
            This page is currently without a hero carousel. Create your first banner to enhance the customer experience.
          </p>
          <Button onClick={openAddModal} className="mt-6 flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700">
            <Plus className="h-4 w-4" />
            Add First Banner
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => void handleDragEnd(event)}
          >
            <SortableContext
              items={sectionBanners.map((banner) => banner.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-neutral-800/80">
                {sectionBanners.map((banner, index) => (
                  <SortableBannerRow
                    key={banner.id}
                    banner={banner}
                    index={index}
                    total={sectionBanners.length}
                    renderStatusBadge={renderStatusBadge}
                    onMove={(rowIndex, direction) => void moveBanner(rowIndex, direction)}
                    onToggleActive={(nextBanner) => void handleToggleActive(nextBanner)}
                    onEdit={openEditModal}
                    onDelete={setDeleteConfirm}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Add / Edit Banner Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-800 p-6 md:p-8 shadow-2xl my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">
              {editingBanner ? 'Edit Banner' : 'Create New Banner'}
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              Configure banner visuals, scheduling window, and link destination.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Section Select */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Target Section *
                </label>
                <select
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value as BannerSection)}
                  className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3 text-sm text-white focus:border-primary-500 focus:outline-none"
                >
                  {SECTIONS.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.label} ({sec.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Summer Blockbuster Fest"
                    className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3 text-sm text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="e.g. Book IMAX tickets with 20% off"
                    className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3 text-sm text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Input Mode Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Banner Image *
                  </label>
                  <div className="flex items-center rounded-lg bg-neutral-800 p-0.5 border border-neutral-700">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        imageMode === 'upload' ? 'bg-primary-600 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      File Upload (Cloudinary)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        imageMode === 'url' ? 'bg-primary-600 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-800/60 p-5 text-center">
                    <input
                      type="file"
                      id="bannerImageUpload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="bannerImageUpload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <UploadCloud className="h-8 w-8 text-neutral-400" />
                      <span className="text-sm font-semibold text-neutral-200">
                        {selectedFile ? selectedFile.name : 'Click to select or drag & drop banner image'}
                      </span>
                      <span className="text-xs text-neutral-500">
                        PNG, JPG, or WEBP
                      </span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => {
                        setFormImageUrl(e.target.value);
                        setFilePreview(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3 text-sm text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                )}

                <BannerCropPreview src={cropPreviewSrc} title={formTitle} />
              </div>

              {/* Destination Link URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Destination Link URL (Optional)
                </label>
                <input
                  type="text"
                  value={formLinkUrl}
                  onChange={(e) => setFormLinkUrl(e.target.value)}
                  placeholder="e.g. /promotion or https://partner.example.com"
                  className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3 text-sm text-white focus:border-primary-500 focus:outline-none"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Relative internal route (/promotion, /cinemas, /fnb) or full https:// external link.
                </span>
              </div>

              {/* Scheduling Window */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Start Schedule (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3 text-sm text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    End Schedule (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-3 text-sm text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Active Toggle Switch in Form */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                <div>
                  <span className="text-sm font-semibold text-white block">Status Active</span>
                  <span className="text-xs text-neutral-400">
                    Immediately allow this banner to appear in customer carousels (subject to dates).
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formIsActive}
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsActive ? 'bg-primary-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formIsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700"
                >
                  {isSaving ? <Spinner size="sm" /> : editingBanner ? 'Save Changes' : 'Create Banner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Banner?</h3>
            <p className="mt-2 text-sm text-neutral-400">
              Are you sure you want to delete <span className="font-semibold text-white">"{deleteConfirm.title}"</span>?
              This will remove the banner from public display and delete any associated stored images.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20"
              >
                Delete Banner
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersPage;
