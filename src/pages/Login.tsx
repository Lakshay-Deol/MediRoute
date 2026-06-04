import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { Role } from '../data/mockData';
import toast from 'react-hot-toast';

const ROLES: { id: Role; label: string; icon: string; desc: string }[] = [
  { id: 'patient', label: 'Patient', icon: '🧑‍⚕️', desc: 'Request ambulance & track' },
  { id: 'driver', label: 'Driver', icon: '🚑', desc: 'Accept & navigate emergencies' },
  { id: 'hospital', label: 'Hospital', icon: '🏥', desc: 'Manage beds & patients' },
  { id: 'admin', label: 'Admin', icon: '🛡️', desc: 'Monitor all operations' },
];

const ROUTES: Record<Role, string> = {
  patient: '/patient', driver: '/driver', hospital: '/hospital', admin: '/admin',
};

export default function Login() {
  const [role, setRole] = useState<Role>('patient');
  const [loading, setLoading] = useState(false);
  const { login } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    login(role, '');
    toast.success('Welcome to MediRoute!');
    navigate(ROUTES[role]);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ecfdf5 0%, #f8fafc 50%, #eff6ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', background: '#059669', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>
            🚑
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>MediRoute</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Smart Ambulance Dispatch Platform</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select your role</p>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            {ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                style={{
                  padding: '14px 12px',
                  borderRadius: '12px',
                  border: `2px solid ${role === r.id ? '#059669' : '#e2e8f0'}`,
                  background: role === r.id ? '#ecfdf5' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{r.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: role === r.id ? '#059669' : '#0f172a' }}>{r.label}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.3', marginTop: '2px' }}>{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                defaultValue={`${role}@mediroute.in`}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8fafc', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                defaultValue="demo123"
                required
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8fafc', fontFamily: 'inherit' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#6ee7b7' : '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Signing in...' : `Sign in as ${ROLES.find(r => r.id === role)?.label}`}
            </button>
          </form>

          <div style={{ marginTop: '16px', background: '#f0fdf4', borderRadius: '10px', padding: '10px 14px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#059669', margin: 0 }}>🎯 Demo mode — click any role and sign in instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
