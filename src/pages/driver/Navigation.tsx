import React, { useState } from 'react';
import { ChevronRight, Navigation as NavIcon, Check, MapPin, Phone } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LiveMap } from '../../components/map/LiveMap';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { useAmbulanceSimulator } from '../../utils/simulators';
import toast from 'react-hot-toast';

const DRIVER_LOCATION = { lat: 28.5560, lng: 77.2100 };
const PATIENT_LOCATION = { lat: 28.5530, lng: 77.2050 };
const HOSPITAL_LOCATION = { lat: 28.5672, lng: 77.2100 };

const TURN_BY_TURN = [
  { icon: '↑', instruction: 'Head north on Aurobindo Marg', distance: '200 m' },
  { icon: '→', instruction: 'Turn right onto Ring Road', distance: '1.2 km' },
  { icon: '←', instruction: 'Turn left onto Green Park Main', distance: '400 m' },
  { icon: '↑', instruction: 'Continue straight', distance: '150 m' },
  { icon: '📍', instruction: 'Destination on right', distance: 'Arrive' },
];

export default function DriverNavigation() {
  const { ambulances } = useEmergencyStore();
  const ambulance = ambulances.find(a => a.id === 'a1');
  const [arrived, setArrived] = useState(false);
  const [enRouteHospital, setEnRouteHospital] = useState(false);

  useAmbulanceSimulator('a1', PATIENT_LOCATION.lat, PATIENT_LOCATION.lng);

  const center = ambulance?.location || DRIVER_LOCATION;

  const markers = [
    { type: 'ambulance' as const, position: center, label: 'Your Position', info: 'DL-01-AA-1234' },
    { type: 'patient' as const, position: PATIENT_LOCATION, label: 'Sunita Rao', info: '7, Lajpat Nagar' },
    { type: 'hospital' as const, position: HOSPITAL_LOCATION, label: 'AIIMS Delhi', info: 'Destination Hospital' },
  ];

  const routePolyline = [center, PATIENT_LOCATION, HOSPITAL_LOCATION];

  const handleArrived = () => {
    setArrived(true);
    toast.success('✅ Marked as arrived at patient location!');
  };

  const handleEnRouteHospital = () => {
    setEnRouteHospital(true);
    toast.success('🏥 En route to AIIMS Delhi!');
  };

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Navigation</h1>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-medium">
            <NavIcon size={13} /> GPS Active
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <LiveMap
              center={center}
              zoom={14}
              markers={markers}
              polyline={routePolyline}
              height="460px"
            />
          </div>

          <div className="space-y-3">
            {/* ETA card */}
            <Card className="text-center">
              <div className="text-3xl font-bold text-slate-800">6 min</div>
              <div className="text-xs text-slate-500 mt-1">to patient location</div>
              <div className="mt-2 text-xs text-emerald-600 font-medium">2.1 km remaining</div>
            </Card>

            {/* Turn by turn */}
            <Card>
              <div className="text-xs font-semibold text-slate-700 mb-3">Turn-by-Turn</div>
              <div className="space-y-2">
                {TURN_BY_TURN.map((step, i) => (
                  <div key={i} className={`flex items-center gap-2.5 p-2 rounded-lg ${i === 0 ? 'bg-emerald-50 border border-emerald-200' : ''}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-medium ${i === 0 ? 'text-emerald-800' : 'text-slate-700'}`}>{step.instruction}</div>
                      <div className="text-xs text-slate-400">{step.distance}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              {!arrived ? (
                <Button variant="primary" size="md" className="w-full" onClick={handleArrived}>
                  <Check size={16} /> Mark as Arrived
                </Button>
              ) : !enRouteHospital ? (
                <Button variant="primary" size="md" className="w-full" onClick={handleEnRouteHospital}>
                  <MapPin size={16} /> En Route to Hospital
                </Button>
              ) : (
                <div className="text-center text-sm text-emerald-600 font-medium py-2">
                  🏥 Heading to AIIMS Delhi
                </div>
              )}
              <a href="tel:+919876511111">
                <Button variant="outline" size="md" className="w-full">
                  <Phone size={14} /> Call Patient
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
