import React, { useState } from 'react';
import { BedDouble, ChevronDown } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const WARDS = ['General', 'ICU', 'Emergency', 'Paediatrics', 'Maternity'];

function generateBeds(ward: string, total: number, occupied: number) {
  return Array.from({ length: total }, (_, i) => ({
    id: `${ward}-${i + 1}`,
    number: i + 1,
    occupied: i < occupied,
    patient: i < occupied ? `Patient ${String.fromCharCode(65 + i)}` : null,
  }));
}

const WARD_DATA: Record<string, { total: number; occupied: number }> = {
  General: { total: 30, occupied: 22 },
  ICU: { total: 10, occupied: 7 },
  Emergency: { total: 12, occupied: 5 },
  Paediatrics: { total: 15, occupied: 9 },
  Maternity: { total: 10, occupied: 4 },
};

export default function BedManagement() {
  const [selectedWard, setSelectedWard] = useState('General');
  const [beds, setBeds] = useState(() =>
    Object.fromEntries(
      Object.entries(WARD_DATA).map(([ward, data]) => [
        ward,
        generateBeds(ward, data.total, data.occupied),
      ])
    )
  );

  const currentBeds = beds[selectedWard] || [];
  const available = currentBeds.filter(b => !b.occupied).length;
  const total = currentBeds.length;
  const occupiedBeds = currentBeds.filter(b => b.occupied).length;

  const toggleBed = (bedId: string) => {
    setBeds(prev => ({
      ...prev,
      [selectedWard]: prev[selectedWard].map(b =>
        b.id === bedId ? { ...b, occupied: !b.occupied, patient: !b.occupied ? 'New Patient' : null } : b
      ),
    }));
  };

  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Bed Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Click any bed to toggle occupied/available status</p>
        </div>

        {/* Ward selector */}
        <div className="flex gap-2 flex-wrap">
          {WARDS.map(ward => (
            <button
              key={ward}
              onClick={() => setSelectedWard(ward)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                selectedWard === ward
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              {ward} Ward
            </button>
          ))}
        </div>

        {/* Stats for selected ward */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center !py-4">
            <div className="text-2xl font-bold text-emerald-600">{available}</div>
            <div className="text-xs text-slate-500 mt-0.5">Available</div>
          </Card>
          <Card className="text-center !py-4">
            <div className="text-2xl font-bold text-red-600">{occupiedBeds}</div>
            <div className="text-xs text-slate-500 mt-0.5">Occupied</div>
          </Card>
          <Card className="text-center !py-4">
            <div className="text-2xl font-bold text-slate-800">{total}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total Beds</div>
          </Card>
        </div>

        {/* Bed grid */}
        <Card>
          <CardHeader
            title={`${selectedWard} Ward`}
            subtitle={`${available} beds available of ${total}`}
            action={
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded-sm" />Available</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-400 rounded-sm" />Occupied</span>
              </div>
            }
          />
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
            {currentBeds.map(bed => (
              <button
                key={bed.id}
                onClick={() => toggleBed(bed.id)}
                title={bed.occupied ? `Bed ${bed.number}: ${bed.patient}` : `Bed ${bed.number}: Available`}
                className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 ${
                  bed.occupied
                    ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                <BedDouble size={14} />
                <span className="text-xs font-bold mt-0.5">{bed.number}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Occupied bed list */}
        <Card>
          <CardHeader title="Occupied Beds" subtitle="Click a bed above to update status" />
          <div className="grid md:grid-cols-2 gap-2">
            {currentBeds.filter(b => b.occupied).map(bed => (
              <div key={bed.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2">
                  <BedDouble size={14} className="text-red-600" />
                  <span className="text-sm font-medium text-slate-700">Bed {bed.number}</span>
                </div>
                <Badge variant="red" size="sm">Occupied</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </RoleLayout>
  );
}
