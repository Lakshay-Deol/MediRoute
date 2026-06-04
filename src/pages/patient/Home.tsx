import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { LiveMap } from '../../components/map/LiveMap';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { HOSPITALS, SYMPTOMS, EMERGENCY_TYPES, PATIENT_PROFILE } from '../../data/mockData';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  content: { maxWidth: '900px', margin: '0 auto', padding: '24px 16px' },
  card: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '16px' },
  heading: { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', marginTop: 0 },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  btn: (color = '#059669') => ({ padding: '11px 20px', background: color, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }),
  tag: (active: boolean) => ({ padding: '6px 12px', borderRadius: '8px', border: `1.5px solid ${active ? '#059669' : '#e2e8f0'}`, background: active ? '#ecfdf5' : '#fff', color: active ? '#059669' : '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }),
};

const PATIENT_LOC = { lat: 28.5530, lng: 77.2050 };
const AMBULANCE_LOC = { lat: 28.5580, lng: 77.2080 };

export default function PatientHome() {
  const [tab, setTab] = useState<'sos' | 'track' | 'hospitals' | 'profile'>('sos');
  const [eType, setEType] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [dispatched, setDispatched] = useState(false);
  const [locating, setLocating] = useState(false);
  const { hospitals } = useEmergencyStore();

  const detectLocation = async () => {
    setLocating(true);
    await new Promise(r => setTimeout(r, 1000));
    setLocation('14, Green Park, New Delhi – 110016');
    setLocating(false);
    toast.success('📍 Location detected');
  };

  const handleDispatch = async () => {
    if (!eType) { toast.error('Select emergency type first'); return; }
    if (!location) { toast.error('Enter your location first'); return; }
    await new Promise(r => setTimeout(r, 600));
    setDispatched(true);
    setTab('track');
    toast.success('🚑 Ambulance dispatched! ETA: 7 minutes');
  };

  const toggleSymptom = (s: string) => setSymptoms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const tabs = [
    { id: 'sos', label: '🆘 Emergency' },
    { id: 'track', label: '📍 Track' },
    { id: 'hospitals', label: '🏥 Hospitals' },
    { id: 'profile', label: '👤 Profile' },
  ] as const;

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.content} className="fade-in">
        {/* Tab nav */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: tab === t.id ? '#059669' : '#fff',
              color: tab === t.id ? '#fff' : '#64748b',
              fontWeight: '600', fontSize: '13px', fontFamily: 'inherit',
              boxShadow: tab === t.id ? '0 2px 8px rgba(5,150,105,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* SOS Tab */}
        {tab === 'sos' && (
          <div>
            {/* Big SOS button */}
            <div style={{ ...S.card, textAlign: 'center', padding: '32px' }}>
              {dispatched ? (
                <div>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#059669', margin: '0 0 8px' }}>Ambulance Dispatched!</h2>
                  <p style={{ color: '#64748b', margin: 0 }}>ETA: ~7 minutes · Driver: Rajesh Kumar</p>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleDispatch}
                    className="pulse-red"
                    style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', fontSize: '18px', fontWeight: '800', cursor: 'pointer', marginBottom: '16px', display: 'block', margin: '0 auto 16px' }}
                  >
                    SOS
                  </button>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Tap to dispatch ambulance immediately</p>
                </div>
              )}
            </div>

            {/* Emergency form */}
            <div style={S.card}>
              <h2 style={S.heading}>Emergency Details</h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Your Location</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter address..." style={{ ...S.input, flex: 1 }} />
                  <button onClick={detectLocation} disabled={locating} style={{ ...S.btn('#0ea5e9'), whiteSpace: 'nowrap', padding: '10px 16px' }}>
                    {locating ? '...' : '📍 Detect'}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Emergency Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                  {EMERGENCY_TYPES.slice(0, 6).map(t => (
                    <button key={t.label} onClick={() => setEType(t.label)} style={{
                      padding: '10px 8px', borderRadius: '10px', border: `2px solid ${eType === t.label ? '#059669' : '#e2e8f0'}`,
                      background: eType === t.label ? '#ecfdf5' : '#fff', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
                      fontWeight: '600', color: eType === t.label ? '#059669' : '#374151',
                    }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>Symptoms</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {SYMPTOMS.slice(0, 12).map(s => (
                    <button key={s} onClick={() => toggleSymptom(s)} style={S.tag(symptoms.includes(s))}>{s}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleDispatch} style={{ ...S.btn('#ef4444'), width: '100%', padding: '14px', fontSize: '15px' }}>
                🚑 Request Ambulance
              </button>
            </div>
          </div>
        )}

        {/* Track Tab */}
        {tab === 'track' && (
          <div>
            <div style={S.card}>
              <h2 style={S.heading}>Live Ambulance Tracking</h2>
              <LiveMap
                center={PATIENT_LOC}
                zoom={14}
                markers={[
                  { type: 'patient', position: PATIENT_LOC, label: 'Your Location' },
                  { type: 'ambulance', position: AMBULANCE_LOC, label: 'Rajesh Kumar · DL-01-AA-1234' },
                ]}
                polyline={[AMBULANCE_LOC, PATIENT_LOC]}
                height="360px"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ ...S.card, textAlign: 'center', marginBottom: 0 }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#059669' }}>7 min</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Estimated Arrival</div>
              </div>
              <div style={{ ...S.card, marginBottom: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Rajesh Kumar</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>⭐ 4.8 · DL-01-AA-1234</div>
                <a href="tel:+919876543210" style={{ display: 'block', marginTop: '8px', padding: '6px', background: '#ecfdf5', borderRadius: '8px', textAlign: 'center', fontSize: '12px', color: '#059669', fontWeight: '600', textDecoration: 'none' }}>📞 Call Driver</a>
              </div>
            </div>

            {/* Status steps */}
            <div style={S.card}>
              <h2 style={S.heading}>Status</h2>
              {[
                { label: 'Request Received', done: true },
                { label: 'Ambulance Dispatched', done: true },
                { label: 'En Route to You', done: dispatched, active: dispatched },
                { label: 'Arrived', done: false },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step.done ? '#059669' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: step.done ? '#fff' : '#94a3b8', fontSize: '12px' }}>{step.done ? '✓' : i + 1}</span>
                  </div>
                  <span style={{ fontSize: '14px', color: step.active ? '#059669' : step.done ? '#0f172a' : '#94a3b8', fontWeight: step.active ? '700' : '500' }}>
                    {step.label} {step.active && '→ Now'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hospitals Tab */}
        {tab === 'hospitals' && (
          <div>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Nearby Hospitals</h2>
              <span style={{ fontSize: '12px', padding: '4px 10px', background: '#ecfdf5', color: '#059669', borderRadius: '8px', fontWeight: '600' }}>⚡ AI-ranked</span>
            </div>
            {hospitals.map((h, i) => (
              <div key={h.id} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: i === 0 ? '#059669' : '#f1f5f9', color: i === 0 ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>#{i + 1}</div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>{h.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>📍 {h.distance} · ⏱ {h.eta} · ⭐ {h.rating}</div>
                    </div>
                  </div>
                  {h.isAIRecommended && <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>✓ Recommended</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                  {[
                    { label: 'Beds', val: h.availableBeds, total: h.totalBeds },
                    { label: 'ICU', val: h.icuAvailable, total: h.icuTotal },
                    { label: 'Vents', val: h.ventilatorsAvailable, total: h.ventilatorsTotal },
                  ].map(item => {
                    const pct = (item.val / item.total) * 100;
                    return (
                      <div key={item.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: '#64748b' }}>{item.label}</span>
                          <span style={{ color: pct < 20 ? '#ef4444' : '#059669', fontWeight: '700' }}>{item.val}/{item.total}</span>
                        </div>
                        <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct < 20 ? '#ef4444' : '#059669', borderRadius: '2px', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button onClick={() => toast.success(`Selected ${h.name}`)} style={{ ...S.btn(i === 0 ? '#059669' : '#64748b'), width: '100%' }}>
                  Select This Hospital
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={S.card}>
            <h2 style={S.heading}>Medical Profile</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ width: '56px', height: '56px', background: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '20px' }}>AM</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '16px' }}>{PATIENT_PROFILE.name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{PATIENT_PROFILE.age} years · {PATIENT_PROFILE.phone}</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', fontSize: '18px' }}>
                {PATIENT_PROFILE.bloodGroup}
              </div>
            </div>

            {[
              { title: '⚠️ Allergies', items: PATIENT_PROFILE.allergies, color: '#fef3c7', border: '#fde68a', text: '#92400e' },
              { title: '💊 Conditions', items: PATIENT_PROFILE.chronicConditions, color: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
              { title: '💉 Medications', items: PATIENT_PROFILE.medications, color: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
            ].map(section => (
              <div key={section.title} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>{section.title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {section.items.map(item => (
                    <span key={item} style={{ padding: '4px 10px', background: section.color, border: `1px solid ${section.border}`, color: section.text, borderRadius: '8px', fontSize: '13px', fontWeight: '500' }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>📞 Emergency Contacts</div>
              {PATIENT_PROFILE.emergencyContacts.map(c => (
                <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{c.relationship}</div>
                  </div>
                  <a href={`tel:${c.phone}`} style={{ padding: '6px 12px', background: '#ecfdf5', color: '#059669', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>📞 Call</a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
