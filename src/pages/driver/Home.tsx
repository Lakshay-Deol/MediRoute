import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { LiveMap } from '../../components/map/LiveMap';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { EMERGENCY_REQUESTS, type LatLng } from '../../data/mockData';
import { getNearbyHospitals, type NearbyHospital } from '../../services/api';
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
  Building2,
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
  const [nearbyHospitals, setNearbyHospitals] = useState<NearbyHospital[]>([]);

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

  // The destination hospital is dynamically determined by nearest hospital to patient/driver
  const targetHospital: { name: string; address: string; lat: number; lng: number } = nearbyHospitals.length > 0 ? {
    name: nearbyHospitals[0].name,
    address: nearbyHospitals[0].address,
    lat: nearbyHospitals[0].lat,
    lng: nearbyHospitals[0].lng,
  } : {
    name: 'AIIMS Emergency Trauma Center',
    address: 'Ansari Nagar, New Delhi',
    lat: 28.5672,
    lng: 77.2100,
  };

  // Fetch real nearby hospitals whenever driver coordinates change
  useEffect(() => {
    getNearbyHospitals(driverLoc.lat, driverLoc.lng).then((hList) => {
      if (hList && hList.length > 0) {
        setNearbyHospitals(hList);
      }
    }).catch(() => {});
  }, [driverLoc.lat, driverLoc.lng]);

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
            toast.success(`🏥 Arrived at ${targetHospital.name}!`);
          }
          return 100;
        }

        const next = prev + 5;
        const target = navTarget === 'patient' ? patientLoc : { lat: targetHospital.lat, lng: targetHospital.lng };
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
  }, [isDriving, navTarget, patientLoc, targetHospital]);

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
    toast.success(`🚑 Patient onboard! Rerouting to ${targetHospital.name}.`);
  };

  const handleResetNavigation = () => {
    setIsDriving(false);
    setDriveProgress(0);
    setNavTarget('patient');
    setDriverLoc(DEFAULT_DRIVER_LOC);
    toast('Navigation reset to initial position', { icon: '🔄' });
  };

  // Map markers for driver navigation
  const currentDestination = navTarget === 'patient' ? patientLoc : { lat: targetHospital.lat, lng: targetHospital.lng };
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

        {/* Top Bar with Online Status & GPS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px' }}>
              Ambulance Driver Operations
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              Fleet Unit #{ambulance.vehicleNumber} · Driver: {ambulance.driverName}
            </p>
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

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: tab === t.id ? '#059669' : '#ffffff',
                color: tab === t.id ? '#ffffff' : '#64748b',
                fontWeight: '700',
                fontSize: '13px',
                boxShadow: tab === t.id ? '0 2px 8px rgba(5,150,105,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* --- TAB 1: FLEET DASHBOARD --- */}
        {tab === 'dash' && (
          <div>
            {/* Live Driver Map on Home Tab */}
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ ...S.heading, marginBottom: '2px' }}>Live Patrol & Hospital Radar</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Real-time position of your ambulance ({ambulance.vehicleNumber}) and verified nearby hospitals based on your location
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

              {/* Live Map Component showing real nearby hospitals */}
              <LiveMap
                center={driverLoc}
                zoom={13}
                height="340px"
                markers={[
                  { type: 'ambulance', position: driverLoc, label: `Ambulance (${ambulance.vehicleNumber}) - Active`, info: 'Speed: ' + speed + ' km/h' },
                  ...nearbyHospitals.slice(0, 5).map(h => ({
                    type: 'hospital' as const,
                    position: { lat: h.lat, lng: h.lng },
                    label: h.name,
                    info: `${h.address} · ${h.availableBeds} beds (${h.icuAvailable} ICU) · ${h.distance}`,
                  }))
                ]}
              />
            </div>

            {/* Nearby Verified Emergency Hospitals List */}
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ ...S.heading, marginBottom: 0 }}>📍 Verified Hospitals in Your Sector</h2>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                  {nearbyHospitals.length} centers found
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                {nearbyHospitals.slice(0, 4).map((h) => (
                  <div
                    key={h.id}
                    style={{
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Building2 size={15} color="#059669" />
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>{h.name}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>{h.address}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                      <span style={{ color: '#059669' }}>📍 {h.distance} ({h.eta})</span>
                      <span style={{ color: '#7c3aed' }}>🛏 {h.availableBeds} beds ({h.icuAvailable} ICU)</span>
                    </div>
                  </div>
                ))}
              </div>
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
                  <div style={{ fontWeight: '800', color: '#059669', fontSize: '16px', marginTop: '2px' }}>1.4 km</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Estimated ETA</div>
                  <div style={{ fontWeight: '800', color: '#d97706', fontSize: '16px', marginTop: '2px' }}>~3-4 mins</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Assigned Hospital</div>
                  <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '14px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {targetHospital.name.split(' ')[0]} ({nearbyHospitals[0]?.distance || '2.1 km'})
                  </div>
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
                    {navTarget === 'patient' ? 'Leg 1: En Route to Patient' : `Leg 2: En Route to ${targetHospital.name}`}
                  </span>
                  <span style={{ fontSize: '13px', opacity: 0.8 }}>
                    {isDriving ? '● Navigation Active' : '○ Paused'}
                  </span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800' }}>
                  {navTarget === 'patient' ? `Navigating to ${incoming.patientName}` : `Heading to ${targetHospital.name}`}
                </div>
              </div>

              {/* Simulation & Movement Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setIsDriving(!isDriving)}
                  style={{
                    padding: '10px 16px',
                    background: isDriving ? '#dc2626' : '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isDriving ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isDriving ? 'Pause Sim' : 'Start Drive Sim'}</span>
                </button>

                {navTarget === 'patient' ? (
                  <button
                    onClick={handleArrivedAtPatient}
                    style={{
                      padding: '10px 16px',
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Patient Onboard</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={handleResetNavigation}
                    style={{
                      padding: '10px 14px',
                      background: '#334155',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Progress Bar */}
            <div style={{ ...S.card, padding: '14px 18px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                <span>Route Progress ({navTarget === 'patient' ? 'To Patient' : 'To Hospital'})</span>
                <span style={{ color: '#059669' }}>{driveProgress}%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${driveProgress}%`,
                  background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.8s linear',
                }} />
              </div>
            </div>

            {/* Live Interactive Map */}
            <div style={{ ...S.card, padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
              <LiveMap
                center={driverLoc}
                zoom={14}
                height="400px"
                markers={[
                  { type: 'ambulance', position: driverLoc, label: 'Ambulance (Sirens Active)', info: `Telemetry: ${speed} km/h` },
                  ...(navTarget === 'patient' ? [
                    { type: 'patient' as const, position: patientLoc, label: `Patient: ${incoming.patientName}`, info: incoming.emergencyType }
                  ] : [
                    { type: 'hospital' as const, position: { lat: targetHospital.lat, lng: targetHospital.lng }, label: targetHospital.name, info: targetHospital.address }
                  ])
                ]}
                polyline={activePolyline}
              />
            </div>
          </div>
        )}

        {/* --- TAB 4: PATIENT MEDICAL FILE --- */}
        {tab === 'patient' && (
          <div style={S.card}>
            <h2 style={S.heading}>Emergency Patient Vitals & Triage Data</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Patient Name</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{incoming.patientName}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Age: {incoming.patientAge} years</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>Blood Group & Status</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#dc2626' }}>{incoming.patientBloodGroup} Positive</div>
                <div style={{ fontSize: '13px', color: '#b91c1c', marginTop: '2px' }}>Severity: {incoming.severity.toUpperCase()}</div>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#166534' }}>Destination Receiving Facility</div>
                <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{targetHospital.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{targetHospital.address}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontWeight: '700' }}>
                  ICU Reserved
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
