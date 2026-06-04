import { create } from 'zustand';
import type { Role } from '../data/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AppState {
  role: Role | null;
  user: User | null;
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  login: (role: Role, email: string) => void;
  logout: () => void;
}

const MOCK_USERS: Record<Role, User> = {
  patient: { id: 'p1', name: 'Arjun Mehta', email: 'arjun@email.com', role: 'patient' },
  driver: { id: 'd1', name: 'Rajesh Kumar', email: 'rajesh@mediroute.in', role: 'driver' },
  hospital: { id: 'h1', name: 'AIIMS Delhi', email: 'admin@aiims.edu', role: 'hospital' },
  admin: { id: 'adm1', name: 'Control Center', email: 'admin@mediroute.in', role: 'admin' },
};

export const useAppStore = create<AppState>((set) => ({
  role: null,
  user: null,
  isAuthenticated: false,
  setRole: (role) => set({ role }),
  login: (role) => set({ role, user: MOCK_USERS[role], isAuthenticated: true }),
  logout: () => set({ role: null, user: null, isAuthenticated: false }),
}));
