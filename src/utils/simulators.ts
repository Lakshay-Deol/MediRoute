import { useEffect, useRef } from 'react';
import { useEmergencyStore } from '../store/useEmergencyStore';

// Simulate ambulance movement along a path toward a patient
export function useAmbulanceSimulator(ambulanceId: string, targetLat: number, targetLng: number) {
  const { ambulances, updateAmbulance } = useEmergencyStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const ambulance = ambulances.find((a) => a.id === ambulanceId);
      if (!ambulance || ambulance.status !== 'busy') return;

      const latDiff = targetLat - ambulance.location.lat;
      const lngDiff = targetLng - ambulance.location.lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

      if (distance < 0.0005) return;

      const step = 0.0008;
      updateAmbulance(ambulanceId, {
        location: {
          lat: ambulance.location.lat + (latDiff / distance) * step,
          lng: ambulance.location.lng + (lngDiff / distance) * step,
        },
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ambulanceId, targetLat, targetLng, ambulances, updateAmbulance]);
}

// Simulate bed count fluctuation
export function useBedSimulator() {
  const { hospitals, updateHospital } = useEmergencyStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      hospitals.forEach((hospital) => {
        const bedChange = Math.floor(Math.random() * 3) - 1;
        const newAvailable = Math.max(0, Math.min(hospital.totalBeds, hospital.availableBeds + bedChange));

        const icuChange = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newIcuAvailable = Math.max(0, Math.min(hospital.icuTotal, hospital.icuAvailable + icuChange));

        updateHospital(hospital.id, {
          availableBeds: newAvailable,
          icuAvailable: newIcuAvailable,
        });
      });
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hospitals, updateHospital]);
}

// Format time ago
export function timeAgo(isoString: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// Severity color mapping
export function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' };
    case 'high': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' };
    case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' };
    case 'low': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' };
  }
}

// Status display mapping
export function getStatusDisplay(status: string) {
  switch (status) {
    case 'pending': return { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'dispatched': return { label: 'Dispatched', bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'en_route': return { label: 'En Route', bg: 'bg-emerald-100', text: 'text-emerald-700' };
    case 'arrived': return { label: 'Arrived', bg: 'bg-green-100', text: 'text-green-700' };
    case 'completed': return { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-700' };
    case 'cancelled': return { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' };
    default: return { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
