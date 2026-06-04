import React from 'react';
import { MapPin, Clock, DollarSign, BedDouble, Star, Zap, ChevronRight } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import toast from 'react-hot-toast';

function BedBar({ label, available, total, color }: { label: string; available: number; total: number; color: string }) {
  const pct = total > 0 ? (available / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className={`font-semibold ${pct < 20 ? 'text-red-600' : pct < 50 ? 'text-yellow-600' : 'text-emerald-600'}`}>
          {available}/{total}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pct < 20 ? 'bg-red-500' : pct < 50 ? 'bg-yellow-500' : color
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function HospitalAllocation() {
  const { hospitals } = useEmergencyStore();

  return (
    <RoleLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Nearby Hospitals</h1>
            <p className="text-slate-500 text-sm mt-0.5">Sorted by AI recommendation and availability</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-medium">
            <Zap size={13} /> AI-powered ranking
          </div>
        </div>

        <div className="space-y-4">
          {hospitals.map((hospital, index) => (
            <Card key={hospital.id} className={hospital.isAIRecommended ? 'border-emerald-200 shadow-md' : ''}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-800">{hospital.name}</h3>
                      {hospital.isAIRecommended && (
                        <Badge variant="green" size="sm" dot>AI Recommended</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin size={11} /> {hospital.address}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin size={11} className="text-emerald-600" />
                        {hospital.distance}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Clock size={11} className="text-orange-500" />
                        {hospital.eta}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Star size={11} className="fill-yellow-400 text-yellow-400" />
                        {hospital.rating}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 mb-0.5">Est. Cost</div>
                  <div className="text-sm font-semibold text-slate-700">{hospital.estimatedCost}</div>
                </div>
              </div>

              {/* Availability bars */}
              <div className="space-y-2 mb-4">
                <BedBar label="General Beds" available={hospital.availableBeds} total={hospital.totalBeds} color="bg-blue-500" />
                <BedBar label="ICU Beds" available={hospital.icuAvailable} total={hospital.icuTotal} color="bg-purple-500" />
                <BedBar label="Ventilators" available={hospital.ventilatorsAvailable} total={hospital.ventilatorsTotal} color="bg-emerald-500" />
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {hospital.specialties.map(s => (
                  <span key={s} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => toast.success(`Selected ${hospital.name} as destination hospital`)}
                  className="flex-1"
                >
                  Select This Hospital
                </Button>
                <Button variant="outline" size="sm">
                  <ChevronRight size={14} /> Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </RoleLayout>
  );
}
