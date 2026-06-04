import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { LiveMap } from '../../components/map/LiveMap';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { ANALYTICS_DATA } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { timeAgo } from '../../utils/simulators';

const S = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  content: { maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' },
  card: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '16px' },
  heading: { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', marginTop: 0 },
};

const SEV_COLORS: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#059669',
};

const MAP_CENTER = { lat: 28.5600, lng: 77.2050 };

export default function AdminHome() {
  const [tab, setTab] = useState<'map' | 'queue' | 'fleet' | 'analytics'>('map');
  const [filter, setFilter] = useState('All');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { ambulances, hospitals, requests } = useEmergencyStore();

  useEffect(() => {
    const t = setInterval(() => setLastUpdated(new Date()), 3000);
    return () => clearInterval(t);
  }, []);

  const allMarkers = [
    ...ambulances.filter(a => a.status !== 'offline').map(a => ({
      type: 'ambulance' as const,
      position: a.location,
      label: `${a.driverName} · ${a.status}`,
    })),
    ...requests.filter(r => r.status === 'pending').map(r => ({
      type: 'patient' as const,
      position: r.location,
      label: `${r.patientName} · ${r.emergencyType}`,
    })),
    ...hospitals.map(h => ({
      type: 'hospital' as const,
      position: h.location,
      label: `${h.name} · ${h.availableBeds} beds`,
    })),
  ];

  const activeReqs = requests.filter(r => ['pending', 'dispatched', 'en_route'].includes(r.status));
  const filteredReqs = filter === 'All' ? requests : requests.filter(r => {
    if (filter === 'Active') return ['pending', 'dispatched', 'en_route'].includes(r.status);
    if (filter === 'Completed') return r.status === 'completed';
    return true;
  });

  const tabs = [
    { id: 'map', label: '🗺️ Command Map' },
    { id: 'queue', label: '📋 Queue' },
    { id: 'fleet', label: '🚑 Fleet' },
    { id: 'analytics', label: '📊 Analytics' },
  ] as const;

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.content} className="fade-in">
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Active Emergencies', value: activeReqs.length, color: '#ef4444' },
            { label: 'Ambulances Available', value: ambulances.filter(a => a.status === 'available').length, color: '#059669' },
            { label: 'Busy Ambulances', value: ambulances.filter(a => a.status === 'busy').length, color: '#f59e0b' },
            { label: 'Hospitals Online', value: hospitals.length, color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} style={{ ...S.card, textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
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

        {/* Map Tab */}
        {tab === 'map' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>
            <div>
              <LiveMap center={MAP_CENTER} zoom={13} markers={allMarkers} height="480px" />
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '480px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔴 Active Emergencies</div>
              {activeReqs.map(req => (
                <div key={req.id} style={{ background: '#fff', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px', border: `1px solid ${SEV_COLORS[req.severity]}30`, borderLeft: `3px solid ${SEV_COLORS[req.severity]}` }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{req.emergencyType}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{req.patientName}</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', background: SEV_COLORS[req.severity] + '20', color: SEV_COLORS[req.severity], padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>{req.severity}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{req.eta || '—'}</span>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', margin: '12px 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏥 Hospitals</div>
              {hospitals.map(h => {
                const pct = Math.round((h.availableBeds / h.totalBeds) * 100);
                return (
                  <div key={h.id} style={{ background: '#fff', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}>{h.name.split(' ')[0]}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                      <span style={{ color: '#64748b' }}>Beds</span>
                      <span style={{ color: pct < 20 ? '#ef4444' : '#059669', fontWeight: '700' }}>{pct}%</span>
                    </div>
                    <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct < 20 ? '#ef4444' : '#059669', borderRadius: '2px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Queue Tab */}
        {tab === 'queue' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['All', 'Active', 'Completed'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: filter === f ? '#059669' : '#f1f5f9', color: filter === f ? '#fff' : '#64748b', fontWeight: '600', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{f}</button>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>⟳ {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {['Patient', 'Emergency', 'Severity', 'Status', 'ETA', 'Time'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredReqs.map(req => (
                    <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{req.patientName}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{req.patientAge}y · {req.patientBloodGroup}</div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '13px', color: '#374151' }}>{req.emergencyType}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ padding: '3px 8px', background: SEV_COLORS[req.severity] + '15', color: SEV_COLORS[req.severity], borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{req.severity}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', color: '#64748b' }}>{req.status.replace('_', ' ')}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>{req.eta || '—'}</td>
                      <td style={{ padding: '10px 14px', fontSize: '11px', color: '#94a3b8' }}>{timeAgo(req.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fleet Tab */}
        {tab === 'fleet' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Vehicle', 'Driver', 'Status', 'Speed', 'Rating'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ambulances.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600', fontSize: '13px' }}>{a.vehicleNumber}</td>
                    <td style={{ padding: '10px 14px', fontSize: '13px', color: '#374151' }}>{a.driverName}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '3px 8px', background: a.status === 'available' ? '#ecfdf5' : a.status === 'busy' ? '#fff7ed' : '#f1f5f9', color: a.status === 'available' ? '#059669' : a.status === 'busy' ? '#f97316' : '#94a3b8', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                        {a.status === 'available' ? '● ' : a.status === 'busy' ? '● ' : '○ '}{a.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '13px', color: '#64748b' }}>{a.speed > 0 ? `${a.speed} km/h` : 'Parked'}</td>
                    <td style={{ padding: '10px 14px', fontSize: '13px' }}>⭐ {a.driverRating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <div>
            <div style={S.card}>
              <h2 style={S.heading}>Response Time Distribution</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ANALYTICS_DATA.responseTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                  <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} name="Cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Total (Jun)', value: 191 },
                { label: 'Avg Response', value: '8.2 min' },
                { label: 'Bed Occupancy', value: '82%' },
                { label: 'Satisfaction', value: '4.7/5' },
              ].map(s => (
                <div key={s.label} style={{ ...S.card, textAlign: 'center', marginBottom: 0 }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
