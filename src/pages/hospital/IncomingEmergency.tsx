import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, Phone, Activity } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LiveMap } from '../../components/map/LiveMap';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { useAmbulanceSimulator, getSeverityColor } from '../../utils/simulators';
import { PATIENT_PROFILE } from '../../data/mockData';
import toast from 'react-hot-toast';

const HOSPITAL_LOCATION = { lat: 28.5672, lng: 77.2100 };
const PATIENT_LOCATION = { lat: 28.5530, lng: 77.2050 };

function ETACounter({ seconds: init }: { seconds: number }) {
  const [s, setS] = useState(init);
  useEffect(() => {
    const t = setInterval(() => setS(x => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return <span className="text-2xl font-bold text-orange-600">{m}:{sec.toString().padStart(2, '0')}</span>;
}

export default function HospitalIncomingEmergency() {
  const { requests, ambulances } = useEmergencyStore();
  const incomingRequest = requests.find(r => r.assignedHospitalId === 'h1' && r.status === 'en_route');
  const ambulance = ambulances.find(a => a.id === 'a1');
  const [teamReady, setTeamReady] = useState({ doctor: false, nurse: false, icu: false, blood: false });

  useAmbulanceSimulator('a1', HOSPITAL_LOCATION.lat, HOSPITAL_LOCATION.lng);

  const markers = [
    ...(ambulance ? [{ type: 'ambulance' as const, position: ambulance.location, label: `Ambulance – ${ambulance.vehicleNumber}`, info: `ETA: ${incomingRequest?.eta}` }] : []),
    { type: 'hospital' as const, position: HOSPITAL_LOCATION, label: 'AIIMS Delhi', info: 'Your location' },
    { type: 'patient' as const, position: PATIENT_LOCATION, label: 'Pickup Point', info: incomingRequest?.address },
  ];

  const toggleTeam = (key: keyof typeof teamReady) => {
    setTeamReady(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (!prev[key]) toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} team notified!`);
      return next;
    });
  };

  if (!incomingRequest) {
    return (
      <RoleLayout>
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
          No patients currently en route to your hospital.
        </div>
      </RoleLayout>
    );
  }

  const severity = getSeverityColor(incomingRequest.severity);

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Incoming Emergency</h1>
          <p className="text-slate-500 text-sm mt-0.5">Patient en route – prepare immediately</p>
        </div>

        {/* ETA banner */}
        <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Estimated Arrival</div>
            <ETACounter seconds={4 * 60 + 5} />
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-800">{incomingRequest.emergencyType}</div>
            <Badge variant={incomingRequest.severity === 'critical' ? 'red' : 'orange'} size="md" dot>
              {incomingRequest.severity}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Map */}
          <div className="md:col-span-2 space-y-4">
            <LiveMap
              center={HOSPITAL_LOCATION}
              zoom={13}
              markers={markers}
              height="320px"
            />

            {/* Patient summary */}
            <Card>
              <CardHeader title="Patient Condition" icon={<Activity size={16} />} />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1.5">Patient</div>
                  <div className="text-sm font-bold text-slate-800">{incomingRequest.patientName}, {incomingRequest.patientAge} yrs</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-lg font-bold">
                      Blood: {incomingRequest.patientBloodGroup}
                    </span>
                    <Phone size={11} className="text-slate-400" />
                    <span className="text-xs text-slate-500">{incomingRequest.patientPhone}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1.5">Symptoms</div>
                  <div className="flex flex-wrap gap-1">
                    {incomingRequest.symptoms.map(s => (
                      <span key={s} className={`text-xs px-2 py-0.5 rounded-lg ${severity.bg} ${severity.text}`}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Team prep */}
          <div>
            <Card>
              <CardHeader title="Prepare Team" subtitle="Toggle to notify" />
              <div className="space-y-3">
                {([
                  { key: 'doctor', label: 'On-Call Doctor', sub: 'Emergency physician', icon: '👨‍⚕️' },
                  { key: 'nurse', label: 'Nursing Team', sub: 'ICU-ready nurses', icon: '👩‍⚕️' },
                  { key: 'icu', label: 'ICU Room', sub: 'Prepare ICU bay', icon: '🏥' },
                  { key: 'blood', label: `Blood Bank (${incomingRequest.patientBloodGroup})`, sub: 'Reserve blood units', icon: '🩸' },
                ] as const).map(item => (
                  <button
                    key={item.key}
                    onClick={() => toggleTeam(item.key as keyof typeof teamReady)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      teamReady[item.key as keyof typeof teamReady]
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-800">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.sub}</div>
                    </div>
                    {teamReady[item.key as keyof typeof teamReady] ? (
                      <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {Object.values(teamReady).every(Boolean) && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <CheckCircle size={20} className="text-emerald-600 mx-auto mb-1" />
                  <div className="text-xs font-bold text-emerald-700">All teams ready!</div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
