import { create } from 'zustand';
import { AMBULANCES, EMERGENCY_REQUESTS, HOSPITALS, type Ambulance, type EmergencyRequest, type Hospital } from '../data/mockData';

interface EmergencyState {
  requests: EmergencyRequest[];
  ambulances: Ambulance[];
  hospitals: Hospital[];
  activeEmergencyId: string | null;
  setActiveEmergency: (id: string | null) => void;
  updateRequest: (id: string, updates: Partial<EmergencyRequest>) => void;
  addRequest: (request: EmergencyRequest) => void;
  updateAmbulance: (id: string, updates: Partial<Ambulance>) => void;
  updateHospital: (id: string, updates: Partial<Hospital>) => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  requests: EMERGENCY_REQUESTS,
  ambulances: AMBULANCES,
  hospitals: HOSPITALS,
  activeEmergencyId: 'e1',

  setActiveEmergency: (id) => set({ activeEmergencyId: id }),

  updateRequest: (id, updates) =>
    set((state) => ({
      requests: state.requests.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  addRequest: (request) =>
    set((state) => ({ requests: [request, ...state.requests] })),

  updateAmbulance: (id, updates) =>
    set((state) => ({
      ambulances: state.ambulances.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  updateHospital: (id, updates) =>
    set((state) => ({
      hospitals: state.hospitals.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    })),
}));
