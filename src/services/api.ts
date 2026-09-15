// API service for interacting with MediRoute Backend

const API_BASE = '/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'driver' | 'hospital';
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const tokenStorage = {
  getToken: () => localStorage.getItem('mediroute_token'),
  setToken: (token: string) => localStorage.setItem('mediroute_token', token),
  removeToken: () => localStorage.removeItem('mediroute_token'),
  getUser: (): User | null => {
    const raw = localStorage.getItem('mediroute_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user: User) => localStorage.setItem('mediroute_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('mediroute_user'),
  clear: () => {
    localStorage.removeItem('mediroute_token');
    localStorage.removeItem('mediroute_user');
  }
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMessage = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMessage);
  }
  return data as T;
}

export async function loginUser(credentials: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await handleResponse<AuthResponse>(res);
  tokenStorage.setToken(data.token);
  tokenStorage.setUser(data.user);
  return data;
}

export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await handleResponse<AuthResponse>(res);
  tokenStorage.setToken(data.token);
  tokenStorage.setUser(data.user);
  return data;
}

export async function getMe(): Promise<{ user: User }> {
  const token = tokenStorage.getToken();
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<{ user: User }>(res);
}

export async function getHospitals() {
  const res = await fetch(`${API_BASE}/hospitals`);
  return handleResponse<any[]>(res);
}

export async function getAmbulances() {
  const res = await fetch(`${API_BASE}/ambulances`);
  return handleResponse<any[]>(res);
}

export async function createEmergency(payload: any) {
  const token = tokenStorage.getToken();
  const res = await fetch(`${API_BASE}/emergencies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<any>(res);
}
