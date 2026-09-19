import { create } from 'zustand';
import { theaterService } from '@/services/theaterService';
import { locationService } from '@/services/locationService';
import type { Theater } from '@/types/theater';
import type { Location } from '@/types/location';

export interface CinemaLocation {
  id: string;
  theaterId: number;
  name: string;
  address: string;
  phone: string;
  status: string;
  locationId: number;
  locationName: string;
  city: string;
  googleMapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface CinemaState {
  cinemas: CinemaLocation[];
  selectedCinemaId: string;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  locationError: string | null;
  fetchedAt: number;
  fetchCinemas: (force?: boolean) => Promise<void>;
  selectCinema: (id: string) => void;
}

const SELECTED_CINEMA_KEY = 'cinematique_selected_cinema_id';
let inFlightFetch: Promise<void> | null = null;

function loadSelection(): string {
  try {
    const id = localStorage.getItem(SELECTED_CINEMA_KEY);
    return id && /^c-\d+$/.test(id) ? id : 'ALL';
  } catch {
    return 'ALL';
  }
}

function safeMapUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

/** Theaters are the bookable cinemas; locations supply their area and map details. */
export function joinCinemaLocations(theaters: Theater[], locations: Location[]): CinemaLocation[] {
  const locationsById = new Map(locations.map((location) => [location.id, location]));
  return theaters.map((theater) => {
    const location = locationsById.get(theater.locationId);
    return {
      id: `c-${theater.id}`,
      theaterId: theater.id,
      name: theater.name,
      address: theater.address?.trim() || location?.address?.trim() || '',
      phone: theater.phone?.trim() || '',
      status: theater.status,
      locationId: theater.locationId,
      locationName: location?.name || '',
      city: location?.city || '',
      googleMapsUrl: safeMapUrl(location?.googleMapsUrl),
      latitude: location && Number.isFinite(location.latitude) ? location.latitude : null,
      longitude: location && Number.isFinite(location.longitude) ? location.longitude : null,
    };
  });
}

export const useCinemaStore = create<CinemaState>((set, get) => ({
  cinemas: [],
  selectedCinemaId: loadSelection(),
  loading: false,
  loaded: false,
  error: null,
  locationError: null,
  fetchedAt: 0,

  fetchCinemas: async (force = false) => {
    if (inFlightFetch) return inFlightFetch;
    if (!force && get().loaded && Date.now() - get().fetchedAt < 60_000) return;

    const request = (async () => {
      set({ loading: true, error: null, locationError: null });
      try {
        const [theatersResult, locationsResult] = await Promise.allSettled([
          theaterService.list(),
          locationService.list(),
        ]);
        if (theatersResult.status === 'rejected') {
          set({ error: 'Cinema locations could not be loaded. Please try again.' });
          return;
        }

        const cinemas = joinCinemaLocations(
          theatersResult.value,
          locationsResult.status === 'fulfilled' ? locationsResult.value : [],
        );
        set({
          cinemas,
          loaded: true,
          fetchedAt: Date.now(),
          locationError: locationsResult.status === 'rejected'
            ? 'Some address and map details are unavailable. Please try again.'
            : null,
        });
        const selected = get().selectedCinemaId;
        if (selected !== 'ALL' && !cinemas.some((cinema) => cinema.id === selected)) {
          get().selectCinema('ALL');
        }
      } finally {
        set({ loading: false });
      }
    })();

    inFlightFetch = request;
    try {
      await request;
    } finally {
      if (inFlightFetch === request) inFlightFetch = null;
    }
  },

  selectCinema: (id) => {
    const selectedCinemaId = /^c-\d+$/.test(id) ? id : 'ALL';
    try {
      localStorage.setItem(SELECTED_CINEMA_KEY, selectedCinemaId);
    } catch {
      // Selection still works when browser storage is unavailable.
    }
    set({ selectedCinemaId });
  },
}));
