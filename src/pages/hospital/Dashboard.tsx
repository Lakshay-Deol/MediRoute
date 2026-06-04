import React from 'react';
import { BedDouble, Activity, Truck, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard, StatusDot } from '../../components/ui/StatusDot';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { useBedSimulator, getSeverityColor, timeAgo } from '../../utils/simulators';

const HOSPITAL_ID = 'h1';

export default function HospitalDashboard() {
  const { hospitals, requests, ambulances } = useEmergencyStore();
  useBedSimulator();

  const hospital = hospitals.find(h => h.id === HOSPITAL_ID)!;
  const incomingRequests = requests.filter(r => r.assignedHospitalId === HOSPITAL_ID && ['dispatched', 'en_route'].includes(r.status));
  const pendingRequests = requests.filter(r => r.status === 'pending');

  const bedOccupancyPct = hospital ? Math.round(((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds) * 100) : 0;

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">AIIMS Delhi – Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Real-time hospital operations overview</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status="active" />
            <span className="text-xs text-slate-600 font-medium">Live Updates</span>
          </div>
        </div>

        {/* Incoming alert */}
        {incomingRequests.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center">
                <AlertTriangle size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-orange-800">{incomingRequests.length} Patient(s) Incoming</div>
                <div className="text-xs text-orange-600">Prepare emergency team immediately</div>
              </div>
            </div>
            <Link to="/hospital/incoming">
              <Button variant="primary" size="sm">View Details <ChevronRight size={14} /></Button>
            </Link>
          </div>
        )}

        {/* Bed stats */}
        {hospital && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Available Beds"
              value={hospital.availableBeds}
              sub={`of ${hospital.totalBeds} total`}
              icon={<BedDouble size={18} />}
              color={hospital.availableBeds < 20 ? 'red' : 'green'}
              trend={{ value: `${bedOccupancyPct}% occupied`, up: bedOccupancyPct > 80 }}
            />
            <StatCard
              label="ICU Available"
              value={hospital.icuAvailable}
              sub={`of ${hospital.icuTotal} total`}
              icon={<Activity size={18} />}
              color={hospital.icuAvailable < 5 ? 'red' : 'blue'}
            />
            <StatCard
              label="Ventilators"
              value={hospital.ventilatorsAvailable}
              sub={`of ${hospital.ventilatorsTotal} total`}
              icon={<Activity size={18} />}
              color={hospital.ventilatorsAvailable < 3 ? 'red' : 'orange'}
            />
            <StatCard
              label="Incoming Patients"
              value={incomingRequests.length}
              sub="right now"
              icon={<Truck size={18} />}
              color={incomingRequests.length > 2 ? 'red' : 'purple'}
            />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          {/* Incoming patients */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader title="Incoming Patients" subtitle="Live ambulance arrivals"
                action={<Link to="/hospital/incoming"><Button variant="ghost" size="sm">View All</Button></Link>} />
              {incomingRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No patients currently incoming</div>
              ) : (
                <div className="space-y-3">
                  {incomingRequests.map(req => {
                    const severity = getSeverityColor(req.severity);
                    const ambulance = ambulances.find(a => a.id === req.assignedAmbulanceId);
                    return (
                      <div key={req.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${severity.bg}`}>
                          <AlertTriangle size={14} className={severity.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-sm font-medium text-slate-800">{req.patientName}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${severity.bg} ${severity.text}`}>{req.severity}</span>
                          </div>
                          <div className="text-xs text-slate-500">{req.emergencyType} · Blood: <span className="font-bold text-red-600">{req.patientBloodGroup}</span></div>
                          {ambulance && <div className="text-xs text-slate-400 mt-0.5">🚑 {ambulance.driverName} · ETA: {req.eta}</div>}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                          <Clock size={11} /> {req.eta || '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <Card>
              <CardHeader title="Quick Actions" />
              <div className="space-y-2">
                {[
                  { label: 'Bed Management', path: '/hospital/beds', icon: <BedDouble size={15} />, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Staff Notifications', path: '/hospital/notifications', icon: <AlertTriangle size={15} />, color: 'text-orange-600 bg-orange-50' },
                  { label: 'Analytics', path: '/hospital/analytics', icon: <Activity size={15} />, color: 'text-purple-600 bg-purple-50' },
                ].map(action => (
                  <Link key={action.path} to={action.path}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>{action.icon}</div>
                      <span className="text-sm font-medium text-slate-700 flex-1">{action.label}</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Pending queue */}
            <Card>
              <CardHeader title="Pending Queue" subtitle="Unassigned requests" />
              {pendingRequests.slice(0, 3).map(req => {
                const severity = getSeverityColor(req.severity);
                return (
                  <div key={req.id} className="flex items-center gap-2 py-2 border-b border-slate-50 last:border-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${severity.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-700 truncate">{req.emergencyType}</div>
                      <div className="text-xs text-slate-400">{timeAgo(req.createdAt)}</div>
                    </div>
                    <Badge variant="yellow" size="sm">Pending</Badge>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
