import { create } from 'zustand';
import type { Role } from '../data/mockData';
import { tokenStorage, loginUser, registerUser, getMe, type User as ApiUser } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

interface AppState {
  role: Role | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setRole: (role: Role) => void;
  setUser: (user: User | null) => void;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role: Role }) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

// Initial state from persisted localStorage if available
const persistedUser = tokenStorage.getUser();
const hasToken = !!tokenStorage.getToken();

export const useAppStore = create<AppState>((set) => ({
  role: (persistedUser?.role as Role) || null,
  user: (persistedUser as User) || null,
  isAuthenticated: hasToken && !!persistedUser,
  isLoading: false,

  setRole: (role) => set({ role }),
  setUser: (user) => set({ user, role: user?.role || null, isAuthenticated: !!user }),

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { user } = await loginUser(credentials);
      const appUser = user as User;
      set({
        user: appUser,
        role: appUser.role,
        isAuthenticated: true,
        isLoading: false,
      });
      return appUser;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const { user } = await registerUser(data);
      const appUser = user as User;
      set({
        user: appUser,
        role: appUser.role,
        isAuthenticated: true,
        isLoading: false,
      });
      return appUser;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    tokenStorage.clear();
    set({ role: null, user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    const token = tokenStorage.getToken();
    if (!token) {
      set({ isAuthenticated: false, user: null, role: null });
      return false;
    }
    try {
      const { user } = await getMe();
      const appUser = user as User;
      tokenStorage.setUser(appUser as ApiUser);
      set({ user: appUser, role: appUser.role, isAuthenticated: true });
      return true;
    } catch (err) {
      tokenStorage.clear();
      set({ isAuthenticated: false, user: null, role: null });
      return false;
    }
  },
}));
