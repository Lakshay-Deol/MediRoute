import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, AlertTriangle, Phone, Check, X, Timer } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LiveMap } from '../../components/map/LiveMap';
import { EMERGENCY_REQUESTS } from '../../data/mockData';
import { getSeverityColor } from '../../utils/simulators';
import toast from 'react-hot-toast';

const PENDING_EMERGENCY = EMERGENCY_REQUESTS.find(r => r.status === 'pending')!;
const AUTO_DECLINE_SECONDS = 30;

export default function IncomingEmergency() {
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(AUTO_DECLINE_SECONDS);
  const navigate = useNavigate();

  useEffect(() => {
    if (accepted !== null) return;
    const timer = setInterval(() => {
      setCountdown(s => {
        if (s <= 1) {
          clearInterval(timer);
          setAccepted(false);
          toast.error('Emergency auto-declined (timeout)');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [accepted]);

  const handleAccept = () => {
    setAccepted(true);
    toast.success('✅ Emergency accepted! Navigate to patient.');
    setTimeout(() => navigate('/driver/navigation'), 1500);
  };

  const handleDecline = () => {
    setAccepted(false);
    toast.error('Emergency declined');
  };

  if (!PENDING_EMERGENCY) {
    return (
      <RoleLayout>
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <Clock size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No incoming emergencies right now</p>
            <p className="text-xs mt-1">You'll be notified when a request comes in</p>
          </div>
        </div>
      </RoleLayout>
    );
  }

  const severity = getSeverityColor(PENDING_EMERGENCY.severity);

  return (
    <RoleLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Alert header */}
        <div className={`rounded-2xl p-5 border-2 ${accepted === null ? 'border-orange-300 bg-orange-50' : accepted ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className={accepted === null ? 'text-orange-600' : accepted ? 'text-emerald-600' : 'text-slate-400'} />
              <span className="font-bold text-slate-800">
                {accepted === null ? '🚨 Incoming Emergency' : accepted ? '✅ Accepted!' : '❌ Declined'}
              </span>
            </div>
            {accepted === null && (
              <div className="flex items-center gap-1.5 text-sm font-bold text-orange-600">
                <Timer size={16} />
                {countdown}s
              </div>
            )}
          </div>
          {accepted === null && (
            <div className="h-1.5 bg-orange-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / AUTO_DECLINE_SECONDS) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Emergency details */}
        <Card>
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${severity.bg}`}>
              <AlertTriangle size={18} className={severity.text} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-base font-bold text-slate-800">{PENDING_EMERGENCY.emergencyType}</h2>
                <Badge variant={PENDING_EMERGENCY.severity === 'critical' ? 'red' : PENDING_EMERGENCY.severity === 'high' ? 'orange' : 'yellow'} size="sm" dot>
                  {PENDING_EMERGENCY.severity}
                </Badge>
              </div>
              <div className="text-sm text-slate-500">{PENDING_EMERGENCY.patientName}, {PENDING_EMERGENCY.patientAge} yrs</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Location</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                <MapPin size={13} className="text-emerald-600" />
                2.1 km away
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{PENDING_EMERGENCY.address}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Est. Drive Time</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                <Clock size={13} className="text-orange-500" />
                ~6 minutes
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="mb-4">
            <div className="text-xs font-medium text-slate-500 mb-2">Reported Symptoms</div>
            <div className="flex flex-wrap gap-1.5">
              {PENDING_EMERGENCY.symptoms.map(s => (
                <span key={s} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg">{s}</span>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 mb-4 flex items-center gap-1">
            <Phone size={11} /> {PENDING_EMERGENCY.patientPhone}
            <span className="mx-1">·</span>
            Blood: <span className="font-bold text-red-600 ml-0.5">{PENDING_EMERGENCY.patientBloodGroup}</span>
          </div>

          {accepted === null && (
            <div className="flex gap-3">
              <Button variant="danger" size="lg" className="flex-1" onClick={handleDecline}>
                <X size={18} /> Decline
              </Button>
              <Button variant="primary" size="lg" className="flex-2 flex-1 green-pulse" onClick={handleAccept}>
                <Check size={18} /> Accept Emergency
              </Button>
            </div>
          )}
        </Card>

        {/* Mini map */}
        <LiveMap
          center={PENDING_EMERGENCY.location}
          zoom={14}
          markers={[{ type: 'patient', position: PENDING_EMERGENCY.location, label: PENDING_EMERGENCY.patientName, info: PENDING_EMERGENCY.address }]}
          height="250px"
        />
      </div>
    </RoleLayout>
  );
}
