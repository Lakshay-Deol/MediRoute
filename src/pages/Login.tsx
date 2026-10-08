import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { Role } from '../data/mockData';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  User as UserIcon,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Activity,
  HeartPulse,
} from 'lucide-react';

const ROLES: { id: Role; label: string; icon: string; desc: string }[] = [
  { id: 'patient', label: 'Patient', icon: '🧑‍⚕️', desc: 'Request ambulance & track live ETA' },
  { id: 'driver', label: 'Driver', icon: '🚑', desc: 'Accept dispatches & route to patient' },
  { id: 'hospital', label: 'Hospital', icon: '🏥', desc: 'Manage ICU, emergency beds & triage' },
];

const ROUTES: Record<Role, string> = {
  patient: '/patient',
  driver: '/driver',
  hospital: '/hospital',
};

const DEMO_ACCOUNTS = [
  {
    role: 'patient' as Role,
    label: 'Patient Portal',
    badge: 'Emergency SOS & Live ETA',
    email: 'patient@mediroute.in',
    pass: 'Password123!',
    name: 'Arjun Mehta',
    icon: '🧑‍⚕️',
    color: '#059669',
  },
  {
    role: 'driver' as Role,
    label: 'Ambulance Driver',
    badge: 'Live GPS & Route Navigation',
    email: 'driver@mediroute.in',
    pass: 'Password123!',
    name: 'Rajesh Kumar',
    icon: '🚑',
    color: '#d97706',
  },
  {
    role: 'hospital' as Role,
    label: 'Hospital Operations',
    badge: 'ICU & Emergency Bed Control',
    email: 'hospital@mediroute.in',
    pass: 'Password123!',
    name: 'AIIMS Delhi Control',
    icon: '🏥',
    color: '#7c3aed',
  },
];

export default function Login() {
  const [activeTab, setActiveTab] = useState<'mail' | 'demo'>('mail');
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

  // Redirect if already logged in
  useEffect(() => {
    checkAuth().then((authed) => {
      if (authed && currentRole) {
        navigate(ROUTES[currentRole], { replace: true });
      }
    });
  }, [currentRole, navigate, checkAuth]);

  // One-click demo login
  const selectDemoAccount = async (demo: typeof DEMO_ACCOUNTS[0]) => {
    setRole(demo.role);
    setEmail(demo.email);
    setPassword(demo.pass);
    setErrorMessage('');

    try {
      setLoading(true);
      const user = await login({ email: demo.email, password: demo.pass });
      toast.success(`Welcome to ${demo.label}, ${user.name}!`);
      navigate(ROUTES[user.role]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Mail form submission
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
        toast.success(`Account registered! Welcome to MediRoute, ${user.name}`);
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
      padding: '32px 16px',
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

        {/* Main Tab Toggle: Mail Authentication vs 1-Click Demo */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: '#e2e8f0',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '20px',
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('mail'); setErrorMessage(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'mail' ? '#ffffff' : 'transparent',
              color: activeTab === 'mail' ? '#059669' : '#64748b',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'mail' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Mail size={16} />
            <span>Mail Authentication</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('demo'); setErrorMessage(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'demo' ? '#ffffff' : 'transparent',
              color: activeTab === 'demo' ? '#059669' : '#64748b',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'demo' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={16} />
            <span>1-Click Demo</span>
          </button>
        </div>

        {/* Card Container */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '30px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
        }}>

          {/* TAB 1: MAIL AUTHENTICATION */}
          {activeTab === 'mail' && (
            <div>
              {/* Sign In vs Register sub-toggle */}
              <div style={{
                display: 'flex',
                background: '#f1f5f9',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '20px',
              }}>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '9px',
                    border: 'none',
                    background: mode === 'login' ? '#ffffff' : 'transparent',
                    color: mode === 'login' ? '#0f172a' : '#64748b',
                    fontWeight: '600',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Mail Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMessage(''); }}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '9px',
                    border: 'none',
                    background: mode === 'register' ? '#ffffff' : 'transparent',
                    color: mode === 'register' ? '#0f172a' : '#64748b',
                    fontWeight: '600',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: mode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* Error Message */}
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
                  marginBottom: '16px',
                  border: '1px solid #fecaca',
                }}>
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Quick Fill Pills for testing */}
              {mode === 'login' && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginBottom: '18px',
                }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Quick Fill Test Credentials:
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {DEMO_ACCOUNTS.map((d) => (
                      <button
                        key={d.role}
                        type="button"
                        onClick={() => {
                          setEmail(d.email);
                          setPassword(d.pass);
                          setErrorMessage('');
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: email === d.email ? '1px solid #059669' : '1px solid #cbd5e1',
                          background: email === d.email ? '#ecfdf5' : '#ffffff',
                          color: email === d.email ? '#059669' : '#475569',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        {d.icon} {d.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Selection for Registration */}
              {mode === 'register' && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                    Select Your Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        style={{
                          padding: '10px 6px',
                          borderRadius: '10px',
                          border: `2px solid ${role === r.id ? '#059669' : '#e2e8f0'}`,
                          background: role === r.id ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '20px', marginBottom: '2px' }}>{r.icon}</div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: role === r.id ? '#059669' : '#0f172a' }}>
                          {r.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form */}
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
                          outline: 'none',
                          boxSizing: 'border-box',
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
                        outline: 'none',
                        boxSizing: 'border-box',
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
                        outline: 'none',
                        boxSizing: 'border-box',
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
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In with Email' : 'Create MediRoute Account'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: INSTANT DEMO ACCOUNTS */}
          {activeTab === 'demo' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>
                  1-Click Role Portals
                </h3>
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                  Click launch to instantly access any role dashboard with full live simulation data:
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                {DEMO_ACCOUNTS.map((demo) => (
                  <div
                    key={demo.role}
                    onClick={() => !loading && selectDemoAccount(demo)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '14px',
                      border: '1.5px solid #e2e8f0',
                      background: '#f8fafc',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = demo.color;
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${demo.color}18`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '26px' }}>{demo.icon}</span>
                      <div>
                        <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#0f172a' }}>
                          {demo.label}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                          {demo.name} • <span style={{ color: demo.color, fontWeight: '600' }}>{demo.badge}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={loading}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: demo.color,
                        color: '#ffffff',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>Launch</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '12.5px',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>Connected to live dispatch state, real-time map GPS & hospital ICU registry.</span>
              </div>
            </div>
          )}

          {/* Secure Badge */}
          <div style={{
            marginTop: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '12px',
          }}>
            <ShieldCheck size={14} color="#059669" />
            <span>Secured with JWT authentication & encrypted password hashing</span>
          </div>

        </div>
      </div>
    </div>
  );
}
