import { createCrudResource, createResourceHook } from './crudSlice';
import { userService } from '@/services/userService';
import type { User, UserInput } from '@/types/user';
import type { RootState } from '@/app/store';

export const {
  slice: userAdminSlice,
  fetchAll: fetchAdminUsers,
  create: createAdminUser,
  update: updateAdminUser,
  remove: removeAdminUser,
} = createCrudResource<User, UserInput>('userAdmin', userService);

export const useAdminUsersResource = createResourceHook<User, UserInput>(
  (state: RootState) => state.userAdmin,
  { fetchAll: fetchAdminUsers, create: createAdminUser, update: updateAdminUser, remove: removeAdminUser },
);

export const userAdminReducer = userAdminSlice.reducer;