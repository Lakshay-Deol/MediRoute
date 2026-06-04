import React, { useState } from 'react';
import { Truck, MapPin, Star, Phone, Filter } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusDot, StatCard } from '../../components/ui/StatusDot';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { EMERGENCY_REQUESTS } from '../../data/mockData';

type Filter = 'all' | 'available' | 'busy' | 'offline';

export default function AmbulanceMonitoring() {
  const { ambulances } = useEmergencyStore();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = ambulances.filter(a => filter === 'all' || a.status === filter);

  const statusVariant = {
    available: 'green' as const,
    busy: 'orange' as const,
    offline: 'gray' as const,
  };

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Ambulance Fleet</h1>
            <p className="text-slate-500 text-sm mt-0.5">Monitor all ambulances in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status="active" />
            <span className="text-xs text-slate-500">Live tracking</span>
          </div>
        </div>

        {/* Fleet stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Available" value={ambulances.filter(a => a.status === 'available').length} icon={<Truck size={18} />} color="green" />
          <StatCard label="On Mission" value={ambulances.filter(a => a.status === 'busy').length} icon={<Truck size={18} />} color="orange" />
          <StatCard label="Offline" value={ambulances.filter(a => a.status === 'offline').length} icon={<Truck size={18} />} color="red" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'available', 'busy', 'offline'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border-2 transition-all capitalize ${
                filter === f
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              {f} {f === 'all' ? `(${ambulances.length})` : `(${ambulances.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Fleet table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Vehicle', 'Driver', 'Status', 'Location', 'Assignment', 'Rating', 'Contact'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(ambulance => {
                  const assignment = EMERGENCY_REQUESTS.find(r => r.assignedAmbulanceId === ambulance.id && r.status !== 'completed');
                  return (
                    <tr key={ambulance.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-800">{ambulance.vehicleNumber}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Truck size={10} /> Ambulance
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-700">{ambulance.driverName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusDot status={ambulance.status === 'available' ? 'active' : ambulance.status === 'busy' ? 'busy' : 'inactive'} />
                          <Badge variant={statusVariant[ambulance.status]} size="sm">
                            {ambulance.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={10} className="text-emerald-600" />
                          {ambulance.location.lat.toFixed(4)}, {ambulance.location.lng.toFixed(4)}
                        </div>
                        {ambulance.speed > 0 && (
                          <div className="text-xs text-orange-600 mt-0.5">{ambulance.speed} km/h</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {assignment ? (
                          <div>
                            <div className="font-medium text-slate-700">{assignment.patientName}</div>
                            <div className="text-slate-400">{assignment.emergencyType}</div>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-slate-700">
                          <Star size={10} className="fill-yellow-400 text-yellow-400" />
                          {ambulance.driverRating}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`tel:${ambulance.driverPhone}`}
                          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                          <Phone size={10} /> Call
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </RoleLayout>
  );
}
