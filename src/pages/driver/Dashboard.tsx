import React, { useState } from 'react';
import { Truck, Clock, Star, DollarSign, CheckCircle, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard, StatusDot } from '../../components/ui/StatusDot';
import { Button } from '../../components/ui/Button';
import { DRIVERS, EMERGENCY_REQUESTS } from '../../data/mockData';
import { getStatusDisplay, getSeverityColor, timeAgo } from '../../utils/simulators';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DriverDashboard() {
  const driver = DRIVERS[0];
  const [isOnline, setIsOnline] = useState(driver.isOnline);

  const toggleOnline = () => {
    setIsOnline(prev => {
      const next = !prev;
      toast.success(next ? '🟢 You are now online and available' : '🔴 You are now offline');
      return next;
    });
  };

  const completedTrips = EMERGENCY_REQUESTS.filter(r => r.status === 'completed');
  const activeTrip = EMERGENCY_REQUESTS.find(r => r.assignedAmbulanceId === 'a1' && r.status === 'en_route');

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Driver Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Welcome back, {driver.name.split(' ')[0]}</p>
          </div>
          <button
            onClick={toggleOnline}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
              isOnline
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {isOnline ? <ToggleRight size={20} className="text-emerald-600" /> : <ToggleLeft size={20} />}
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Online status banner */}
        {isOnline && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusDot status="active" />
              <div>
                <div className="text-sm font-semibold text-emerald-800">Accepting Emergencies</div>
                <div className="text-xs text-emerald-600">You'll receive alerts for nearby emergencies</div>
              </div>
            </div>
            <Link to="/driver/incoming">
              <Button variant="primary" size="sm">View Incoming</Button>
            </Link>
          </div>
        )}

        {/* Active trip */}
        {activeTrip && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <StatusDot status="active" />
              <span className="text-sm font-semibold">Active Trip</span>
            </div>
            <div className="text-base font-bold mb-1">{activeTrip.emergencyType}</div>
            <div className="text-orange-100 text-sm mb-3">{activeTrip.patientName} · {activeTrip.address}</div>
            <div className="flex gap-3">
              <Link to="/driver/navigation">
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                  <MapPin size={14} /> Navigate
                </button>
              </Link>
              <Link to="/driver/patient">
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                  Patient Info
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Today's Earnings" value={`₹${driver.earningsToday.toLocaleString()}`} icon={<DollarSign size={18} />} color="green" />
          <StatCard label="This Week" value={`₹${driver.earningsWeek.toLocaleString()}`} icon={<DollarSign size={18} />} color="blue" />
          <StatCard label="Total Trips" value={driver.totalTrips} icon={<Truck size={18} />} color="orange" />
          <StatCard label="Rating" value={driver.rating} icon={<Star size={18} />} color="purple" trend={{ value: '0.2', up: true }} />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Driver profile */}
          <Card>
            <CardHeader title="My Profile" icon={<Truck size={16} />} />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                {driver.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="text-base font-bold text-slate-800">{driver.name}</div>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Star size={13} className="fill-yellow-400 text-yellow-400" />
                  {driver.rating} rating
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Vehicle', value: driver.vehicleNumber },
                { label: 'License', value: driver.licenseNumber },
                { label: 'Phone', value: driver.phone },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">{item.label}</span>
                  <span className="text-slate-700 font-medium text-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent trips */}
          <Card>
            <CardHeader title="Recent Trips" subtitle={`${completedTrips.length} completed`} />
            <div className="space-y-3">
              {completedTrips.map(trip => {
                const severity = getSeverityColor(trip.severity);
                return (
                  <div key={trip.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${severity.bg}`}>
                      <CheckCircle size={14} className={severity.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-800">{trip.emergencyType}</div>
                      <div className="text-xs text-slate-500 truncate">{trip.patientName}</div>
                      <div className="text-xs text-slate-400">{timeAgo(trip.createdAt)}</div>
                    </div>
                    <Badge variant="green" size="sm">Done</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </RoleLayout>
  );
}
