import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, ChevronRight, Loader2, CheckCircle, Cpu, Upload, X } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SYMPTOMS, EMERGENCY_TYPES } from '../../data/mockData';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import toast from 'react-hot-toast';

const SEVERITY_RULES: Record<string, string[]> = {
  critical: ['Chest Pain', 'Loss of Consciousness', 'Stroke Symptoms', 'Cardiac Arrest'],
  high: ['Head Injury', 'Bleeding', 'Seizure', 'Breathing Difficulty'],
  medium: ['Dizziness', 'High Fever', 'Severe Abdominal Pain'],
  low: ['Nausea', 'Fracture', 'Minor Injury'],
};

function predictSeverity(emergencyType: string, symptoms: string[]): string {
  if (['Cardiac Arrest', 'Stroke'].includes(emergencyType)) return 'critical';
  for (const sym of symptoms) {
    if (SEVERITY_RULES.critical.includes(sym)) return 'critical';
  }
  for (const sym of symptoms) {
    if (SEVERITY_RULES.high.includes(sym)) return 'high';
  }
  return symptoms.length > 2 ? 'medium' : 'low';
}

export default function EmergencyRequest() {
  const [step, setStep] = useState<'form' | 'ai' | 'success'>('form');
  const [emergencyType, setEmergencyType] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [locating, setLocating] = useState(false);
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [predictedSeverity, setPredictedSeverity] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const { addRequest } = useEmergencyStore();
  const navigate = useNavigate();

  const detectLocation = async () => {
    setLocating(true);
    await new Promise(r => setTimeout(r, 1200));
    setLocation('14, Green Park, New Delhi – 110016');
    setLocating(false);
    toast.success('📍 Location detected!');
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyType) { toast.error('Please select an emergency type'); return; }
    if (!location) { toast.error('Please detect or enter your location'); return; }

    setStep('ai');
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    const severity = predictSeverity(emergencyType, selectedSymptoms);
    setPredictedSeverity(severity);
    setAiLoading(false);

    await new Promise(r => setTimeout(r, 800));

    addRequest({
      id: `e${Date.now()}`,
      patientId: 'p1',
      patientName: 'Arjun Mehta',
      patientAge: 32,
      patientBloodGroup: 'O+',
      patientPhone: '+91-98765-11111',
      location: { lat: 28.553, lng: 77.205 },
      address: location,
      emergencyType,
      symptoms: selectedSymptoms,
      severity: severity as never,
      status: 'pending',
      createdAt: new Date().toISOString(),
      eta: '8 min',
      notes,
    });

    setStep('success');
    setTimeout(() => navigate('/patient/tracking'), 2000);
  };

  const severityConfig = {
    critical: { variant: 'red' as const, label: '🔴 Critical – Immediate Response Required' },
    high: { variant: 'orange' as const, label: '🟠 High – Priority Dispatch' },
    medium: { variant: 'yellow' as const, label: '🟡 Medium – Standard Response' },
    low: { variant: 'green' as const, label: '🟢 Low – Non-Urgent' },
  };

  return (
    <RoleLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Request Emergency</h1>
          <p className="text-slate-500 text-sm mt-0.5">Describe your emergency for fastest dispatch</p>
        </div>

        {step === 'success' ? (
          <Card padding="lg" className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Emergency Dispatched!</h2>
            <p className="text-slate-500 text-sm mb-4">An ambulance has been assigned. Redirecting to live tracking...</p>
            <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium">
              <Loader2 size={14} className="animate-spin" />
              Connecting to driver...
            </div>
          </Card>
        ) : step === 'ai' ? (
          <Card padding="lg" className="text-center py-10">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cpu size={28} className={aiLoading ? 'text-blue-600 animate-pulse' : 'text-blue-600'} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {aiLoading ? 'Analysing Severity...' : 'AI Assessment Complete'}
            </h2>
            {aiLoading ? (
              <p className="text-slate-500 text-sm">Processing symptoms and emergency type...</p>
            ) : (
              <div>
                <p className="text-slate-500 text-sm mb-4">Based on your symptoms and emergency type:</p>
                <Badge variant={severityConfig[predictedSeverity as keyof typeof severityConfig]?.variant || 'gray'} size="md">
                  {severityConfig[predictedSeverity as keyof typeof severityConfig]?.label}
                </Badge>
              </div>
            )}
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Location */}
            <Card>
              <CardHeader title="Your Location" icon={<MapPin size={16} />} />
              <div className="flex gap-3">
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Enter your address or auto-detect"
                  className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <Button type="button" variant="secondary" onClick={detectLocation} loading={locating}>
                  {!locating && <MapPin size={15} />}
                  {locating ? 'Locating...' : 'Detect'}
                </Button>
              </div>
            </Card>

            {/* Emergency type */}
            <Card>
              <CardHeader title="Emergency Type" icon={<AlertTriangle size={16} />} />
              <div className="grid grid-cols-2 gap-2">
                {EMERGENCY_TYPES.map(type => (
                  <button
                    key={type.label}
                    type="button"
                    onClick={() => setEmergencyType(type.label)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left text-sm transition-all ${
                      emergencyType === type.label
                        ? `${type.color} border-current shadow-sm`
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="font-medium text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Symptoms */}
            <Card>
              <CardHeader title="Symptoms" subtitle="Select all that apply" />
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      selectedSymptoms.includes(s)
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Card>

            {/* Notes & image */}
            <Card>
              <CardHeader title="Additional Info" />
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any additional details about the emergency..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  rows={3}
                />
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-2 block">Attach Photo (optional)</label>
                  {imagePreview ? (
                    <div className="relative w-24">
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
                      <button type="button" onClick={() => setImagePreview(null)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50 transition-all w-fit text-sm">
                      <Upload size={14} />
                      <span>Upload image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>
            </Card>

            <Button type="submit" variant="danger" size="lg" className="w-full emergency-pulse">
              <AlertTriangle size={18} /> Dispatch Emergency Ambulance
            </Button>
          </form>
        )}
      </div>
    </RoleLayout>
  );
}
