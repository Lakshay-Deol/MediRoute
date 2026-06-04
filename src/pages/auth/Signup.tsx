import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Truck, Building2, Shield, ArrowRight, ArrowLeft, Activity, CheckCircle } from 'lucide-react';
import type { Role } from '../../data/mockData';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 'patient' as Role, label: 'Patient', description: 'Request emergency ambulance services', icon: <User size={24} />, color: 'bg-blue-50 border-blue-200 text-blue-600' },
  { id: 'driver' as Role, label: 'Ambulance Driver', description: 'Respond to emergency calls', icon: <Truck size={24} />, color: 'bg-orange-50 border-orange-200 text-orange-600' },
  { id: 'hospital' as Role, label: 'Hospital Staff', description: 'Manage beds & incoming patients', icon: <Building2 size={24} />, color: 'bg-purple-50 border-purple-200 text-purple-600' },
  { id: 'admin' as Role, label: 'Admin / Control', description: 'Emergency operations center', icon: <Shield size={24} />, color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
];

const ROLE_ROUTES: Record<Role, string> = {
  patient: '/patient', driver: '/driver', hospital: '/hospital', admin: '/admin',
};

export default function Signup() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role>('patient');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    login(selectedRole, form.email);
    toast.success('Account created! Welcome to MediRoute 🎉');
    navigate(ROLE_ROUTES[selectedRole]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">MediRoute</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Join MediRoute emergency network</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 flex-1 ${s < step ? 'text-emerald-600' : s === step ? 'text-emerald-600' : 'text-slate-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  s < step ? 'bg-emerald-600 border-emerald-600 text-white' :
                  s === step ? 'border-emerald-600 text-emerald-600 bg-white' :
                  'border-slate-200 text-slate-300 bg-white'
                }`}>
                  {s < step ? <CheckCircle size={14} /> : s}
                </div>
                <span className="text-xs font-medium hidden sm:block">
                  {s === 1 ? 'Select Role' : 'Your Details'}
                </span>
              </div>
              {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-emerald-600' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          {step === 1 ? (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-4">I am a...</p>
              <div className="space-y-3">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                      selectedRole === role.id
                        ? `${role.color} border-current shadow-sm`
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === role.id ? role.color : 'bg-slate-100 text-slate-500'}`}>
                      {role.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{role.label}</div>
                      <div className="text-xs text-slate-500">{role.description}</div>
                    </div>
                    {selectedRole === role.id && (
                      <CheckCircle size={18} className="ml-auto text-emerald-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <Button variant="primary" size="lg" className="w-full mt-5" onClick={() => setStep(2)}>
                Continue <ArrowRight size={16} />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Your full name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="+91 98765 43210" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Min. 8 characters" minLength={6} required />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">
                  {!loading && <CheckCircle size={16} />} Create Account
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
