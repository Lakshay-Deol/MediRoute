import React, { useEffect, useState } from 'react';
import { Phone, Star, Clock, CheckCircle, Truck, MapPin, ChevronRight } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatusDot } from '../../components/ui/StatusDot';
import { LiveMap } from '../../components/map/LiveMap';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { useAmbulanceSimulator } from '../../utils/simulators';

const PATIENT_LOCATION = { lat: 28.5530, lng: 77.2050 };
const HOSPITAL_LOCATION = { lat: 28.5672, lng: 77.2100 };

const STATUS_STEPS = [
  { key: 'dispatched', label: 'Request Received', sub: 'Emergency dispatched' },
  { key: 'dispatched', label: 'Ambulance Assigned', sub: 'Rajesh Kumar – DL-01-AA-1234' },
  { key: 'en_route', label: 'En Route to You', sub: 'Ambulance is approaching' },
  { key: 'arrived', label: 'Arrived', sub: 'Driver at your location' },
];

function ETATimer({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="text-3xl font-bold text-slate-800">
      {minutes}:{secs.toString().padStart(2, '0')}
    </div>
  );
}

export default function LiveTracking() {
  const { requests, ambulances } = useEmergencyStore();
  const activeRequest = requests.find(r => r.id === 'e1');
  const ambulance = ambulances.find(a => a.id === 'a1');

  useAmbulanceSimulator('a1', PATIENT_LOCATION.lat, PATIENT_LOCATION.lng);

  const markers = [
    { type: 'patient' as const, position: PATIENT_LOCATION, label: 'Your Location', info: '14, Green Park, New Delhi' },
    ...(ambulance ? [{ type: 'ambulance' as const, position: ambulance.location, label: `Ambulance – ${ambulance.vehicleNumber}`, info: `Driver: ${ambulance.driverName}` }] : []),
    { type: 'hospital' as const, position: HOSPITAL_LOCATION, label: 'AIIMS Delhi', info: 'Destination hospital' },
  ];

  const routePolyline = ambulance ? [
    ambulance.location,
    { lat: (ambulance.location.lat + PATIENT_LOCATION.lat) / 2, lng: (ambulance.location.lng + PATIENT_LOCATION.lng) / 2 },
    PATIENT_LOCATION,
  ] : [];

  const currentStatusIndex = activeRequest?.status === 'en_route' ? 2 : activeRequest?.status === 'dispatched' ? 1 : 0;

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Live Tracking</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track your ambulance in real-time</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Map */}
          <div className="md:col-span-2">
            <LiveMap
              center={PATIENT_LOCATION}
              zoom={14}
              markers={markers}
              polyline={routePolyline}
              height="420px"
            />
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            {/* ETA */}
            <Card className="text-center">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center justify-center gap-1.5">
                <Clock size={12} /> Estimated Arrival
              </div>
              <ETATimer initialSeconds={4 * 60 + 23} />
              <div className="text-sm text-emerald-600 font-medium mt-1 flex items-center justify-center gap-1.5">
                <StatusDot status="active" />
                Ambulance moving
              </div>
            </Card>

            {/* Driver info */}
            <Card>
              <CardHeader title="Your Driver" icon={<Truck size={15} />} />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  RK
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Rajesh Kumar</div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    4.8 · DL-01-AA-1234
                  </div>
                </div>
              </div>
              <a href="tel:+919876543210">
                <button className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium transition-colors">
                  <Phone size={14} /> Call Driver
                </button>
              </a>
            </Card>

            {/* Status timeline */}
            <Card>
              <CardHeader title="Status" />
              <div className="space-y-3">
                {STATUS_STEPS.map((step, index) => {
                  const isDone = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isDone ? 'bg-emerald-600' : 'bg-slate-100'
                      }`}>
                        {isDone
                          ? <CheckCircle size={12} className="text-white" />
                          : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                      </div>
                      <div>
                        <div className={`text-xs font-medium ${isCurrent ? 'text-emerald-600' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step.label}
                          {isCurrent && <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-md">Now</span>}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{step.sub}</div>
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
