import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/layout/Navbar';
import { LiveMap } from '../../components/map/LiveMap';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { EMERGENCY_REQUESTS, PATIENT_PROFILE, HOSPITALS, type LatLng } from '../../data/mockData';
import toast from 'react-hot-toast';
import {
  Navigation,
  MapPin,
  Phone,
  Compass,
  Locate,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Clock,
  Radio,
} from 'lucide-react';

const S = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  content: { maxWidth: '960px', margin: '0 auto', padding: '24px 16px' },
  card: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  heading: { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', marginTop: 0 },
};

// Initial coordinates
const DEFAULT_DRIVER_LOC: LatLng = { lat: 28.5560, lng: 77.2100 };
const DEFAULT_PATIENT_LOC: LatLng = { lat: 28.5530, lng: 77.2050 };
const HOSPITAL_LOC: LatLng = { lat: 28.5672, lng: 77.2100 }; // AIIMS New Delhi

const TURN_BY_TURN_PATIENT = [
  { dir: '↑', text: 'Head north on Sri Aurobindo Marg toward Ring Road', dist: '350 m' },
  { dir: '→', text: 'Turn right onto Mahatma Gandhi Marg / Ring Road', dist: '800 m' },
  { dir: '←', text: 'Turn left onto Green Park Extension Main St', dist: '450 m' },
  { dir: '📍', text: 'Patient location on right (Near Metro Gate 2)', dist: 'Arrive' },
];

const TURN_BY_TURN_HOSPITAL = [
  { dir: '↑', text: 'Proceed south on Green Park Extension', dist: '400 m' },
  { dir: '→', text: 'Merge onto Ring Road towards AIIMS Flyover', dist: '1.2 km' },
  { dir: '←', text: 'Take the ramp onto Ansari Nagar Emergency Gate', dist: '300 m' },
  { dir: '🏥', text: 'Arrive at AIIMS Emergency Trauma Ward', dist: 'Arrive' },
];

export default function DriverHome() {
  const [isOnline, setIsOnline] = useState(true);
  const [tab, setTab] = useState<'dash' | 'incoming' | 'navigate' | 'patient'>('dash');
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(30);

  // Navigation simulation & location state
  const [driverLoc, setDriverLoc] = useState<LatLng>(DEFAULT_DRIVER_LOC);
  const [patientLoc, setPatientLoc] = useState<LatLng>(DEFAULT_PATIENT_LOC);
  const [navTarget, setNavTarget] = useState<'patient' | 'hospital'>('patient');
  const [isDriving, setIsDriving] = useState(false);
  const [driveProgress, setDriveProgress] = useState(0); // 0 to 100%
  const [speed, setSpeed] = useState(42);
  const [gpsLocked, setGpsLocked] = useState(false);

  const { ambulances } = useEmergencyStore();
  const ambulance = ambulances[0] || {
    vehicleNumber: 'DL-01-AB-1234',
    status: 'available',
    speed: 45,
    driverName: 'Rajesh Kumar',
  };

  const incoming = EMERGENCY_REQUESTS[0] || {
    id: 'req-1',
    patientName: 'Arjun Mehta',
    patientAge: 38,
    patientBloodGroup: 'O+',
    emergencyType: 'Cardiac Arrest',
    severity: 'critical',
    symptoms: ['Chest Pain', 'Shortness of breath', 'Sweating'],
    location: DEFAULT_PATIENT_LOC,
  };

  // Detect real device geolocation
  const detectLiveLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setDriverLoc(loc);
          // Offset patient nearby for demonstration if using real GPS
          setPatientLoc({ lat: loc.lat - 0.005, lng: loc.lng - 0.004 });
          setGpsLocked(true);
          toast.success('📍 Live GPS location detected!');
        },
        (err) => {
          console.warn('Geolocation failed:', err);
          toast('Using standard New Delhi fleet coordinates (GPS unavailable or denied)', { icon: 'ℹ️' });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  useEffect(() => {
    detectLiveLocation();
  }, []);

  // Countdown timer for incoming emergency
  useEffect(() => {
    if (tab !== 'incoming' || accepted !== null) return;
    const t = setInterval(() => {
      setCountdown((s) => {
        if (s <= 1) {
          setAccepted(false);
          toast.error('Emergency auto-declined (timeout)');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [tab, accepted]);

  // Driving animation loop
  useEffect(() => {
    if (!isDriving) return;

    const interval = setInterval(() => {
      setDriveProgress((prev) => {
        if (prev >= 100) {
          setIsDriving(false);
          if (navTarget === 'patient') {
            toast.success('🎯 Arrived at patient location!');
          } else {
            toast.success('🏥 Arrived at AIIMS Hospital Trauma Center!');
          }
          return 100;
        }

        const next = prev + 5;
        const target = navTarget === 'patient' ? patientLoc : HOSPITAL_LOC;
        const origin = navTarget === 'patient' ? DEFAULT_DRIVER_LOC : patientLoc;

        // Interpolate position along the path
        const factor = next / 100;
        const newLat = origin.lat + (target.lat - origin.lat) * factor;
        const newLng = origin.lng + (target.lng - origin.lng) * factor;

        setDriverLoc({ lat: newLat, lng: newLng });
        setSpeed(Math.floor(38 + Math.random() * 15));
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isDriving, navTarget, patientLoc]);

  const handleAccept = () => {
    setAccepted(true);
    toast.success('✅ Emergency Accepted! Starting live navigation.');
    setTab('navigate');
    setIsDriving(true);
  };

  const handleDecline = () => {
    setAccepted(false);
    toast.error('Emergency request declined');
  };

  const handleArrivedAtPatient = () => {
    setNavTarget('hospital');
    setDriveProgress(0);
    setIsDriving(true);
    toast.success('🚑 Patient onboard! Rerouting to AIIMS Emergency Trauma Ward.');
  };

  const handleResetNavigation = () => {
    setIsDriving(false);
    setDriveProgress(0);
    setNavTarget('patient');
    setDriverLoc(DEFAULT_DRIVER_LOC);
    toast('Navigation reset to initial position', { icon: '🔄' });
  };

  // Map markers for driver navigation
  const currentDestination = navTarget === 'patient' ? patientLoc : HOSPITAL_LOC;
  const activePolyline = [driverLoc, currentDestination];

  const tabs = [
    { id: 'dash', label: '🏠 Fleet Overview' },
    { id: 'incoming', label: '🚨 Incoming Alert' },
    { id: 'navigate', label: '🗺️ Live Navigation' },
    { id: 'patient', label: '👤 Patient Medical' },
  ] as const;

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.content} className="fade-in">

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                background: tab === t.id ? '#059669' : '#fff',
                color: tab === t.id ? '#fff' : '#64748b',
                fontWeight: '700',
                fontSize: '13px',
                boxShadow: tab === t.id ? '0 4px 12px rgba(5,150,105,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{t.label}</span>
              {t.id === 'incoming' && accepted === null && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  display: 'inline-block',
                }} />
              )}
            </button>
          ))}
        </div>

        {/* --- TAB 1: FLEET OVERVIEW & LIVE RADAR MAP --- */}
        {tab === 'dash' && (
          <div>
            {/* Status Card */}
            <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '18px', color: '#0f172a' }}>Ambulance Patrol Console</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={14} color={isOnline ? '#059669' : '#94a3b8'} />
                  <span>{isOnline ? 'GPS Active · Receiving emergency broadcasts' : 'You are currently offline'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={detectLiveLocation}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#fff',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Locate size={15} color="#059669" />
                  <span>{gpsLocked ? 'GPS Locked' : 'Locate Me'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsOnline((p) => !p);
                    toast.success(isOnline ? '🔴 You are now offline' : '🟢 You are now online');
                  }}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isOnline ? '#059669' : '#e2e8f0',
                    color: isOnline ? '#fff' : '#64748b',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {isOnline ? '● Online & Ready' : '○ Go Online'}
                </button>
              </div>
            </div>

            {/* Live Driver Map on Home Tab */}
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h2 style={{ ...S.heading, marginBottom: '2px' }}>Live Patrol & Hospital Radar</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Real-time position of your ambulance ({ambulance.vehicleNumber}) and nearby trauma care hospitals
                  </p>
                </div>
                <button
                  onClick={() => setTab('navigate')}
                  style={{
                    padding: '8px 14px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    color: '#059669',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Navigation size={14} />
                  <span>Open Full Navigation</span>
                </button>
              </div>

              {/* Live Map Component */}
              <LiveMap
                center={driverLoc}
                zoom={14}
                height="320px"
                markers={[
                  { type: 'ambulance', position: driverLoc, label: `Ambulance (${ambulance.vehicleNumber}) - Active`, info: 'Speed: ' + speed + ' km/h' },
                  { type: 'hospital', position: { lat: 28.5672, lng: 77.2100 }, label: 'AIIMS New Delhi', info: '25 ICU Beds Available' },
                  { type: 'hospital', position: { lat: 28.5714, lng: 77.2081 }, label: 'Safdarjung Hospital', info: '18 Beds Available' },
                  { type: 'hospital', position: { lat: 28.5273, lng: 77.2140 }, label: 'Max Super Speciality', info: '12 ICU Beds Available' },
                ]}
              />
            </div>

            {/* Key Fleet Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: "Today's Earnings", value: '₹2,450', change: '+18% today' },
                { label: 'Completed Dispatches', value: '14 trips', change: 'Avg response 4.2m' },
                { label: 'Driver Rating', value: '⭐ 4.9', change: 'Top 5% responder' },
              ].map((s) => (
                <div key={s.label} style={{ ...S.card, textAlign: 'center', marginBottom: 0 }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '600' }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px' }}>{s.change}</div>
                </div>
              ))}
            </div>

            {/* Vehicle Details */}
            <div style={S.card}>
              <h2 style={S.heading}>Assigned Fleet Unit</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  ['Vehicle Plate', ambulance.vehicleNumber],
                  ['Fleet Status', isDriving ? 'En Route (Sirens On)' : 'Patrolling / Ready'],
                  ['Telemetry Speed', `${speed} km/h`],
                  ['Assigned Driver', ambulance.driverName],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '500' }}>{k}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: INCOMING EMERGENCY ALERT --- */}
        {tab === 'incoming' && (
          <div>
            {accepted === null && (
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                border: '2px solid #f97316',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(249,115,22,0.15)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={24} color="#ea580c" />
                  <div>
                    <span style={{ fontWeight: '800', color: '#c2410c', fontSize: '16px' }}>🚨 Critical Emergency Broadcast</span>
                    <div style={{ fontSize: '12px', color: '#9a3412' }}>Immediate response requested · Auto-decline if unresponsive</div>
                  </div>
                </div>
                <div style={{
                  background: '#ea580c',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '20px',
                  letterSpacing: '0.05em',
                }}>
                  {countdown}s
                </div>
              </div>
            )}

            {accepted === true && (
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #059669',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={22} color="#059669" />
                  <span style={{ fontWeight: '800', color: '#059669', fontSize: '15px' }}>
                    Emergency Dispatched — Turn-by-Turn navigation is engaged
                  </span>
                </div>
                <button
                  onClick={() => setTab('navigate')}
                  style={{
                    padding: '8px 16px',
                    background: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  View Map
                </button>
              </div>
            )}

            <div style={S.card}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  padding: '6px 12px',
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#991b1b',
                  fontWeight: '800',
                }}>
                  {incoming.severity.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '18px', color: '#0f172a' }}>{incoming.emergencyType}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Patient: <strong>{incoming.patientName}</strong> · Age: {incoming.patientAge} · Blood Group: <strong style={{ color: '#dc2626' }}>{incoming.patientBloodGroup}</strong>
                  </div>
                </div>
              </div>

              {/* Distance Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Distance to Patient</div>
                  <div style={{ fontWeight: '800', color: '#059669', fontSize: '16px', marginTop: '2px' }}>1.8 km</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Estimated ETA</div>
                  <div style={{ fontWeight: '800', color: '#d97706', fontSize: '16px', marginTop: '2px' }}>~4-5 mins</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Nearest Hospital</div>
                  <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '16px', marginTop: '2px' }}>AIIMS (2.3 km)</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>REPORTED SYMPTOMS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {incoming.symptoms.map((s: string) => (
                    <span key={s} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Map Preview */}
              <LiveMap
                center={patientLoc}
                zoom={14}
                height="220px"
                markers={[
                  { type: 'patient', position: patientLoc, label: `Emergency: ${incoming.patientName}`, info: incoming.emergencyType },
                  { type: 'ambulance', position: driverLoc, label: 'Your Ambulance' },
                ]}
                polyline={[driverLoc, patientLoc]}
              />

              {accepted === null && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                  <button
                    onClick={handleDecline}
                    style={{
                      padding: '14px',
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: '#64748b',
                    }}
                  >
                    ✕ Decline Dispatch
                  </button>
                  <button
                    onClick={handleAccept}
                    style={{
                      padding: '14px',
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '15px',
                      cursor: 'pointer',
                      color: '#fff',
                      boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
                    }}
                  >
                    ✓ Accept & Start Navigation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 3: FULL LIVE MAP & TURN-BY-TURN NAVIGATION --- */}
        {tab === 'navigate' && (
          <div>
            {/* Navigation Status Header */}
            <div style={{
              ...S.card,
              background: navTarget === 'patient' ? '#0f172a' : '#042f2e',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: navTarget === 'patient' ? '#dc2626' : '#059669',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                  }}>
                    {navTarget === 'patient' ? 'Leg 1: En Route to Patient' : 'Leg 2: En Route to AIIMS Hospital'}
                  </span>
                  <span style={{ fontSize: '13px', opacity: 0.8 }}>
                    {isDriving ? '● Navigation Active' : '○ Paused'}
                  </span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800' }}>
                  {navTarget === 'patient' ? `Navigating to ${incoming.patientName}` : 'Heading to AIIMS Trauma Care'}
                </div>
              </div>

              {/* Simulation & Movement Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setIsDriving(!isDriving)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isDriving ? '#f59e0b' : '#10b981',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isDriving ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isDriving ? 'Pause Driving' : 'Drive Along Route'}</span>
                </button>
                <button
                  onClick={handleResetNavigation}
                  title="Reset to start"
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Live Navigation Map */}
            <div style={{ ...S.card, padding: '0', overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
              <LiveMap
                center={driverLoc}
                zoom={15}
                height="420px"
                markers={[
                  {
                    type: 'ambulance',
                    position: driverLoc,
                    label: `Your Ambulance (DL-01-AB-1234)`,
                    info: `Speed: ${speed} km/h · ETA: ${Math.max(1, Math.round((100 - driveProgress) * 0.05))} mins`,
                  },
                  {
                    type: 'patient',
                    position: patientLoc,
                    label: `Patient: ${incoming.patientName}`,
                    info: incoming.emergencyType,
                  },
                  {
                    type: 'hospital',
                    position: HOSPITAL_LOC,
                    label: 'AIIMS Delhi Emergency',
                    info: 'Trauma Ward Ready',
                    selected: navTarget === 'hospital',
                  },
                ]}
                polyline={activePolyline}
              />

              {/* Progress & Telemetry Bar */}
              <div style={{ padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    <span>Route Completion</span>
                    <span>{driveProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${driveProgress}%`, height: '100%', background: '#059669', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Speed</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{speed} km/h</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Distance Left</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#059669' }}>
                      {((1 - driveProgress / 100) * (navTarget === 'patient' ? 1.8 : 2.4)).toFixed(1)} km
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Transition Action */}
            {navTarget === 'patient' ? (
              <button
                onClick={handleArrivedAtPatient}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: '800',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 14px rgba(5,150,105,0.25)',
                }}
              >
                <span>✓ Arrived at Patient ➔ Load & Navigate to Hospital</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={() => {
                  toast.success('🎉 Patient safely admitted to AIIMS Emergency! Dispatch completed.');
                  setTab('dash');
                  handleResetNavigation();
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: '800',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                }}
              >
                <span>🏥 Patient Admitted at Hospital — Complete Trip</span>
              </button>
            )}

            {/* Turn-by-Turn Directions */}
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Compass size={18} color="#059669" />
                <h2 style={{ ...S.heading, margin: 0 }}>
                  {navTarget === 'patient' ? 'Turn-by-Turn to Patient' : 'Turn-by-Turn to AIIMS Hospital'}
                </h2>
              </div>
              {(navTarget === 'patient' ? TURN_BY_TURN_PATIENT : TURN_BY_TURN_HOSPITAL).map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: i === 0 ? '#059669' : '#f1f5f9',
                    color: i === 0 ? '#fff' : '#64748b',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '800',
                    flexShrink: 0,
                  }}>
                    {step.dir}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: i === 0 ? '700' : '500', color: i === 0 ? '#059669' : '#334155' }}>
                      {step.text}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{step.dist}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 4: PATIENT MEDICAL PROFILE --- */}
        {tab === 'patient' && (
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ ...S.heading, margin: 0 }}>Critical Patient Medical File</h2>
              <a
                href={`tel:${PATIENT_PROFILE.phone}`}
                style={{
                  padding: '8px 14px',
                  background: '#ecfdf5',
                  color: '#059669',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Phone size={14} />
                <span>Call Patient</span>
              </a>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', borderRadius: '14px', padding: '20px', textAlign: 'center', marginBottom: '16px', boxShadow: '0 4px 14px rgba(239,68,68,0.25)' }}>
              <div style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '0.05em' }}>{PATIENT_PROFILE.bloodGroup}</div>
              <div style={{ fontSize: '12px', fontWeight: '700', opacity: 0.9, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                VERIFIED BLOOD GROUP
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '48px', height: '48px', background: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '18px' }}>
                AM
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a' }}>{PATIENT_PROFILE.name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {PATIENT_PROFILE.age} yrs · Contact: {PATIENT_PROFILE.phone}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#dc2626', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ⚠️ CRITICAL ALLERGIES & CONTRAINDICATIONS
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PATIENT_PROFILE.allergies.map((a: string) => (
                  <span key={a} style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#991b1b', padding: '6px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '13px' }}>
                    ⛔ {a}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Conditions & Prescriptions
              </div>
              {[...PATIENT_PROFILE.chronicConditions, ...PATIENT_PROFILE.medications].map((item: string) => (
                <div key={item} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                  • {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
