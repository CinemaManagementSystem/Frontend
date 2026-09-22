import { beforeEach, describe, expect, it, vi } from 'vitest';
import { movieAdminService } from './movieAdminService';
import { apiClient } from './apiClient';
import type { ApiMovie, ApiMovieInput } from '@/types/movieApi';

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const payload: ApiMovieInput = {
  categoryId: 1,
  title: 'Interstellar',
  description: 'Space and time.',
  posterUrl: '',
  genre: 'Sci-Fi',
  language: 'English',
  durationMinutes: 169,
  releaseDate: '2026-09-22',
  status: 'NOW_SHOWING',
};

function mockMovie(overrides: Partial<ApiMovie> = {}): ApiMovie {
  return {
    id: 1,
    categoryId: payload.categoryId,
    title: payload.title,
    description: payload.description,
    posterUrl: 'https://res.cloudinary.com/demo/image/upload/movie/poster.jpg',
    posterPublicId: 'Cinema_Project/movie/poster',
    genre: payload.genre,
    language: payload.language,
    durationMinutes: payload.durationMinutes,
    releaseDate: payload.releaseDate,
    status: payload.status,
    ...overrides,
  };
}

describe('movieAdminService multipart writes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates movies with posterFile as the poster multipart field', async () => {
    const posterFile = new File(['fake-poster'], 'poster.webp', { type: 'image/webp' });
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockMovie() });

    await movieAdminService.create({ ...payload, posterFile });

    expect(apiClient.post).toHaveBeenCalledWith('/movies', expect.any(FormData));
    const form = vi.mocked(apiClient.post).mock.calls[0][1] as FormData;
    expect(form.get('title')).toBe(payload.title);
    expect(form.get('categoryId')).toBe(String(payload.categoryId));
    expect(form.get('durationMinutes')).toBe(String(payload.durationMinutes));
    expect(form.get('releaseDate')).toBe(payload.releaseDate);
    expect(form.get('poster')).toBe(posterFile);
  });

  it('updates movies without forcing poster replacement', async () => {
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockMovie() });

    await movieAdminService.update(1, { ...payload, posterUrl: mockMovie().posterUrl, posterFile: null });

    expect(apiClient.put).toHaveBeenCalledWith('/movies/1', expect.any(FormData));
    const form = vi.mocked(apiClient.put).mock.calls[0][1] as FormData;
    expect(form.get('posterUrl')).toBe(mockMovie().posterUrl);
    expect(form.get('poster')).toBeNull();
  });
});
