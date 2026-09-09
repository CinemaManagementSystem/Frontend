import axios from 'axios';
import { create } from 'zustand';
import { Location, LocationInput } from '@/types/location';
import { locationService } from '@/services/locationService';

interface LocationState {
  locations: Location[];
  loading: boolean;
  error: string | null;
  selectedLocationId: number | null;
  fetchAll: () => Promise<void>;
  selectLocation: (id: number | null) => void;
  create: (payload: LocationInput) => Promise<void>;
  update: (id: number, payload: LocationInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

let inFlightFetch: Promise<void> | null = null;

const SELECTED_LOCATION_KEY = 'cinematique_selected_location_id';

function loadSelectedLocationId(): number | null {
  try {
    const raw = localStorage.getItem(SELECTED_LOCATION_KEY);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function getLocationErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) {
      return 'The location service is temporarily busy. Please wait a moment and try again.';
    }

    const responseMessage = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) return responseMessage;
    return error.message || 'Failed to load locations.';
  }

  return error instanceof Error ? error.message : 'Failed to load locations.';
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  loading: false,
  error: null,
  selectedLocationId: loadSelectedLocationId(),

  fetchAll: async () => {
    if (inFlightFetch) return inFlightFetch;

    const request = (async () => {
      set({ loading: true, error: null });
      try {
        const locations = await locationService.list();
        set({ locations, error: null });
      } catch (error) {
        set({ error: getLocationErrorMessage(error) });
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

  selectLocation: (id) => {
    try {
      if (id === null) {
        localStorage.removeItem(SELECTED_LOCATION_KEY);
      } else {
        localStorage.setItem(SELECTED_LOCATION_KEY, String(id));
      }
    } catch {
      // ignore persistence errors
    }
    set({ selectedLocationId: id });
  },

  create: async (payload) => {
    await locationService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await locationService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await locationService.remove(id);
    await get().fetchAll();
  },
}));
