import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { useBedSimulator } from '../../utils/simulators';
import toast from 'react-hot-toast';

const S = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  content: { maxWidth: '900px', margin: '0 auto', padding: '24px 16px' },
  card: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '16px' },
  heading: { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', marginTop: 0 },
};

const WARDS = ['General', 'ICU', 'Emergency', 'Paediatrics'];

function generateBeds(total: number, occupied: number) {
  return Array.from({ length: total }, (_, i) => ({ id: i, occupied: i < occupied }));
}

const WARD_DATA: Record<string, { total: number; occupied: number }> = {
  General: { total: 30, occupied: 22 },
  ICU: { total: 10, occupied: 7 },
  Emergency: { total: 12, occupied: 5 },
  Paediatrics: { total: 15, occupied: 9 },
};

export default function HospitalHome() {
  const [tab, setTab] = useState<'dash' | 'beds' | 'incoming' | 'notify'>('dash');
  const [selectedWard, setSelectedWard] = useState('General');
  const [beds, setBeds] = useState(() =>
    Object.fromEntries(Object.entries(WARD_DATA).map(([ward, d]) => [ward, generateBeds(d.total, d.occupied)]))
  );
  const [notifGroups, setNotifGroups] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const { hospitals, requests } = useEmergencyStore();
  useBedSimulator();

  const hospital = hospitals[0];
  const incoming = requests.filter(r => r.assignedHospitalId === 'h1' && ['dispatched', 'en_route'].includes(r.status));

  const toggleBed = (ward: string, id: number) => {
    setBeds(prev => ({ ...prev, [ward]: prev[ward].map(b => b.id === id ? { ...b, occupied: !b.occupied } : b) }));
  };

  const toggleGroup = (g: string) => setNotifGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const sendNotif = async () => {
    if (!message || !notifGroups.length) { toast.error('Select groups and enter message'); return; }
    toast.success(`📣 Sent to: ${notifGroups.join(', ')}`);
    setMessage(''); setNotifGroups([]);
  };

  const tabs = [
    { id: 'dash', label: '🏠 Overview' },
    { id: 'beds', label: '🛏 Beds' },
    { id: 'incoming', label: `🚑 Incoming ${incoming.length > 0 ? `(${incoming.length})` : ''}` },
    { id: 'notify', label: '🔔 Notify Staff' },
  ] as const;

  const currentBeds = beds[selectedWard] || [];
  const available = currentBeds.filter(b => !b.occupied).length;

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.content} className="fade-in">
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

        {/* Overview Tab */}
        {tab === 'dash' && hospital && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>{hospital.name}</h2>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>📍 {hospital.address}</p>
            </div>

            {incoming.length > 0 && (
              <div style={{ background: '#fff7ed', border: '2px solid #f97316', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#c2410c' }}>🚑 {incoming.length} patient(s) incoming</span>
                <button onClick={() => setTab('incoming')} style={{ padding: '6px 12px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>View →</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { label: 'Available Beds', value: hospital.availableBeds, total: hospital.totalBeds, color: '#059669' },
                { label: 'ICU Available', value: hospital.icuAvailable, total: hospital.icuTotal, color: '#8b5cf6' },
                { label: 'Ventilators', value: hospital.ventilatorsAvailable, total: hospital.ventilatorsTotal, color: '#0ea5e9' },
              ].map(s => {
                const pct = (s.value / s.total) * 100;
                return (
                  <div key={s.label} style={{ ...S.card, marginBottom: 0, textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: pct < 20 ? '#ef4444' : s.color }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 8px' }}>{s.label}</div>
                    <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct < 20 ? '#ef4444' : s.color, borderRadius: '3px', transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>of {s.total} total</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Beds Tab */}
        {tab === 'beds' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {WARDS.map(w => (
                <button key={w} onClick={() => setSelectedWard(w)} style={{
                  padding: '7px 14px', borderRadius: '8px', border: `2px solid ${selectedWard === w ? '#059669' : '#e2e8f0'}`,
                  background: selectedWard === w ? '#ecfdf5' : '#fff', color: selectedWard === w ? '#059669' : '#64748b',
                  fontWeight: '600', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {w}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { l: 'Available', v: available, c: '#059669' },
                { l: 'Occupied', v: currentBeds.length - available, c: '#ef4444' },
                { l: 'Total', v: currentBeds.length, c: '#64748b' },
              ].map(s => (
                <div key={s.l} style={{ ...S.card, textAlign: 'center', marginBottom: 0 }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{s.l}</div>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ ...S.heading, marginBottom: 0 }}>{selectedWard} Ward</h2>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                  <span>🟩 Available</span>
                  <span>🟥 Occupied</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {currentBeds.map(bed => (
                  <button
                    key={bed.id}
                    onClick={() => toggleBed(selectedWard, bed.id)}
                    title={`Bed ${bed.id + 1}: ${bed.occupied ? 'Occupied' : 'Available'}`}
                    style={{
                      aspectRatio: '1', borderRadius: '10px', border: `2px solid ${bed.occupied ? '#fca5a5' : '#a7f3d0'}`,
                      background: bed.occupied ? '#fef2f2' : '#ecfdf5', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', transition: 'all 0.15s',
                    }}
                  >
                    <span>🛏</span>
                    <span style={{ fontSize: '10px', color: bed.occupied ? '#ef4444' : '#059669', fontWeight: '700', marginTop: '2px' }}>{bed.id + 1}</span>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '12px', marginBottom: 0 }}>Click any bed to toggle occupied/available</p>
            </div>
          </div>
        )}

        {/* Incoming Tab */}
        {tab === 'incoming' && (
          <div>
            {incoming.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                <div style={{ fontWeight: '600' }}>No patients currently incoming</div>
              </div>
            ) : incoming.map(req => (
              <div key={req.id} style={{ ...S.card, borderLeft: '4px solid #f97316' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '16px' }}>{req.patientName}, {req.patientAge} yrs</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{req.emergencyType} · Blood: <strong style={{ color: '#ef4444' }}>{req.patientBloodGroup}</strong></div>
                  </div>
                  <div style={{ padding: '6px 12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontWeight: '700', fontSize: '12px' }}>ETA: {req.eta}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {req.symptoms.map(s => (
                    <span key={s} style={{ background: '#fef2f2', color: '#991b1b', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', border: '1px solid #fecaca' }}>{s}</span>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {['Doctor', 'ICU', 'Nurse', 'Blood Bank'].map(team => (
                    <button key={team} onClick={() => toast.success(`${team} team notified!`)} style={{ padding: '8px', background: '#f0fdf4', border: '1px solid #a7f3d0', color: '#059669', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Notify {team}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notify Tab */}
        {tab === 'notify' && (
          <div style={S.card}>
            <h2 style={S.heading}>Notify Staff</h2>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Select Groups</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['Doctors', 'Nurses', 'ICU Staff', 'Emergency', 'Blood Bank', 'Admin'].map(g => (
                  <button key={g} onClick={() => toggleGroup(g)} style={{
                    padding: '10px', border: `2px solid ${notifGroups.includes(g) ? '#059669' : '#e2e8f0'}`,
                    background: notifGroups.includes(g) ? '#ecfdf5' : '#fff', borderRadius: '10px',
                    color: notifGroups.includes(g) ? '#059669' : '#64748b', fontWeight: '600', fontSize: '13px',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    {notifGroups.includes(g) ? '✓ ' : ''}{g}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Quick Messages</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Code Blue – all hands', 'ICU prep needed', 'Reserve O+ blood', 'Trauma bay activation'].map(m => (
                  <button key={m} onClick={() => setMessage(m)} style={{ padding: '5px 10px', background: message === m ? '#059669' : '#f1f5f9', color: message === m ? '#fff' : '#374151', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>{m}</button>
                ))}
              </div>
            </div>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type alert message..." style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' as const }} rows={3} />
            <button onClick={sendNotif} style={{ width: '100%', padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}>
              📣 Send Alert
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
