import React, { useState } from 'react';
import { Shield, Activity, Truck, Hospital, AlertTriangle, X } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusDot, StatCard } from '../../components/ui/StatusDot';
import { LiveMap } from '../../components/map/LiveMap';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { useAmbulanceSimulator, getSeverityColor } from '../../utils/simulators';

const PATIENT_LOCATION = { lat: 28.5530, lng: 77.2050 };

export default function CommandDashboard() {
  const { ambulances, hospitals, requests } = useEmergencyStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useAmbulanceSimulator('a1', PATIENT_LOCATION.lat, PATIENT_LOCATION.lng);

  const activeRequests = requests.filter(r => ['pending', 'dispatched', 'en_route'].includes(r.status));
  const availableAmbulances = ambulances.filter(a => a.status === 'available').length;
  const busyAmbulances = ambulances.filter(a => a.status === 'busy').length;

  const allMarkers = [
    ...ambulances.filter(a => a.status !== 'offline').map(a => ({
      type: 'ambulance' as const,
      position: a.location,
      label: `${a.vehicleNumber} – ${a.driverName}`,
      info: `Status: ${a.status}`,
    })),
    ...requests.filter(r => r.status === 'pending').map(r => ({
      type: 'patient' as const,
      position: r.location,
      label: r.patientName,
      info: `${r.emergencyType} – ${r.severity}`,
    })),
    ...hospitals.map(h => ({
      type: 'hospital' as const,
      position: h.location,
      label: h.name,
      info: `${h.availableBeds} beds available`,
    })),
  ];

  return (
    <RoleLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Command Center</h1>
            <p className="text-slate-500 text-sm mt-0.5">Live overview of all emergency operations</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status="active" />
            <span className="text-xs font-medium text-slate-600">All systems operational</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Emergencies" value={activeRequests.length} icon={<AlertTriangle size={18} />} color="red" />
          <StatCard label="Ambulances Available" value={availableAmbulances} icon={<Truck size={18} />} color="green" />
          <StatCard label="Busy Ambulances" value={busyAmbulances} icon={<Truck size={18} />} color="orange" />
          <StatCard label="Hospitals Online" value={hospitals.length} icon={<Hospital size={18} />} color="blue" />
        </div>

        {/* Main map + sidebar */}
        <div className="flex gap-4">
          {/* Map */}
          <div className="flex-1">
            <LiveMap
              center={{ lat: 28.5600, lng: 77.2050 }}
              zoom={13}
              markers={allMarkers}
              height="calc(100vh - 280px)"
              className="min-h-[420px]"
            />
          </div>

          {/* Live sidebar */}
          <div className={`${sidebarCollapsed ? 'hidden' : 'w-72'} space-y-3 overflow-y-auto`} style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {/* Active emergencies */}
            <Card padding="sm">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                Active Emergencies
              </div>
              <div className="space-y-2">
                {activeRequests.map(req => {
                  const sev = getSeverityColor(req.severity);
                  return (
                    <div key={req.id} className={`p-2.5 rounded-xl border ${sev.bg} ${sev.border}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-xs font-bold ${sev.text}`}>{req.emergencyType}</span>
                      </div>
                      <div className="text-xs text-slate-600">{req.patientName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ETA: {req.eta || '—'}</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Ambulance status */}
            <Card padding="sm">
              <div className="text-xs font-bold text-slate-700 mb-2">Ambulance Fleet</div>
              <div className="space-y-1.5">
                {ambulances.map(a => (
                  <div key={a.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 truncate">{a.driverName.split(' ')[0]}</span>
                    <Badge
                      variant={a.status === 'available' ? 'green' : a.status === 'busy' ? 'orange' : 'gray'}
                      size="sm"
                    >
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Hospital capacity */}
            <Card padding="sm">
              <div className="text-xs font-bold text-slate-700 mb-2">Hospital Capacity</div>
              <div className="space-y-2">
                {hospitals.map(h => {
                  const pct = Math.round((h.availableBeds / h.totalBeds) * 100);
                  return (
                    <div key={h.id}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-slate-600 truncate">{h.name.split(' ')[0]}</span>
                        <span className={`font-medium ${pct < 20 ? 'text-red-600' : 'text-emerald-600'}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div
                          className={`h-full rounded-full ${pct < 20 ? 'bg-red-500' : pct < 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
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
