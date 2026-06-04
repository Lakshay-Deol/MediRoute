import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, MapPin, Hospital, Clock, ChevronRight,
  Activity, Heart, Phone, FileText, Zap,
} from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusDot, StatCard } from '../../components/ui/StatusDot';
import { Button } from '../../components/ui/Button';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { getStatusDisplay, getSeverityColor, timeAgo } from '../../utils/simulators';
import { PATIENT_PROFILE } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { requests } = useEmergencyStore();
  const patientRequests = requests.filter(r => r.patientId === 'p1');
  const activeRequest = patientRequests.find(r => ['pending', 'dispatched', 'en_route', 'arrived'].includes(r.status));

  const handleSOS = () => {
    toast.success('🚑 SOS dispatched! An ambulance is on the way.', { duration: 5000 });
  };

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Welcome, {PATIENT_PROFILE.name.split(' ')[0]} 👋</h1>
            <p className="text-slate-500 text-sm mt-0.5">Your health, our priority</p>
          </div>
          <Link to="/patient/emergency">
            <Button variant="danger" size="lg" className="emergency-pulse">
              <Zap size={18} /> Emergency SOS
            </Button>
          </Link>
        </div>

        {/* Active emergency */}
        {activeRequest && (
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StatusDot status="active" />
                <span className="font-semibold text-sm">Active Emergency</span>
              </div>
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-medium">
                {getStatusDisplay(activeRequest.status).label}
              </span>
            </div>
            <div className="text-base font-bold mb-1">{activeRequest.emergencyType}</div>
            <div className="text-emerald-100 text-sm mb-4">{activeRequest.address}</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Clock size={14} /> ETA: {activeRequest.eta || '—'}
              </div>
              <Link to="/patient/tracking">
                <button className="flex items-center gap-1.5 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-colors">
                  Track Live <ChevronRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Emergencies" value={patientRequests.length} icon={<Activity size={18} />} color="green" />
          <StatCard label="Completed" value={patientRequests.filter(r => r.status === 'completed').length} icon={<Heart size={18} />} color="blue" />
          <StatCard label="Avg Response" value="7 min" icon={<Clock size={18} />} color="orange" />
          <StatCard label="Hospitals Used" value="3" icon={<Hospital size={18} />} color="purple" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick actions */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader title="Quick Actions" />
              <div className="space-y-2">
                {[
                  { label: 'Request Emergency', path: '/patient/emergency', icon: <AlertTriangle size={16} />, color: 'text-red-600 bg-red-50' },
                  { label: 'Track Ambulance', path: '/patient/tracking', icon: <MapPin size={16} />, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Find Hospital', path: '/patient/hospitals', icon: <Hospital size={16} />, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Medical Profile', path: '/patient/profile', icon: <FileText size={16} />, color: 'text-purple-600 bg-purple-50' },
                ].map(action => (
                  <Link key={action.path} to={action.path}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                        {action.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-700 flex-1">{action.label}</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Medical summary */}
            <Card>
              <CardHeader title="Health Summary" icon={<Heart size={16} />} />
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-500">Blood Group</span>
                  <Badge variant="red" size="md">{PATIENT_PROFILE.bloodGroup}</Badge>
                </div>
                {PATIENT_PROFILE.allergies.slice(0, 2).map(a => (
                  <div key={a} className="flex items-center gap-2 py-1">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    <span className="text-xs text-slate-600">{a} allergy</span>
                  </div>
                ))}
                {PATIENT_PROFILE.chronicConditions.map(c => (
                  <div key={c} className="flex items-center gap-2 py-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span className="text-xs text-slate-600">{c}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Emergency history */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader title="Emergency History" subtitle={`${patientRequests.length} total requests`} />
              <div className="space-y-3">
                {patientRequests.map(req => {
                  const status = getStatusDisplay(req.status);
                  const severity = getSeverityColor(req.severity);
                  return (
                    <div key={req.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${severity.bg}`}>
                        <AlertTriangle size={14} className={severity.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-slate-800">{req.emergencyType}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${severity.bg} ${severity.text}`}>
                            {req.severity}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">{req.address}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{timeAgo(req.createdAt)}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${status.bg} ${status.text} flex-shrink-0`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
