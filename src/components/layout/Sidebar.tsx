import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Hospital, Users, Truck, Bell,
  BarChart3, BedDouble, Navigation, UserCircle, AlertTriangle,
  ClipboardList, Shield, X, Activity, PhoneCall,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/simulators';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  patient: [
    { label: 'Dashboard', path: '/patient', icon: <LayoutDashboard size={18} /> },
    { label: 'Emergency Request', path: '/patient/emergency', icon: <AlertTriangle size={18} /> },
    { label: 'Live Tracking', path: '/patient/tracking', icon: <MapPin size={18} /> },
    { label: 'Hospital Allocation', path: '/patient/hospitals', icon: <Hospital size={18} /> },
    { label: 'Medical Profile', path: '/patient/profile', icon: <UserCircle size={18} /> },
  ],
  driver: [
    { label: 'Dashboard', path: '/driver', icon: <LayoutDashboard size={18} /> },
    { label: 'Incoming Emergency', path: '/driver/incoming', icon: <PhoneCall size={18} /> },
    { label: 'Navigation', path: '/driver/navigation', icon: <Navigation size={18} /> },
    { label: 'Patient Info', path: '/driver/patient', icon: <Users size={18} /> },
    { label: 'Hospital Recommendation', path: '/driver/hospitals', icon: <Hospital size={18} /> },
  ],
  hospital: [
    { label: 'Dashboard', path: '/hospital', icon: <LayoutDashboard size={18} /> },
    { label: 'Bed Management', path: '/hospital/beds', icon: <BedDouble size={18} /> },
    { label: 'Incoming Emergency', path: '/hospital/incoming', icon: <Activity size={18} /> },
    { label: 'Staff Notifications', path: '/hospital/notifications', icon: <Bell size={18} /> },
    { label: 'Analytics', path: '/hospital/analytics', icon: <BarChart3 size={18} /> },
  ],
  admin: [
    { label: 'Command Center', path: '/admin', icon: <Shield size={18} /> },
    { label: 'Emergency Queue', path: '/admin/queue', icon: <ClipboardList size={18} /> },
    { label: 'Hospital Monitoring', path: '/admin/hospitals', icon: <Hospital size={18} /> },
    { label: 'Ambulance Fleet', path: '/admin/ambulances', icon: <Truck size={18} /> },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient Portal',
  driver: 'Driver Portal',
  hospital: 'Hospital Portal',
  admin: 'Control Center',
};

export const Sidebar: React.FC = () => {
  const { role, sidebarOpen, setSidebarOpen } = useAppStore();
  const location = useLocation();

  if (!role) return null;

  const items = NAV_ITEMS[role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-slate-100 z-30 flex flex-col transition-all duration-300 shadow-sm',
        sidebarOpen ? 'w-60' : 'w-0 lg:w-16',
        'overflow-hidden'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 min-h-[64px]">
          <div className={cn('flex items-center gap-2.5', !sidebarOpen && 'lg:justify-center')}>
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">MR</span>
            </div>
            {sidebarOpen && (
              <div>
                <div className="text-sm font-bold text-slate-800">MediRoute</div>
                <div className="text-xs text-slate-400">{ROLE_LABELS[role]}</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 lg:hidden">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800',
                  !sidebarOpen && 'lg:justify-center lg:px-2'
                )}
                onClick={() => setSidebarOpen(false)}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom role badge */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-100">
            <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center">
              <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">{role}</div>
              <div className="text-xs text-emerald-500 mt-0.5">Active Session</div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
