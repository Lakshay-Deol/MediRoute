import React, { useState } from 'react';
import { User, Phone, Heart, AlertTriangle, Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PATIENT_PROFILE } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function MedicalProfile() {
  const [profile, setProfile] = useState(PATIENT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Medical profile updated!');
  };

  return (
    <RoleLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Medical Profile</h1>
            <p className="text-slate-500 text-sm mt-0.5">Your health info shared with emergency responders</p>
          </div>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {!saving && <Save size={15} />} Save Changes
          </Button>
        </div>

        {/* Personal info */}
        <Card>
          <CardHeader title="Personal Information" icon={<User size={16} />} />
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: profile.name, key: 'name' },
              { label: 'Age', value: String(profile.age), key: 'age' },
              { label: 'Phone', value: profile.phone, key: 'phone' },
              { label: 'Email', value: profile.email, key: 'email' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{field.label}</label>
                <input
                  type="text"
                  defaultValue={field.value}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Blood Group</label>
              <select className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} selected={bg === profile.bloodGroup}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Blood group highlight */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {profile.bloodGroup}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">Blood Group</div>
            <div className="text-xs text-slate-500">Visible to all emergency responders immediately</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Allergies */}
          <Card>
            <CardHeader title="Allergies" icon={<AlertTriangle size={16} />} />
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.allergies.map((a, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 text-xs px-2.5 py-1.5 rounded-xl">
                  {a}
                  <button onClick={() => setProfile(p => ({ ...p, allergies: p.allergies.filter((_, j) => j !== i) }))}
                    className="hover:text-red-500 transition-colors">
                    <Trash2 size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newAllergy} onChange={e => setNewAllergy(e.target.value)}
                placeholder="Add allergy..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyDown={e => { if (e.key === 'Enter' && newAllergy.trim()) { setProfile(p => ({ ...p, allergies: [...p.allergies, newAllergy.trim()] })); setNewAllergy(''); }}}
              />
              <Button size="sm" variant="secondary" onClick={() => { if (newAllergy.trim()) { setProfile(p => ({ ...p, allergies: [...p.allergies, newAllergy.trim()] })); setNewAllergy(''); }}}>
                <Plus size={13} />
              </Button>
            </div>
          </Card>

          {/* Chronic conditions */}
          <Card>
            <CardHeader title="Chronic Conditions" icon={<Heart size={16} />} />
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.chronicConditions.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1.5 rounded-xl">
                  {c}
                  <button onClick={() => setProfile(p => ({ ...p, chronicConditions: p.chronicConditions.filter((_, j) => j !== i) }))}
                    className="hover:text-red-500 transition-colors">
                    <Trash2 size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newCondition} onChange={e => setNewCondition(e.target.value)}
                placeholder="Add condition..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyDown={e => { if (e.key === 'Enter' && newCondition.trim()) { setProfile(p => ({ ...p, chronicConditions: [...p.chronicConditions, newCondition.trim()] })); setNewCondition(''); }}}
              />
              <Button size="sm" variant="secondary" onClick={() => { if (newCondition.trim()) { setProfile(p => ({ ...p, chronicConditions: [...p.chronicConditions, newCondition.trim()] })); setNewCondition(''); }}}>
                <Plus size={13} />
              </Button>
            </div>
          </Card>
        </div>

        {/* Medications */}
        <Card>
          <CardHeader title="Current Medications" />
          <div className="space-y-2">
            {profile.medications.map((med, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-sm text-slate-700">{med}</span>
                </div>
                <button onClick={() => setProfile(p => ({ ...p, medications: p.medications.filter((_, j) => j !== i) }))}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency contacts */}
        <Card>
          <CardHeader title="Emergency Contacts" icon={<Phone size={16} />} />
          <div className="space-y-3">
            {profile.emergencyContacts.map((contact, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">{contact.name}</div>
                  <div className="text-xs text-slate-500">{contact.relationship} · {contact.phone}</div>
                </div>
                <a href={`tel:${contact.phone}`}>
                  <button className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors">
                    <Phone size={14} />
                  </button>
                </a>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </RoleLayout>
  );
}
