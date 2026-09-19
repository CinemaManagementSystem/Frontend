import { beforeEach, describe, expect, it, vi } from 'vitest';
import { joinCinemaLocations, useCinemaStore } from './cinemaStore';
import { theaterService } from '@/services/theaterService';
import { locationService } from '@/services/locationService';
import type { Theater } from '@/types/theater';
import type { Location } from '@/types/location';

vi.mock('@/services/theaterService', () => ({ theaterService: { list: vi.fn() } }));
vi.mock('@/services/locationService', () => ({ locationService: { list: vi.fn() } }));

const theater: Theater = {
  id: 8, name: 'Central Cinema', address: 'Level 3, Central Mall', phone: '023-888-999',
  status: 'OPEN', locationId: 2, managerId: 1,
};
const location: Location = {
  id: 2, name: 'Central Mall', address: '214 Street', city: 'Phnom Penh',
  googleMapsUrl: 'https://maps.google.com/?q=11.5564,104.9282', latitude: 11.5564, longitude: 104.9282,
};

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  useCinemaStore.setState({ cinemas: [], selectedCinemaId: 'ALL', loaded: false, loading: false, error: null, locationError: null, fetchedAt: 0 });
  vi.mocked(theaterService.list).mockResolvedValue([theater]);
  vi.mocked(locationService.list).mockResolvedValue([location]);
});

describe('public cinema locations', () => {
  it('joins by location ID while preserving theater IDs, names and street addresses', () => {
    const cinemas = joinCinemaLocations([theater], [{ ...location, id: 9, city: 'Wrong city' }, location]);
    expect(cinemas[0]).toEqual(expect.objectContaining({
      id: 'c-8', theaterId: 8, name: 'Central Cinema', address: theater.address,
      phone: theater.phone, locationName: 'Central Mall', city: 'Phnom Penh', googleMapsUrl: location.googleMapsUrl,
    }));
  });

  it('uses actual location addresses when needed, without inventing missing contact details', () => {
    expect(joinCinemaLocations([{ ...theater, address: '', phone: '' }], [location])[0].address).toBe('214 Street');
    expect(joinCinemaLocations([{ ...theater, address: '', phone: '' }], [])[0]).toEqual(expect.objectContaining({
      address: '', phone: '', city: '', googleMapsUrl: null,
    }));
    expect(joinCinemaLocations([theater], [{ ...location, googleMapsUrl: 'javascript:alert(1)' }])[0].googleMapsUrl).toBeNull();
  });

  it('deduplicates Navbar/page requests and resets a deleted persisted cinema selection', async () => {
    useCinemaStore.getState().selectCinema('c-99');
    await Promise.all([useCinemaStore.getState().fetchCinemas(), useCinemaStore.getState().fetchCinemas()]);
    expect(theaterService.list).toHaveBeenCalledTimes(1);
    expect(locationService.list).toHaveBeenCalledTimes(1);
    expect(useCinemaStore.getState().selectedCinemaId).toBe('ALL');
    expect(localStorage.getItem('cinematique_selected_cinema_id')).toBe('ALL');
    expect(useCinemaStore.getState().cinemas[0].id).toBe('c-8');
  });

  it('keeps real theater data available if supplementary location details fail', async () => {
    vi.mocked(locationService.list).mockRejectedValue(new Error('Unavailable'));
    await useCinemaStore.getState().fetchCinemas();
    expect(useCinemaStore.getState()).toEqual(expect.objectContaining({
      error: null, locationError: expect.any(String), loading: false,
      cinemas: [expect.objectContaining({ name: theater.name, address: theater.address, city: '', googleMapsUrl: null })],
    }));
  });

  it('does not substitute location records for cinemas when theaters fail, and supports retry', async () => {
    vi.mocked(theaterService.list).mockRejectedValueOnce(new Error('Unavailable'));
    await useCinemaStore.getState().fetchCinemas();
    expect(useCinemaStore.getState()).toEqual(expect.objectContaining({ cinemas: [], error: expect.any(String), loading: false }));
    await useCinemaStore.getState().fetchCinemas(true);
    expect(useCinemaStore.getState()).toEqual(expect.objectContaining({ error: null, loaded: true }));
    expect(useCinemaStore.getState().cinemas).toHaveLength(1);
  });
});
