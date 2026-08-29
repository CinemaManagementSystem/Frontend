import { create } from 'zustand';
import { User, UserInput } from '@/types/user';
import { userService } from '@/services/userService';

interface UserAdminState {
  users: User[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  create: (payload: UserInput) => Promise<void>;
  update: (id: number, payload: UserInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useUserAdminStore = create<UserAdminState>((set, get) => ({
  users: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const users = await userService.list();
      set({ users });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    await userService.create(payload);
    await get().fetchAll();
  },

  update: async (id, payload) => {
    await userService.update(id, payload);
    await get().fetchAll();
  },

  remove: async (id) => {
    await userService.remove(id);
    await get().fetchAll();
  },
}));