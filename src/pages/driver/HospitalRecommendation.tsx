import React from 'react';
import { MapPin, Clock, Star, Zap, CheckCircle } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import toast from 'react-hot-toast';

function BedMini({ label, available, total }: { label: string; available: number; total: number }) {
  const pct = total > 0 ? (available / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-500">{label}</span>
        <span className={`font-medium ${pct < 20 ? 'text-red-600' : 'text-emerald-600'}`}>{available}/{total}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full">
        <div className={`h-full rounded-full ${pct < 20 ? 'bg-red-500' : pct < 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function DriverHospitalRecommendation() {
  const { hospitals } = useEmergencyStore();

  return (
    <RoleLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hospital Recommendations</h1>
            <p className="text-slate-500 text-sm mt-0.5">AI-ranked for current patient</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-medium">
            <Zap size={13} /> AI Ranked
          </div>
        </div>

        <div className="space-y-4">
          {hospitals.map((hospital, index) => (
            <Card key={hospital.id} className={hospital.isAIRecommended ? 'border-emerald-200' : ''}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>#{index + 1}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">{hospital.name}</span>
                      {hospital.isAIRecommended && <Badge variant="green" size="sm">Recommended</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={10} className="text-emerald-600" /> {hospital.distance}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={10} className="text-orange-500" /> {hospital.eta}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Star size={10} className="fill-yellow-400 text-yellow-400" /> {hospital.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                <BedMini label="General Beds" available={hospital.availableBeds} total={hospital.totalBeds} />
                <BedMini label="ICU" available={hospital.icuAvailable} total={hospital.icuTotal} />
                <BedMini label="Ventilators" available={hospital.ventilatorsAvailable} total={hospital.ventilatorsTotal} />
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {hospital.specialties.slice(0, 3).map(s => (
                  <span key={s} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg">{s}</span>
                ))}
              </div>

              <Button
                variant={hospital.isAIRecommended ? 'primary' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => toast.success(`Navigating to ${hospital.name}`)}
              >
                {hospital.isAIRecommended && <CheckCircle size={14} />}
                {hospital.isAIRecommended ? 'Select (Recommended)' : 'Select This Hospital'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </RoleLayout>
  );
}
