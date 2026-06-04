import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { LiveMap } from '../../components/map/LiveMap';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { EMERGENCY_REQUESTS, PATIENT_PROFILE } from '../../data/mockData';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  content: { maxWidth: '900px', margin: '0 auto', padding: '24px 16px' },
  card: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '16px' },
  heading: { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', marginTop: 0 },
};

const PATIENT_LOC = { lat: 28.5530, lng: 77.2050 };
const DRIVER_LOC = { lat: 28.5560, lng: 77.2100 };

const TURN_BY_TURN = [
  { dir: '↑', text: 'Head north on Aurobindo Marg', dist: '300 m' },
  { dir: '→', text: 'Turn right onto Ring Road', dist: '800 m' },
  { dir: '←', text: 'Turn left onto Green Park Main', dist: '400 m' },
  { dir: '📍', text: 'Patient location on right', dist: 'Arrive' },
];

export default function DriverHome() {
  const [isOnline, setIsOnline] = useState(true);
  const [tab, setTab] = useState<'dash' | 'incoming' | 'navigate' | 'patient'>('dash');
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(30);
  const { ambulances } = useEmergencyStore();
  const ambulance = ambulances[0];

  const incoming = EMERGENCY_REQUESTS.find(r => r.status === 'pending')!;

  useEffect(() => {
    if (tab !== 'incoming' || accepted !== null) return;
    const t = setInterval(() => setCountdown(s => {
      if (s <= 1) { setAccepted(false); toast.error('Auto-declined (timeout)'); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [tab, accepted]);

  const handleAccept = () => { setAccepted(true); toast.success('✅ Accepted! Navigate to patient.'); setTab('navigate'); };
  const handleDecline = () => { setAccepted(false); toast.error('Declined'); };

  const tabs = [
    { id: 'dash', label: '🏠 Home' },
    { id: 'incoming', label: '🚨 Incoming' },
    { id: 'navigate', label: '🗺️ Navigate' },
    { id: 'patient', label: '👤 Patient' },
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
              position: 'relative' as const,
            }}>
              {t.label}
              {t.id === 'incoming' && accepted === null && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }} />
              )}
            </button>
          ))}
        </div>

        {/* Home Tab */}
        {tab === 'dash' && (
          <div>
            {/* Online toggle */}
            <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>Availability Status</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{isOnline ? 'You are receiving emergency alerts' : 'You are offline'}</div>
              </div>
              <button
                onClick={() => { setIsOnline(p => !p); toast.success(isOnline ? '🔴 You are now offline' : '🟢 You are now online'); }}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: isOnline ? '#059669' : '#e2e8f0', color: isOnline ? '#fff' : '#64748b', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {isOnline ? '● Online' : '○ Offline'}
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: "Today's Earnings", value: '₹1,850' },
                { label: 'Total Trips', value: '1,247' },
                { label: 'Rating', value: '⭐ 4.8' },
              ].map(s => (
                <div key={s.label} style={{ ...S.card, textAlign: 'center', marginBottom: 0 }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Vehicle info */}
            <div style={S.card}>
              <h2 style={S.heading}>My Vehicle</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  ['Vehicle', ambulance.vehicleNumber],
                  ['Status', ambulance.status],
                  ['Speed', `${ambulance.speed} km/h`],
                  ['Driver', ambulance.driverName],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>{k}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', textTransform: 'capitalize' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Incoming Tab */}
        {tab === 'incoming' && incoming && (
          <div>
            {accepted === null && (
              <div style={{ background: '#fff7ed', border: '2px solid #f97316', borderRadius: '16px', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#c2410c' }}>🚨 Incoming Emergency</span>
                <span style={{ fontWeight: '800', color: '#f97316', fontSize: '18px' }}>{countdown}s</span>
              </div>
            )}
            {accepted === true && (
              <div style={{ background: '#f0fdf4', border: '2px solid #059669', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
                <span style={{ fontWeight: '700', color: '#059669' }}>✅ Emergency Accepted — Navigate to patient</span>
              </div>
            )}

            <div style={S.card}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ padding: '6px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px', color: '#991b1b', fontWeight: '700' }}>{incoming.severity.toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '16px' }}>{incoming.emergencyType}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{incoming.patientName} · {incoming.patientAge} yrs · Blood: <strong style={{ color: '#ef4444' }}>{incoming.patientBloodGroup}</strong></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Distance</div>
                  <div style={{ fontWeight: '700', color: '#059669' }}>2.1 km away</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Drive Time</div>
                  <div style={{ fontWeight: '700', color: '#f59e0b' }}>~6 minutes</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Symptoms</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {incoming.symptoms.map(s => (
                    <span key={s} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>{s}</span>
                  ))}
                </div>
              </div>

              <LiveMap center={incoming.location} zoom={14} markers={[{ type: 'patient', position: incoming.location, label: incoming.patientName }]} height="200px" />

              {accepted === null && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                  <button onClick={handleDecline} style={{ padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' }}>✕ Decline</button>
                  <button onClick={handleAccept} className="pulse-green" style={{ padding: '12px', background: '#059669', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: '#fff' }}>✓ Accept</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigate Tab */}
        {tab === 'navigate' && (
          <div>
            <LiveMap
              center={DRIVER_LOC}
              zoom={14}
              markers={[
                { type: 'ambulance', position: DRIVER_LOC, label: 'Your Location' },
                { type: 'patient', position: PATIENT_LOC, label: 'Patient' },
              ]}
              polyline={[DRIVER_LOC, PATIENT_LOC]}
              height="350px"
            />
            <div style={S.card}>
              <h2 style={S.heading}>Turn-by-Turn Directions</h2>
              {TURN_BY_TURN.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: i < TURN_BY_TURN.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: '32px', height: '32px', background: i === 0 ? '#059669' : '#f1f5f9', color: i === 0 ? '#fff' : '#64748b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{step.dir}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: i === 0 ? '700' : '500', color: i === 0 ? '#059669' : '#374151' }}>{step.text}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{step.dist}</div>
                </div>
              ))}
            </div>
            <button onClick={() => toast.success('✅ Marked as arrived!')} style={{ width: '100%', padding: '14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}>
              ✓ Mark as Arrived at Patient
            </button>
          </div>
        )}

        {/* Patient Tab */}
        {tab === 'patient' && (
          <div style={S.card}>
            <h2 style={S.heading}>Patient Medical Info</h2>
            <div style={{ background: '#ef4444', color: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '36px', fontWeight: '900' }}>{PATIENT_PROFILE.bloodGroup}</div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>BLOOD GROUP</div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
              <div style={{ width: '44px', height: '44px', background: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800' }}>AM</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{PATIENT_PROFILE.name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{PATIENT_PROFILE.age} years · {PATIENT_PROFILE.phone}</div>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444', marginBottom: '6px' }}>⚠️ ALLERGIES</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {PATIENT_PROFILE.allergies.map(a => (
                  <span key={a} style={{ background: '#fef2f2', border: '2px solid #fca5a5', color: '#7f1d1d', padding: '5px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '13px' }}>⚠️ {a}</span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Conditions & Medications</div>
              {[...PATIENT_PROFILE.chronicConditions, ...PATIENT_PROFILE.medications].map(item => (
                <div key={item} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#374151' }}>• {item}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
