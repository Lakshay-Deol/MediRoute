import React from 'react';
import { MapPin, Phone, Star, BedDouble, Activity } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusDot } from '../../components/ui/StatusDot';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { useBedSimulator } from '../../utils/simulators';

function CapacityBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function HospitalMonitoring() {
  const { hospitals } = useEmergencyStore();
  useBedSimulator();

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hospital Monitoring</h1>
            <p className="text-slate-500 text-sm mt-0.5">Real-time bed and capacity across all connected hospitals</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status="active" />
            <span className="text-xs text-slate-500">Auto-updating every 5s</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {hospitals.map(hospital => {
            const generalPct = Math.round((hospital.availableBeds / hospital.totalBeds) * 100);
            const icuPct = Math.round((hospital.icuAvailable / hospital.icuTotal) * 100);
            const ventPct = Math.round((hospital.ventilatorsAvailable / hospital.ventilatorsTotal) * 100);
            const isCritical = generalPct < 20 || icuPct < 20;

            return (
              <Card key={hospital.id} className={isCritical ? 'border-red-200' : ''}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      isCritical ? 'bg-red-50' : 'bg-emerald-50'
                    }`}>
                      🏥
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-800">{hospital.name}</h3>
                        {isCritical && <Badge variant="red" size="sm" dot>Low Capacity</Badge>}
                        {hospital.isAIRecommended && <Badge variant="green" size="sm">Recommended</Badge>}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <MapPin size={10} /> {hospital.address.split(',')[0]}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone size={10} /> {hospital.phone}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Star size={10} className="fill-yellow-400 text-yellow-400" /> {hospital.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 flex items-center gap-1"><BedDouble size={10} /> General Beds</span>
                      <span className={`font-semibold ${generalPct < 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {hospital.availableBeds} / {hospital.totalBeds} available ({generalPct}%)
                      </span>
                    </div>
                    <CapacityBar value={hospital.availableBeds} total={hospital.totalBeds}
                      color={generalPct < 20 ? 'bg-red-500' : generalPct < 50 ? 'bg-yellow-500' : 'bg-emerald-500'} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 flex items-center gap-1"><Activity size={10} /> ICU Beds</span>
                      <span className={`font-semibold ${icuPct < 20 ? 'text-red-600' : 'text-purple-600'}`}>
                        {hospital.icuAvailable} / {hospital.icuTotal} ({icuPct}%)
                      </span>
                    </div>
                    <CapacityBar value={hospital.icuAvailable} total={hospital.icuTotal}
                      color={icuPct < 20 ? 'bg-red-500' : 'bg-purple-500'} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Ventilators</span>
                      <span className={`font-semibold ${ventPct < 20 ? 'text-red-600' : 'text-blue-600'}`}>
                        {hospital.ventilatorsAvailable} / {hospital.ventilatorsTotal} ({ventPct}%)
                      </span>
                    </div>
                    <CapacityBar value={hospital.ventilatorsAvailable} total={hospital.ventilatorsTotal}
                      color={ventPct < 20 ? 'bg-red-500' : 'bg-blue-500'} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {hospital.specialties.map(s => (
                    <span key={s} className="text-xs bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-lg">{s}</span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </RoleLayout>
  );
}
