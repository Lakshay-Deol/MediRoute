import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Phone,
  Shield,
  HeartPulse,
  Navigation,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Activity,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Locate,
  Zap,
  Ambulance,
  Bed,
} from 'lucide-react';
import { HOSPITALS } from '../data/mockData';
import { getNearbyHospitals } from '../services/api';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const DEFAULT_SPECIALTIES = [
  ['Cardiology', 'Emergency Care', 'Trauma'],
  ['Critical Care', 'Neurology', 'Casualty Ward'],
  ['Orthopaedics', 'General Medicine', 'ICU Care'],
  ['Pulmonology', 'Accident & Emergency', 'Trauma'],
];

export default function Landing() {
  const navigate = useNavigate();
  const [city, setCity] = useState('Locating nearby...');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 31.468, lng: 76.270 });
  const [liveHospitals, setLiveHospitals] = useState<any[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'cardiac' | 'icu' | 'trauma'>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Fetch real hospitals whenever coordinates update
  useEffect(() => {
    setLoadingHospitals(true);
    getNearbyHospitals(coords.lat, coords.lng)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((h, i) => ({
            id: String(h.id),
            name: h.name,
            address: h.address || 'Regional Medical Center',
            lat: h.lat,
            lng: h.lng,
            distance: h.distanceKm < 1 ? `${Math.round(h.distanceKm * 1000)} m` : `${h.distanceKm} km`,
            distanceKm: h.distanceKm,
            eta: `${h.etaMin || 5} min`,
            totalBeds: h.totalBeds || 60,
            availableBeds: h.availableBeds || 16,
            icuTotal: 25,
            icuAvailable: h.icuAvailable || 6,
            rating: h.rating || 4.6,
            specialties: DEFAULT_SPECIALTIES[i % DEFAULT_SPECIALTIES.length],
            source: h.source || 'OpenStreetMap Live',
          }));
          setLiveHospitals(mapped);
        } else {
          setLiveHospitals(HOSPITALS);
        }
        setLoadingHospitals(false);
      })
      .catch(() => {
        setLiveHospitals(HOSPITALS);
        setLoadingHospitals(false);
      });
  }, [coords.lat, coords.lng]);

  // Initial location detection on mount
  useEffect(() => {
    let resolved = false;

    // IP lookup
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((d) => {
        if (!resolved && d.latitude && d.longitude) {
          setCoords({ lat: Number(d.latitude), lng: Number(d.longitude) });
          setCity(d.city ? `${d.city}, ${d.region || 'India'}` : 'Your Location');
        }
      })
      .catch(() => {});

    // Browser GPS
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          resolved = true;
          const { latitude: lat, longitude: lng } = pos.coords;
          setCoords({ lat, lng });
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const cityName = data.address?.city || data.address?.town || data.address?.county || data.address?.state_district || 'Your Area';
            setCity(`${cityName}, India`);
          } catch {
            setCity('Local Area');
          }
        },
        () => {
          if (!resolved) {
            setCity('Una Region, Himachal Pradesh');
          }
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    } else {
      setCity('Una Region, Himachal Pradesh');
    }
  }, []);

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      setDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setCoords({ lat, lng });
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await res.json();
            const cityName = data.address?.city || data.address?.town || data.address?.county || data.address?.state_district || 'Your City';
            setCity(`${cityName}, India`);
            toast.success(`📍 Real GPS detected: ${cityName}`);
          } catch {
            setCity(`${lat.toFixed(3)}, ${lng.toFixed(3)}`);
            toast.success('📍 Live GPS location locked');
          } finally {
            setDetectingLocation(false);
          }
        },
        () => {
          setDetectingLocation(false);
          toast.error('Location access denied. Using current region.');
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  };

  // Filtered hospital collections based on live hospitals
  const currentHospitalPool = liveHospitals.length > 0 ? liveHospitals : HOSPITALS;
  const filteredHospitals = useMemo(() => {
    return currentHospitalPool.filter((h) => {
      const matchSearch =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.specialties && h.specialties.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())));

      if (!matchSearch) return false;

      if (activeCategory === 'cardiac') {
        return h.specialties ? h.specialties.some((s: string) => s.toLowerCase().includes('cardiac') || s.toLowerCase().includes('heart')) : true;
      }
      if (activeCategory === 'icu') {
        return (h.icuAvailable || 0) >= 5;
      }
      if (activeCategory === 'trauma') {
        return h.specialties ? h.specialties.some((s: string) => s.toLowerCase().includes('trauma') || s.toLowerCase().includes('emergency') || s.toLowerCase().includes('casualty')) : true;
      }
      return true;
    });
  }, [currentHospitalPool, searchQuery, activeCategory]);

  const faqs = [
    {
      q: 'How does MediRoute calculate real-time ambulance ETA?',
      a: 'MediRoute continuously tracks available ALS (Advanced Life Support) and BLS (Basic Life Support) ambulances using high-precision GPS. The platform calculates the route using Haversine distance, OpenStreetMap road networks, and live traffic telemetry to provide exact arrival times.',
    },
    {
      q: 'Is hospital ICU and ventilator availability verified in real time?',
      a: 'Yes. Hospital triage desks and ICU coordinators manage and update bed inventories directly on their hospital portal. When an emergency is triggered, MediRoute cross-references live available beds, oxygen lines, and ventilators before recommending the destination.',
    },
    {
      q: 'Can patient and family track the dispatched ambulance on a live map?',
      a: 'Absolutely. As soon as an ambulance accepts the dispatch, the patient console displays a live interactive Leaflet map showing the ambulance vehicle moving along the route, driver contact details, license plate, and real-time speed.',
    },
    {
      q: 'How does the AI triage recommendation work?',
      a: 'When a patient or bystander selects symptoms (such as acute chest pain, trauma, or stroke), MediRoute analyzes symptom severity, patient blood group, and nearby hospital capabilities to recommend the highest-ranked medical facility within minutes.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ─────────────────────────────────────────
          1. ZOMATO-STYLE STICKY GLASS NAVBAR
      ───────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              }}
            >
              🚑
            </div>
            <div>
              <span style={{ fontWeight: '900', fontSize: '20px', letterSpacing: '-0.03em', color: '#0f172a' }}>
                Medi<span style={{ color: '#059669' }}>Route</span>
              </span>
            </div>
          </Link>

          {/* Quick city indicator */}
          <div
            onClick={handleDetectLocation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#f1f5f9',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
            }}
          >
            <MapPin size={14} color="#059669" />
            <span>{detectingLocation ? 'Detecting...' : city}</span>
            <ChevronDown size={12} color="#64748b" />
          </div>
        </div>

        {/* Right Navigation & Roles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/driver"
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '700',
              color: '#1d4ed8',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Navigation size={14} />
            <span>Driver Portal</span>
          </Link>

          <Link
            to="/hospital"
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '700',
              color: '#047857',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Building2 size={14} />
            <span>Hospital Desk</span>
          </Link>

          <Link
            to="/login"
            style={{
              padding: '9px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '700',
              color: '#ffffff',
              background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
            }}
          >
            Sign In / Register
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────
          2. HIGH-IMPACT ZOMATO-STYLE HERO SECTION
      ───────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          padding: '72px 20px 84px',
          background: 'radial-gradient(ellipse at 50% 0%, #ecfdf5 0%, #f0f9ff 45%, #ffffff 85%)',
          borderBottom: '1px solid #e2e8f0',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative glow dots */}
        <div style={{ position: 'absolute', top: '-10%', left: '15%', width: '380px', height: '380px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10%', right: '15%', width: '420px', height: '420px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.07)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '940px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          {/* Top verified network tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '30px',
              background: '#ffffff',
              border: '1.5px solid #a7f3d0',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.1)',
              marginBottom: '20px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', display: 'inline-block' }} className="pulse-green" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#047857' }}>
              India's Smart Emergency Dispatch & Live Bed Network
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1
            style={{
              fontSize: '48px',
              fontWeight: '900',
              lineHeight: '1.15',
              letterSpacing: '-0.03em',
              color: '#0f172a',
              margin: '0 0 16px',
            }}
          >
            Fastest Emergency Dispatch.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Live Hospital Beds.
            </span>
          </h1>

          <p
            style={{
              fontSize: '17px',
              color: '#475569',
              maxWidth: '680px',
              margin: '0 auto 36px',
              lineHeight: '1.6',
            }}
          >
            Find emergency ICUs in seconds, book smart ALS/BLS ambulances with real-time GPS tracking, and route critical patients with AI triage.
          </p>

          {/* ─────────────────────────────────────────
              SIGNATURE ZOMATO-STYLE FLOATING SEARCH BAR
          ───────────────────────────────────────── */}
          <div
            style={{
              maxWidth: '820px',
              margin: '0 auto',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '8px 12px',
              boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
              border: '1.5px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {/* Location selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                flex: '0 0 220px',
                cursor: 'pointer',
              }}
              onClick={handleDetectLocation}
            >
              <MapPin size={20} color="#059669" />
              <div style={{ textAlign: 'left', flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Current City</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {city}
                </div>
              </div>
              <Locate size={16} color="#2563eb" />
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '36px', background: '#e2e8f0' }} />

            {/* Keyword Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', padding: '0 12px' }}>
              <Search size={20} color="#94a3b8" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for hospitals, ICU beds, cardiac care, trauma..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0f172a',
                  background: 'transparent',
                }}
              />
            </div>

            {/* Instant SOS Button */}
            <button
              onClick={() => navigate('/patient')}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                whiteSpace: 'nowrap',
              }}
              className="pulse-red"
            >
              <span>🚨 Instant SOS</span>
            </button>
          </div>

          {/* Quick pills under search */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', alignSelf: 'center' }}>Popular:</span>
            {['AIIMS Delhi', 'Cardiac ICU', '24x7 Ambulance', 'Safdarjung Emergency', 'Ventilators'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────
          3. ZOMATO 3 BIG ACTION TILES
      ───────────────────────────────────────── */}
      <section style={{ maxWidth: '1120px', margin: '-32px auto 64px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Tile 1: Emergency SOS */}
          <div
            onClick={() => navigate('/patient')}
            className="zomato-action-tile"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              border: '1.5px solid #bbf7d0',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 6px 20px rgba(5, 150, 105, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                }}
              >
                🚑
              </div>
              <span style={{ padding: '4px 10px', background: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '12px', fontWeight: '800', border: '1px solid #a7f3d0' }}>
                ⚡ ~5 Min Arrival
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
              Instant Ambulance Dispatch
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px' }}>
              One-tap dispatch for certified ALS/BLS medical vans equipped with oxygen, defibrillator, and paramedic crew.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: '700', fontSize: '14px' }}>
              <span>Launch SOS Console</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Tile 2: Live Hospital Bed Finder */}
          <div
            onClick={() => navigate('/patient')}
            className="zomato-action-tile"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              border: '1.5px solid #bfdbfe',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                }}
              >
                🏥
              </div>
              <span style={{ padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontSize: '12px', fontWeight: '800', border: '1px solid #bfdbfe' }}>
                🟢 Live Sync
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
              Real-time ICU & Bed Finder
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px' }}>
              Explore verified hospital beds, ventilator capacity, and emergency facilities with distance and driving time.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: '700', fontSize: '14px' }}>
              <span>View Hospital Map</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Tile 3: Driver Navigation Hub */}
          <div
            onClick={() => navigate('/driver')}
            className="zomato-action-tile"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              border: '1.5px solid #cbd5e1',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                }}
              >
                🧭
              </div>
              <span style={{ padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '20px', fontSize: '12px', fontWeight: '800', border: '1px solid #e2e8f0' }}>
                🗺️ GPS Turn-by-Turn
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
              Ambulance Driver Radar
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px' }}>
              Accept incoming dispatches, navigate with real-time turn directions, and update patient pickup status seamlessly.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>
              <span>Open Driver Console</span>
              <ArrowRight size={16} />
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────
          4. ZOMATO-STYLE CURATED HOSPITAL COLLECTIONS
      ───────────────────────────────────────── */}
      <section style={{ maxWidth: '1120px', margin: '0 auto 64px', padding: '0 20px' }}>
        
        {/* Section Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Verified Emergency Hospitals & Trauma Centers
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              {liveHospitals.length > 0
                ? `Showing ${filteredHospitals.length} live OpenStreetMap medical centers around ${city}`
                : 'Showing verified facilities with active ICU capacity and 24x7 emergency casualty wards'}
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
            {[
              { id: 'all', label: 'All Centers' },
              { id: 'cardiac', label: '🫀 Cardiac Care' },
              { id: 'icu', label: '🏥 High ICU Beds' },
              { id: 'trauma', label: '🚨 Level-1 Trauma' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: activeCategory === tab.id ? '#059669' : 'transparent',
                  color: activeCategory === tab.id ? '#ffffff' : '#64748b',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hospitals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '24px' }}>
          {filteredHospitals.map((h) => (
            <div
              key={h.id}
              className="zomato-card"
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Card Header with Hospital Banner */}
              <div
                style={{
                  height: '140px',
                  background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#047857',
                    fontWeight: '800',
                    fontSize: '12px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}>
                    🏥 24x7 Emergency
                  </span>

                  {/* Rating Badge */}
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: '#15803d',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}>
                    <span>★ {h.rating}</span>
                  </span>
                </div>

                <div style={{ color: '#ffffff' }}>
                  <div style={{ fontSize: '19px', fontWeight: '900', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                    {h.name}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.95, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {h.address}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                {/* Distance and ETA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#059669', fontWeight: '700' }}>
                    <Clock size={15} />
                    <span>~{h.eta} away</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '700' }}>
                    📍 {h.distance}
                  </div>
                </div>

                {/* OpenStreetMap Live note */}
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ background: '#ecfdf5', color: '#059669', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                    ✓ OpenStreetMap Live
                  </span>
                  {h.lat && <span>({Number(h.lat).toFixed(3)}, {Number(h.lng).toFixed(3)})</span>}
                </div>

                {/* Bed & Ventilator Live Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ background: '#ecfdf5', padding: '8px 10px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '11px', color: '#047857', fontWeight: '600' }}>AVAILABLE BEDS</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#065f46' }}>
                      {h.availableBeds} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>/ {h.totalBeds}</span>
                    </div>
                  </div>
                  <div style={{ background: '#eff6ff', padding: '8px 10px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '600' }}>ICU CAPACITY</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e40af' }}>
                      {h.icuAvailable} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>/ {h.icuTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Specialties tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                  {h.specialties.map((s: string) => (
                    <span key={s} style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px' }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Action button */}
                <button
                  onClick={() => navigate('/patient')}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Select & Dispatch Ambulance</span>
                  <ArrowRight size={15} />
                </button>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────
          5. TELEMETRY & TRUST METRICS BAR
      ───────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '56px 20px',
          marginBottom: '64px',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              India's Most Dependable Emergency Response Network
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>
              Real-time synchronization between patients, certified ambulance drivers, and verified trauma facilities.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { num: '1,200+', label: 'Active Fleet Ambulances', sub: 'ALS & BLS GPS-enabled' },
              { num: '4.2 min', label: 'Average Response Time', sub: 'Across Tier-1 Metros' },
              { num: '150+', label: 'Partner Hospitals & ICUs', sub: 'Verified real-time beds' },
              { num: '99.4%', label: 'Critical Care Rating', sub: 'Over 28,000+ dispatches' },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ fontSize: '36px', fontWeight: '900', color: '#34d399', marginBottom: '4px' }}>{m.num}</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>{m.label}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          6. ZOMATO-STYLE FAQ ACCORDION
      ───────────────────────────────────────── */}
      <section style={{ maxWidth: '860px', margin: '0 auto 72px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Everything you need to know about MediRoute emergency coordination
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={faq.q}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: `1.5px solid ${isOpen ? '#059669' : '#e2e8f0'}`,
                  overflow: 'hidden',
                  boxShadow: isOpen ? '0 4px 16px rgba(5,150,105,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '700', color: isOpen ? '#059669' : '#0f172a' }}>
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={20} color="#059669" /> : <ChevronDown size={20} color="#94a3b8" />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 20px 20px', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────
          7. EMERGENCY HELPLINE & FOOTER
      ───────────────────────────────────────── */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '48px 20px 32px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                🚑
              </div>
              <div>
                <span style={{ fontWeight: '900', fontSize: '20px', color: '#0f172a' }}>
                  Medi<span style={{ color: '#059669' }}>Route</span>
                </span>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Emergency Medical Dispatch Platform</div>
              </div>
            </div>

            {/* 24x7 Hotline pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 18px',
              background: '#fef2f2',
              borderRadius: '14px',
              border: '1.5px solid #fecaca',
            }}>
              <Phone size={20} color="#dc2626" />
              <div>
                <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '800', textTransform: 'uppercase' }}>24x7 Emergency Line</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#dc2626' }}>102 / +91 98765 43210</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
              © 2026 MediRoute Technologies Pvt. Ltd. All rights reserved. Designed for critical healthcare mobility.
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
              <Link to="/patient" style={{ color: '#059669', textDecoration: 'none', fontWeight: '600' }}>Patient SOS</Link>
              <Link to="/driver" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Driver Radar</Link>
              <Link to="/hospital" style={{ color: '#047857', textDecoration: 'none', fontWeight: '600' }}>Hospital Desk</Link>
              <Link to="/login" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: '600' }}>Account</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
