import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { Role } from '../data/mockData';
import toast from 'react-hot-toast';
import { ShieldCheck, User as UserIcon, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

const ROLES: { id: Role; label: string; icon: string; desc: string }[] = [
  { id: 'patient', label: 'Patient', icon: '🧑‍⚕️', desc: 'Request ambulance & track live ETA' },
  { id: 'driver', label: 'Driver', icon: '🚑', desc: 'Accept dispatches & route to patient' },
  { id: 'hospital', label: 'Hospital', icon: '🏥', desc: 'Manage ICU, emergency beds & triage' },
  { id: 'admin', label: 'Admin', icon: '🛡️', desc: 'Unified control & fleet command' },
];

const ROUTES: Record<Role, string> = {
  patient: '/patient',
  driver: '/driver',
  hospital: '/hospital',
  admin: '/admin',
};

const DEMO_ACCOUNTS = [
  { role: 'patient' as Role, label: 'Patient', email: 'patient@mediroute.in', pass: 'Password123!', name: 'Arjun Mehta' },
  { role: 'driver' as Role, label: 'Driver', email: 'driver@mediroute.in', pass: 'Password123!', name: 'Rajesh Kumar' },
  { role: 'hospital' as Role, label: 'Hospital', email: 'hospital@mediroute.in', pass: 'Password123!', name: 'AIIMS Delhi' },
  { role: 'admin' as Role, label: 'Admin', email: 'admin@mediroute.in', pass: 'Password123!', name: 'System Admin' },
];

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<Role>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('patient@mediroute.in');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, register, isAuthenticated, role: currentRole, checkAuth } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to their role dashboard
  useEffect(() => {
    checkAuth().then((authed) => {
      if (authed && currentRole) {
        navigate(ROUTES[currentRole], { replace: true });
      }
    });
  }, [currentRole, navigate, checkAuth]);

  const selectDemoAccount = async (demo: typeof DEMO_ACCOUNTS[0]) => {
    setMode('login');
    setRole(demo.role);
    setEmail(demo.email);
    setPassword(demo.pass);
    setErrorMessage('');
    
    // Auto-login with demo credentials
    try {
      setLoading(true);
      const user = await login({ email: demo.email, password: demo.pass });
      toast.success(`Welcome back, ${user.name}!`);
      navigate(ROUTES[user.role]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await login({ email: email.trim(), password });
        toast.success(`Welcome back, ${user.name}!`);
        navigate(ROUTES[user.role]);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        const user = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        });
        toast.success(`Account created! Welcome, ${user.name}`);
        navigate(ROUTES[user.role]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, #ecfdf5 0%, #f8fafc 60%, #eff6ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: '28px',
            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.25)',
          }}>
            🚑
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            MediRoute
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Smart Emergency Dispatch & Medical Response Network
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
        }}>

          {/* Mode Switch Tabs */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '24px',
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '9px',
                border: 'none',
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? '#0f172a' : '#64748b',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '9px',
                border: 'none',
                background: mode === 'register' ? '#ffffff' : 'transparent',
                color: mode === 'register' ? '#0f172a' : '#64748b',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#fef2f2',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '18px',
              border: '1px solid #fecaca',
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Logins Banner */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={14} color="#059669" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Instant Real Demo Logins
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => selectDemoAccount(demo)}
                  disabled={loading}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #86efac',
                    background: email === demo.email ? '#059669' : '#ffffff',
                    color: email === demo.email ? '#ffffff' : '#15803d',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Registration Role Selector */}
          {mode === 'register' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                Choose Your Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: `2px solid ${role === r.id ? '#059669' : '#e2e8f0'}`,
                      background: role === r.id ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '18px', marginBottom: '2px' }}>{r.icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: role === r.id ? '#059669' : '#0f172a' }}>
                      {r.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Priya Sen"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#000000',
                      outline: 'none',
                      background: '#ffffff',
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mediroute.in"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#000000',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 38px 11px 38px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#000000',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#6ee7b7' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Secure Badge */}
          <div style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '12px',
          }}>
            <ShieldCheck size={14} color="#059669" />
            <span>Secured with JWT tokens & bcrypt password hashing</span>
          </div>

        </div>
      </div>
    </div>
  );
}
