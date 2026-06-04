import React from 'react';
import { AlertTriangle, Heart, Phone, User } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PATIENT_PROFILE, EMERGENCY_REQUESTS } from '../../data/mockData';

const activeRequest = EMERGENCY_REQUESTS.find(r => r.assignedAmbulanceId === 'a1' && r.status === 'en_route');

export default function PatientInfo() {
  return (
    <RoleLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Patient Information</h1>
          <p className="text-slate-500 text-sm mt-0.5">Medical details for current emergency</p>
        </div>

        {/* Emergency summary */}
        {activeRequest && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-600" />
              <span className="text-sm font-bold text-red-800">{activeRequest.emergencyType}</span>
              <Badge variant="red" size="sm">{activeRequest.severity}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeRequest.symptoms.map(s => (
                <span key={s} className="text-xs bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded-lg">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Patient identity */}
        <Card>
          <CardHeader title="Patient Identity" icon={<User size={16} />} />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {PATIENT_PROFILE.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800">{PATIENT_PROFILE.name}</div>
              <div className="text-sm text-slate-500">{PATIENT_PROFILE.age} years old</div>
              <div className="flex items-center gap-1 mt-1">
                <Phone size={12} className="text-slate-400" />
                <span className="text-xs text-slate-500">{PATIENT_PROFILE.phone}</span>
              </div>
            </div>
          </div>

          {/* Blood group - PROMINENT */}
          <div className="bg-red-600 text-white rounded-xl p-4 text-center mb-4">
            <div className="text-3xl font-extrabold">{PATIENT_PROFILE.bloodGroup}</div>
            <div className="text-red-200 text-xs mt-1 uppercase tracking-wide">Blood Group</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Email', value: PATIENT_PROFILE.email },
              { label: 'Phone', value: PATIENT_PROFILE.phone },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-0.5">{item.label}</div>
                <div className="text-xs font-medium text-slate-700 break-all">{item.value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader title="⚠️ ALLERGIES" />
          <div className="flex flex-wrap gap-2">
            {PATIENT_PROFILE.allergies.map(a => (
              <div key={a} className="flex items-center gap-2 bg-orange-50 border-2 border-orange-300 text-orange-800 px-3 py-2 rounded-xl font-bold text-sm">
                <AlertTriangle size={14} />
                {a}
              </div>
            ))}
          </div>
        </Card>

        {/* Medical conditions */}
        <Card>
          <CardHeader title="Chronic Conditions" icon={<Heart size={16} />} />
          <div className="space-y-2">
            {PATIENT_PROFILE.chronicConditions.map(c => (
              <div key={c} className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="text-sm font-medium text-blue-800">{c}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader title="Current Medications" />
          <div className="space-y-2">
            {PATIENT_PROFILE.medications.map(med => (
              <div key={med} className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                <span className="text-sm text-slate-700">{med}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency contacts */}
        <Card>
          <CardHeader title="Emergency Contacts" icon={<Phone size={16} />} />
          <div className="space-y-3">
            {PATIENT_PROFILE.emergencyContacts.map(c => (
              <div key={c.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-slate-800">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.relationship} · {c.phone}</div>
                </div>
                <a href={`tel:${c.phone}`} className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors">
                  <Phone size={14} />
                </a>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </RoleLayout>
  );
}
