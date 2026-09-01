import { createCrudResource, createResourceHook } from './crudSlice';
import { userService } from '@/services/userService';
import type { User, UserInput } from '@/types/user';
import type { RootState } from '@/app/store';

export const {
  slice: userSlice,
  fetchAll: fetchUsers,
  create: createUser,
  update: updateUser,
  remove: removeUser,
} = createCrudResource<User, UserInput>('user', userService);

export const useUsersResource = createResourceHook<User, UserInput>(
  (state: RootState) => state.user,
  { fetchAll: fetchUsers, create: createUser, update: updateUser, remove: removeUser },
);

export const userReducer = userSlice.reducer;