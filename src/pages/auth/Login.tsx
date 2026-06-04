import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Truck, Building2, Shield, Eye, EyeOff, ArrowRight, Activity } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Role } from '../../data/mockData';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const ROLES: { id: Role; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { id: 'patient', label: 'Patient', description: 'Request emergency ambulance', icon: <User size={20} />, color: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-400' },
  { id: 'driver', label: 'Driver', description: 'Respond to emergencies', icon: <Truck size={20} />, color: 'border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-400' },
  { id: 'hospital', label: 'Hospital', description: 'Manage beds & incoming patients', icon: <Building2 size={20} />, color: 'border-purple-200 bg-purple-50 text-purple-700 hover:border-purple-400' },
  { id: 'admin', label: 'Admin', description: 'Control center operations', icon: <Shield size={20} />, color: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400' },
];

const DEMO_CREDS: Record<Role, { email: string; password: string }> = {
  patient: { email: 'arjun@email.com', password: 'demo123' },
  driver: { email: 'rajesh@mediroute.in', password: 'demo123' },
  hospital: { email: 'admin@aiims.edu', password: 'demo123' },
  admin: { email: 'admin@mediroute.in', password: 'demo123' },
};

const ROLE_ROUTES: Record<Role, string> = {
  patient: '/patient',
  driver: '/driver',
  hospital: '/hospital',
  admin: '/admin',
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<Role>('patient');
  const [email, setEmail] = useState(DEMO_CREDS.patient.email);
  const [password, setPassword] = useState(DEMO_CREDS.patient.password);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAppStore();
  const navigate = useNavigate();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setEmail(DEMO_CREDS[role].email);
    setPassword(DEMO_CREDS[role].password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    login(selectedRole, email);
    toast.success(`Welcome to MediRoute!`);
    navigate(ROLE_ROUTES[selectedRole]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">MediRoute</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-3">Select your role</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                    selectedRole === role.id
                      ? `${role.color} border-current shadow-sm`
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={selectedRole === role.id ? '' : 'text-slate-400'}>{role.icon}</span>
                  <div>
                    <div className="text-xs font-semibold">{role.label}</div>
                    <div className="text-xs opacity-70 leading-tight">{role.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Forgot password?</a>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              {!loading && <ArrowRight size={16} />}
              Sign In as {ROLES.find(r => r.id === selectedRole)?.label}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-4 bg-emerald-50 rounded-xl p-3">
            <p className="text-xs text-emerald-700 text-center font-medium">
              🎯 Demo mode — credentials auto-filled for selected role
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
