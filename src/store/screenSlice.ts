import { createCrudResource, createResourceHook } from './crudSlice';
import { screenService } from '@/services/screenService';
import type { Screen, ScreenInput } from '@/types/screen';
import type { RootState } from '@/app/store';

export const {
  slice: screenSlice,
  fetchAll: fetchScreens,
  create: createScreen,
  update: updateScreen,
  remove: removeScreen,
} = createCrudResource<Screen, ScreenInput>('screen', screenService);

export const useScreensResource = createResourceHook<Screen, ScreenInput>(
  (state: RootState) => state.screen,
  { fetchAll: fetchScreens, create: createScreen, update: updateScreen, remove: removeScreen },
);

export const screenReducer = screenSlice.reducer;