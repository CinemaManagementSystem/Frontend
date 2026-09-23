import { apiClient, unwrapApiResponse } from './apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  Banner,
  BannerAdmin,
  BannerFormData,
  BannerSection,
  BannerReorderRequest,
} from '@/types/banner';

type BannerAdminGrouped = Partial<Record<BannerSection, BannerAdmin[]>>;

const activeBannerCache = new Map<BannerSection, Banner[]>();
const activeBannerRequests = new Map<BannerSection, Promise<Banner[]>>();

const isGroupedBannerResponse = (value: unknown): value is BannerAdminGrouped =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeAdminBanners = (value: BannerAdmin[] | BannerAdminGrouped): BannerAdmin[] => {
  if (Array.isArray(value)) return value;
  return Object.values(value).flatMap((sectionBanners) => sectionBanners ?? []);
};

export const bannerService = {
  /**
   * Fetches active banners for the public-facing carousels by section.
   */
  async getActiveBanners(section: BannerSection): Promise<Banner[]> {
    const cached = activeBannerCache.get(section);
    if (cached) return cached;

    const inFlight = activeBannerRequests.get(section);
    if (inFlight) return inFlight;

    const request = apiClient
      .get<Banner[] | ApiResponse<Banner[]>>(`/banners/${section}`)
      .then((response) => {
        const banners = unwrapApiResponse(response.data);
        activeBannerCache.set(section, banners);
        return banners;
      })
      .catch(() => []);

    activeBannerRequests.set(section, request);
    try {
      return await request;
    } finally {
      activeBannerRequests.delete(section);
    }
  },

  /**
   * Fetches all banners for the admin dashboard, optionally filtered by section.
   */
  async getAllBanners(section?: BannerSection): Promise<BannerAdmin[]> {
    const response = await apiClient.get<
      BannerAdmin[] | BannerAdminGrouped | ApiResponse<BannerAdmin[] | BannerAdminGrouped>
    >('/admin/banners', {
      params: section ? { section } : undefined,
    });
    const data = unwrapApiResponse(response.data);
    return isGroupedBannerResponse(data) ? normalizeAdminBanners(data) : data;
  },

  /**
   * Fetches a single banner by ID for editing.
   */
  async getBannerById(id: number): Promise<BannerAdmin> {
    const response = await apiClient.get<BannerAdmin | ApiResponse<BannerAdmin>>(`/admin/banners/${id}`);
    return unwrapApiResponse(response.data);
  },

  /**
   * Creates a new banner, supporting either direct file upload or image URL.
   */
  async createBanner(data: BannerFormData): Promise<BannerAdmin> {
    if (data.image) {
      const formData = new FormData();
      formData.append('section', data.section);
      formData.append('title', data.title);
      if (data.subtitle) formData.append('subtitle', data.subtitle);
      if (data.linkUrl) formData.append('linkUrl', data.linkUrl);
      if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));
      if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
      if (data.startDate) formData.append('startDate', data.startDate);
      if (data.endDate) formData.append('endDate', data.endDate);
      formData.append('image', data.image);

      const response = await apiClient.post<BannerAdmin | ApiResponse<BannerAdmin>>(
        '/admin/banners',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      activeBannerCache.clear();
      return unwrapApiResponse(response.data);
    }

    const payload = {
      section: data.section,
      title: data.title,
      subtitle: data.subtitle || undefined,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl || undefined,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
    };

    const response = await apiClient.post<BannerAdmin | ApiResponse<BannerAdmin>>(
      '/admin/banners',
      payload
    );
    activeBannerCache.clear();
    return unwrapApiResponse(response.data);
  },

  /**
   * Updates an existing banner.
   */
  async updateBanner(id: number, data: BannerFormData): Promise<BannerAdmin> {
    if (data.image) {
      const formData = new FormData();
      formData.append('section', data.section);
      formData.append('title', data.title);
      if (data.subtitle !== undefined) formData.append('subtitle', data.subtitle || '');
      if (data.linkUrl !== undefined) formData.append('linkUrl', data.linkUrl || '');
      if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));
      if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
      if (data.startDate !== undefined) formData.append('startDate', data.startDate || '');
      if (data.endDate !== undefined) formData.append('endDate', data.endDate || '');
      formData.append('image', data.image);

      const response = await apiClient.put<BannerAdmin | ApiResponse<BannerAdmin>>(
        `/admin/banners/${id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      activeBannerCache.clear();
      return unwrapApiResponse(response.data);
    }

    const payload = {
      section: data.section,
      title: data.title,
      subtitle: data.subtitle ?? null,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl ?? null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
    };

    const response = await apiClient.put<BannerAdmin | ApiResponse<BannerAdmin>>(
      `/admin/banners/${id}`,
      payload
    );
    activeBannerCache.clear();
    return unwrapApiResponse(response.data);
  },

  /**
   * Quick toggle for banner isActive flag.
   */
  async toggleBannerStatus(id: number): Promise<BannerAdmin> {
    const response = await apiClient.patch<BannerAdmin | ApiResponse<BannerAdmin>>(
      `/admin/banners/${id}/toggle-status`
    );
    activeBannerCache.clear();
    return unwrapApiResponse(response.data);
  },

  /**
   * Bulk updates banner sort order after drag-and-drop.
   */
  async reorderBanners(bannerIds: number[], section?: BannerSection): Promise<BannerAdmin[]> {
    const payload: BannerReorderRequest = { bannerIds, section };
    const response = await apiClient.patch<BannerAdmin[] | ApiResponse<BannerAdmin[]>>(
      '/admin/banners/reorder',
      payload
    );
    activeBannerCache.clear();
    return unwrapApiResponse(response.data);
  },

  /**
   * Deletes a banner and cleans up associated remote assets.
   */
  async deleteBanner(id: number): Promise<void> {
    await apiClient.delete(`/admin/banners/${id}`);
    activeBannerCache.clear();
  },
};
