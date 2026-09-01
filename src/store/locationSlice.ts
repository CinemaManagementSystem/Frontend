import { createCrudResource, createResourceHook } from './crudSlice';
import { locationService } from '@/services/locationService';
import type { Location, LocationInput } from '@/types/location';
import type { RootState } from '@/app/store';

export const {
  slice: locationSlice,
  fetchAll: fetchLocations,
  create: createLocation,
  update: updateLocation,
  remove: removeLocation,
} = createCrudResource<Location, LocationInput>('location', locationService);

export const useLocationsResource = createResourceHook<Location, LocationInput>(
  (state: RootState) => state.location,
  { fetchAll: fetchLocations, create: createLocation, update: updateLocation, remove: removeLocation },
);

export const locationReducer = locationSlice.reducer;