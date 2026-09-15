import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import type { Role } from './data/mockData';
import Landing from './pages/Landing';
import Login from './pages/Login';
import PatientHome from './pages/patient/Home';
import DriverHome from './pages/driver/Home';
import HospitalHome from './pages/hospital/Home';

function Protected({ children, requiredRole }: { children: React.ReactNode; requiredRole?: Role }) {
  const { isAuthenticated, role } = useAppStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && role && role !== requiredRole) {
    return <Navigate to={`/${role}`} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { checkAuth } = useAppStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patient" element={<Protected requiredRole="patient"><PatientHome /></Protected>} />
        <Route path="/driver" element={<Protected requiredRole="driver"><DriverHome /></Protected>} />
        <Route path="/hospital" element={<Protected requiredRole="hospital"><HospitalHome /></Protected>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
