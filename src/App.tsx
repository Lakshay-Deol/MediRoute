import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import Login from './pages/Login';
import PatientHome from './pages/patient/Home';
import DriverHome from './pages/driver/Home';
import HospitalHome from './pages/hospital/Home';
import AdminHome from './pages/admin/Home';

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patient" element={<Protected><PatientHome /></Protected>} />
        <Route path="/driver" element={<Protected><DriverHome /></Protected>} />
        <Route path="/hospital" element={<Protected><HospitalHome /></Protected>} />
        <Route path="/admin" element={<Protected><AdminHome /></Protected>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
