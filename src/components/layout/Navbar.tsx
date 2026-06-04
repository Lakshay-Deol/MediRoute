import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

const ROLE_COLORS: Record<string, string> = {
  patient: '#3b82f6',
  driver: '#f59e0b',
  hospital: '#8b5cf6',
  admin: '#059669',
};

export default function Navbar() {
  const { user, role, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  if (!user) return null;

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '34px', height: '34px', background: '#059669', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🚑</div>
        <span style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a' }}>MediRoute</span>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          padding: '4px 10px',
          background: ROLE_COLORS[role || 'patient'] + '15',
          color: ROLE_COLORS[role || 'patient'],
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {role}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '700' }}>
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{user.name.split(' ')[0]}</span>
        </div>

        <button
          onClick={handleLogout}
          style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '13px', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
