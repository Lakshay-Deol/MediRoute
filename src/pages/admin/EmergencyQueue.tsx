import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusDot } from '../../components/ui/StatusDot';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { getSeverityColor, getStatusDisplay, timeAgo } from '../../utils/simulators';

const TABS = ['All', 'Pending', 'Active', 'Completed'] as const;
type Tab = typeof TABS[number];

export default function EmergencyQueue() {
  const { requests } = useEmergencyStore();
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(new Date()), 3000);
    return () => clearInterval(timer);
  }, []);

  const filtered = requests.filter(r => {
    if (activeTab === 'Pending') return r.status === 'pending';
    if (activeTab === 'Active') return ['dispatched', 'en_route', 'arrived'].includes(r.status);
    if (activeTab === 'Completed') return r.status === 'completed';
    return true;
  });

  const counts = {
    All: requests.length,
    Pending: requests.filter(r => r.status === 'pending').length,
    Active: requests.filter(r => ['dispatched', 'en_route', 'arrived'].includes(r.status)).length,
    Completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Emergency Queue</h1>
            <p className="text-slate-500 text-sm mt-0.5">All emergency requests — managed in real-time</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw size={12} className="animate-spin" />
            Updated {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-md ${
                activeTab === tab ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Patient', 'Emergency', 'Severity', 'Status', 'Ambulance', 'Hospital', 'ETA', 'Time'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((req, index) => {
                  const severity = getSeverityColor(req.severity);
                  const status = getStatusDisplay(req.status);
                  return (
                    <tr key={req.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? '' : 'bg-white'}`}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-800">{req.patientName}</div>
                        <div className="text-xs text-slate-400">{req.patientAge} yrs · {req.patientBloodGroup}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 max-w-[150px] truncate">{req.emergencyType}</td>
                      <td className="px-4 py-3">
                        <Badge variant={req.severity === 'critical' ? 'red' : req.severity === 'high' ? 'orange' : req.severity === 'medium' ? 'yellow' : 'green'} size="sm" dot>
                          {req.severity}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{req.assignedAmbulanceId || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[100px] truncate">{req.assignedHospitalId ? 'AIIMS' : '—'}</td>
                      <td className="px-4 py-3 text-xs font-medium text-orange-600">{req.eta || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{timeAgo(req.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No {activeTab.toLowerCase()} emergencies</p>
            </div>
          )}
        </Card>
      </div>
    </RoleLayout>
  );
}
