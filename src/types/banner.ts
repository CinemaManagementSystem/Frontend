export type BannerSection = 'HOME' | 'CINEMA' | 'OFFER' | 'FNB' | 'MEMBERSHIP';

export type BannerStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED';

export interface Banner {
  id: number;
  section: BannerSection;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
}

export interface BannerAdmin extends Banner {
  imagePublicId?: string | null;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  status: BannerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BannerFormData {
  section: BannerSection;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  image?: File | null;
}

export interface BannerReorderRequest {
  bannerIds: number[];
  section?: BannerSection;
}
