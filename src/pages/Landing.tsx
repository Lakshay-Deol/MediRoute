import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, MapPin, Hospital, Zap, Shield, Clock, Phone,
  ChevronRight, Star, Users, Truck, ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const STATS = [
  { label: 'Lives Saved', value: 12847, suffix: '+' },
  { label: 'Hospitals Connected', value: 248, suffix: '' },
  { label: 'Avg Response Time', value: 8, suffix: ' min' },
  { label: 'Active Ambulances', value: 1200, suffix: '+' },
];

const FEATURES = [
  { icon: <Zap size={22} />, title: 'Instant SOS Dispatch', description: 'One tap emergency dispatch with GPS location auto-detection and nearest ambulance allocation.', color: 'bg-red-50 text-red-600' },
  { icon: <MapPin size={22} />, title: 'Real-Time GPS Tracking', description: 'Track your ambulance on a live map from dispatch to hospital arrival with ETA updates.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: <Hospital size={22} />, title: 'Smart Hospital Allocation', description: 'AI-powered bed availability matching ensures patients go to the most suitable hospital.', color: 'bg-blue-50 text-blue-600' },
  { icon: <Shield size={22} />, title: 'Medical Profile Safety', description: 'Drivers and hospitals instantly see your allergies, blood group and medications.', color: 'bg-purple-50 text-purple-600' },
  { icon: <Clock size={22} />, title: 'Fastest Route Navigation', description: 'Traffic-optimised routing gets ambulances to you 40% faster than traditional dispatch.', color: 'bg-orange-50 text-orange-600' },
  { icon: <Activity size={22} />, title: 'Live Hospital Dashboard', description: 'Hospitals see incoming patients in real-time and prepare the right care team in advance.', color: 'bg-teal-50 text-teal-600' },
];

const TESTIMONIALS = [
  { name: 'Dr. Priya Sharma', role: 'Emergency Physician, AIIMS Delhi', quote: 'MediRoute has transformed how we receive patients. We know exactly who is coming, their conditions, and can prepare in advance.', rating: 5 },
  { name: 'Rajesh Kumar', role: 'Ambulance Driver, Delhi 108', quote: 'The navigation and patient info features are outstanding. I spend less time figuring out routes and more time caring for the patient.', rating: 5 },
  { name: 'Sunita Agarwal', role: 'Patient, Recovered', quote: 'When I had my cardiac event, MediRoute got an ambulance to me in under 7 minutes. The tracking feature kept my family informed throughout.', rating: 5 },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1500;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + increment, target);
          setCount(Math.floor(current));
          if (current >= target) clearInterval(timer);
        }, duration / steps);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">MediRoute</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#stats" className="hover:text-emerald-600 transition-colors">Impact</a>
            <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Stories</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 bg-gradient-to-br from-emerald-50 via-white to-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-100 rounded-full opacity-30 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            India's fastest emergency response platform
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Emergency Care,
            <br />
            <span className="text-emerald-600">Minutes Matter.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            MediRoute connects patients with the nearest ambulance, allocates the best-fit hospital, and keeps everyone — family, driver, hospital — informed in real time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="emergency-pulse shadow-lg shadow-emerald-200">
                🆘 Request Emergency Help <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sign In to Dashboard <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Truck size={14} className="text-emerald-500" /> 1,200+ ambulances</span>
            <span className="flex items-center gap-1.5"><Hospital size={14} className="text-blue-500" /> 248 hospitals</span>
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-orange-500" /> 8 min avg response</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 bg-emerald-600">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="text-3xl md:text-4xl font-extrabold">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-emerald-100 text-sm mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Everything Emergency Medicine Needs</h2>
            <p className="text-slate-500 max-w-xl mx-auto">A unified platform connecting every link in the emergency response chain.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-md transition-all duration-200 group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">How MediRoute Works</h2>
            <p className="text-slate-500">From SOS to safe — in under 10 minutes.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Tap SOS', desc: 'Patient or bystander triggers emergency with one tap.', icon: '🆘' },
              { step: '02', title: 'Dispatch', desc: 'Nearest available ambulance is automatically notified.', icon: '🚑' },
              { step: '03', title: 'Track Live', desc: 'Real-time GPS tracking for patient, family, and hospital.', icon: '📍' },
              { step: '04', title: 'Optimal Care', desc: 'AI-matched hospital is ready when the patient arrives.', icon: '🏥' },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-14 h-14 bg-white border-2 border-emerald-200 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">{item.step}</div>
                <div className="text-sm font-semibold text-slate-800 mb-1">{item.title}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Real Stories, Real Impact</h2>
            <p className="text-slate-500">From doctors to drivers to patients — hear from the MediRoute community.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array(t.rating).fill(null).map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{t.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-emerald-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to join the network?</h2>
          <p className="text-emerald-100 mb-8">Whether you're a patient, driver, hospital, or administrator — MediRoute has a role for you.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="secondary" size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 border-none">
                Create Free Account <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg" className="text-white border border-emerald-400 hover:bg-emerald-700">
                Sign In <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Activity size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">MediRoute</span>
          </div>
          <div className="text-xs">© 2025 MediRoute. Smart Ambulance Dispatch & Hospital Allocation System.</div>
          <div className="flex items-center gap-1 text-xs">
            <Phone size={12} className="text-emerald-500" />
            <span>Emergency: <span className="text-white font-semibold">108</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
