import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { MapPin, BrainCircuit, Activity, ShieldAlert, Navigation } from 'lucide-react';

/* ─────────────────────────────────────────
   Full-screen background map (fixed, dim)
───────────────────────────────────────── */
const HOSPITALS = [
  { x: 180, y: 110, name: 'AIIMS Delhi',          beds: 42 },
  { x: 500, y: 190, name: 'Apollo Hospital',       beds: 18 },
  { x: 330, y: 290, name: 'Safdarjung',            beds: 7  },
  { x:  90, y: 310, name: 'Ram Manohar Lohia',     beds: 31 },
  { x: 590, y: 330, name: 'Max Healthcare',        beds: 25 },
  { x: 410, y:  75, name: 'Fortis',                beds: 14 },
  { x: 670, y: 150, name: 'Sir Ganga Ram',         beds: 9  },
  { x: 260, y: 400, name: 'Holy Family',           beds: 22 },
];

const GRID_H = [80, 160, 240, 320, 400, 480];
const GRID_V = [80, 180, 280, 380, 480, 580, 680, 780, 900];

const SOS = { x: 430, y: 265 };

const WAYPOINTS = [
  SOS,
  HOSPITALS[0],
  HOSPITALS[1],
  HOSPITALS[2],
  HOSPITALS[3],
  HOSPITALS[5],
];

function BackgroundMap() {
  const posRef   = useRef({ x: 60, y: 60 });
  const rafRef   = useRef<number>(0);
  const wpRef    = useRef(0);
  const lastRef  = useRef(0);

  // very slow speed
  const SPEED = 0.18;

  const svgRef = useRef<SVGSVGElement>(null);
  const ambulanceCircleRef = useRef<SVGCircleElement>(null);
  const ambulanceTextRef   = useRef<SVGTextElement>(null);
  const routeRef           = useRef<SVGLineElement>(null);

  useEffect(() => {
    const animate = (ts: number) => {
      const dt = Math.min(ts - lastRef.current, 40);
      lastRef.current = ts;

      const wp = WAYPOINTS[wpRef.current % WAYPOINTS.length];
      const dx = wp.x - posRef.current.x;
      const dy = wp.y - posRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 3) {
        wpRef.current = (wpRef.current + 1) % WAYPOINTS.length;
      } else {
        posRef.current.x += (dx / dist) * SPEED * dt;
        posRef.current.y += (dy / dist) * SPEED * dt;
      }

      const { x, y } = posRef.current;

      if (ambulanceCircleRef.current) {
        ambulanceCircleRef.current.setAttribute('cx', String(x));
        ambulanceCircleRef.current.setAttribute('cy', String(y));
      }
      if (ambulanceTextRef.current) {
        ambulanceTextRef.current.setAttribute('x', String(x));
        ambulanceTextRef.current.setAttribute('y', String(y + 5));
      }
      if (routeRef.current) {
        routeRef.current.setAttribute('x1', String(x));
        routeRef.current.setAttribute('y1', String(y));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 960 520"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        zIndex: 0, opacity: 0.18,
        pointerEvents: 'none',
      }}
    >
      {/* Dark base */}
      <rect width="960" height="520" fill="#060d18" />

      {/* Grid roads – filled lanes */}
      {GRID_H.map(y => (
        <rect key={`rh${y}`} x={0} y={y - 6} width={960} height={12}
          fill="rgba(16,185,129,0.06)" />
      ))}
      {GRID_V.map(x => (
        <rect key={`rv${x}`} x={x - 6} y={0} width={12} height={520}
          fill="rgba(16,185,129,0.06)" />
      ))}

      {/* Road centre-lines */}
      {GRID_H.map(y => (
        <line key={`lh${y}`} x1={0} y1={y} x2={960} y2={y}
          stroke="rgba(16,185,129,0.18)" strokeWidth="1" strokeDasharray="14,10" />
      ))}
      {GRID_V.map(x => (
        <line key={`lv${x}`} x1={x} y1={0} x2={x} y2={520}
          stroke="rgba(16,185,129,0.18)" strokeWidth="1" strokeDasharray="14,10" />
      ))}

      {/* Diagonal connectors */}
      <line x1={0}   y1={0}   x2={960} y2={520} stroke="rgba(16,185,129,0.07)" strokeWidth="1" strokeDasharray="10,14" />
      <line x1={960} y1={0}   x2={0}   y2={520} stroke="rgba(16,185,129,0.07)" strokeWidth="1" strokeDasharray="10,14" />
      <line x1={0}   y1={130} x2={960} y2={390} stroke="rgba(16,185,129,0.06)" strokeWidth="1" strokeDasharray="10,14" />

      {/* Intersections */}
      {GRID_H.map(hy => GRID_V.map(vx => (
        <circle key={`dot${vx}${hy}`} cx={vx} cy={hy} r={2}
          fill="rgba(16,185,129,0.25)" />
      )))}

      {/* Hospital markers */}
      {HOSPITALS.map((h, i) => (
        <g key={i}>
          <circle cx={h.x} cy={h.y} r={22} fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.2)" strokeWidth="1" />
          <circle cx={h.x} cy={h.y} r={12} fill="#0a1f3d" stroke="#2563eb" strokeWidth="1.2" />
          <text x={h.x} y={h.y + 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)">🏥</text>
          <text x={h.x} y={h.y + 24} textAnchor="middle" fontSize="6"
            fill="rgba(148,163,184,0.5)" fontFamily="Inter, sans-serif">{h.name}</text>
        </g>
      ))}

      {/* SOS marker */}
      <circle cx={SOS.x} cy={SOS.y} r={16} fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.25)" strokeWidth="1">
        <animate attributeName="r" values="16;24;16" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.4;1" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={SOS.x} cy={SOS.y} r={9} fill="#3f0d0d" stroke="#ef4444" strokeWidth="1.2" />
      <text x={SOS.x} y={SOS.y + 4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.7)">🆘</text>

      {/* Route line (updated via DOM) */}
      <line
        ref={routeRef}
        x1={60} y1={60} x2={SOS.x} y2={SOS.y}
        stroke="#10b981" strokeWidth="1.5" strokeDasharray="6,5" opacity="0.4"
      />

      {/* Ambulance (updated via DOM for perf) */}
      <circle ref={ambulanceCircleRef} cx={60} cy={60} r={11}
        fill="#059669" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <text ref={ambulanceTextRef} x={60} y={65} textAnchor="middle" fontSize="9">🚑</text>
    </svg>
  );
}

/* ─────────────────────────────────
   Real Geolocation button
───────────────────────────────── */
function LocationButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [location, setLocation] = useState('');

  const detect = () => {
    if (!navigator.geolocation) { setStatus('error'); setLocation('Not supported'); return; }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const d = await r.json();
          const a = d.address;
          const label = [a.suburb || a.neighbourhood, a.city || a.town || a.village, a.state]
            .filter(Boolean).join(', ');
          setLocation(label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } catch {
          setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
        setStatus('done');
      },
      () => { setStatus('error'); setLocation('Permission denied'); },
      { timeout: 8000 }
    );
  };

  return (
    <div style={{ marginBottom: '28px' }}>
      <button
        onClick={detect}
        disabled={status === 'loading'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '13px 26px',
          background: status === 'done'
            ? 'linear-gradient(135deg,rgba(5,150,105,0.25),rgba(13,148,136,0.25))'
            : 'rgba(255,255,255,0.05)',
          color: status === 'done' ? '#10b981' : '#94a3b8',
          border: `1px solid ${status === 'done' ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '14px', fontSize: '14px', fontWeight: '600',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s', fontFamily: 'Inter, sans-serif',
          boxShadow: status === 'done' ? '0 0 20px rgba(16,185,129,0.15)' : 'none',
        }}
      >
        <Navigation size={16} style={{
          color: status === 'done' ? '#10b981' : '#10b981',
          animation: status === 'loading' ? 'spin 1s linear infinite' : 'none',
        }} />
        {status === 'loading' ? 'Detecting location…' :
         status === 'done'    ? `📍 ${location}` :
         status === 'error'   ? `⚠️ ${location}` :
         'Detect My Location'}
      </button>
      {status === 'done' && (
        <p style={{ marginTop: '8px', fontSize: '12px', color: '#059669', animation: 'fadeSlideUp 0.4s ease-out' }}>
          ✓ Nearest hospitals are being loaded
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────
   Main page
───────────────────────────────── */
export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const glass: React.CSSProperties = {
    background: 'rgba(6,13,24,0.72)',
    backdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.07)',
  };

  return (
    <div style={{ minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', position: 'relative' }}>

      {/* ── Fixed map background ── */}
      <BackgroundMap />

      {/* ── Scrollable content layer ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          ...glass,
          background: scrollY > 10 ? 'rgba(6,13,24,0.88)' : 'rgba(6,13,24,0.4)',
          padding: '14px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'background 0.3s',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px',
              background: 'linear-gradient(135deg,#059669,#10b981)',
              borderRadius: '11px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px',
              boxShadow: '0 0 14px rgba(5,150,105,0.35)',
            }}>🚑</div>
            <span style={{ fontWeight: '800', fontSize: '19px', letterSpacing: '-0.02em' }}>MediRoute</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
              Sign In
            </Link>
            <Link to="/login" style={{
              padding: '9px 20px',
              background: 'linear-gradient(135deg,#059669,#10b981)',
              color: '#fff', borderRadius: '10px',
              textDecoration: 'none', fontWeight: '700', fontSize: '14px',
              boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
            }}>
              Try Demo
            </Link>
          </div>
        </header>

        {/* ── Hero (full viewport height) ── */}
        <section style={{
          minHeight: 'calc(100vh - 67px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 24px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(5,150,105,0.09) 0%, transparent 70%)',
        }}>
          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            ...glass,
            color: '#10b981', padding: '6px 16px', borderRadius: '20px',
            fontSize: '12px', fontWeight: '700', marginBottom: '28px',
            border: '1px solid rgba(16,185,129,0.25)',
          }}>
            <span style={{
              width: '7px', height: '7px', background: '#10b981',
              borderRadius: '50%', boxShadow: '0 0 8px #10b981',
            }} className="pulse-green" />
            Live Emergency Network Active
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(34px, 5.5vw, 62px)', fontWeight: '900',
            margin: '0 0 18px', letterSpacing: '-0.03em', lineHeight: 1.1,
            background: 'linear-gradient(160deg, #ffffff 40%, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Smart Emergency Dispatch<br />
            <span style={{
              background: 'linear-gradient(135deg,#10b981,#059669)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Powered by AI &amp; Live Maps
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '17px', color: '#64748b', maxWidth: '560px',
            margin: '0 auto 36px', lineHeight: 1.75,
          }}>
            Connect patients to the nearest ambulance and allocate the best hospital
            based on real-time bed availability and AI triage.
          </p>

          {/* Location */}
          <LocationButton />

          {/* CTA */}
          <Link
            to="/login"
            style={{
              padding: '15px 40px',
              background: 'linear-gradient(135deg,#059669,#10b981)',
              color: '#fff', borderRadius: '14px', fontSize: '16px', fontWeight: '700',
              textDecoration: 'none', boxShadow: '0 8px 24px rgba(5,150,105,0.35)',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(5,150,105,0.5)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(5,150,105,0.35)';
            }}
          >
            Access Dashboards <span style={{ fontSize: '18px' }}>→</span>
          </Link>

          {/* Scroll hint */}
          <div style={{
            marginTop: '60px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '6px', color: '#334155', fontSize: '12px',
            animation: 'fadeSlideUp 1s ease-out 0.5s both',
          }}>
            <div style={{
              width: '1px', height: '40px',
              background: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.4))',
            }} />
            scroll to explore
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section style={{
          ...glass,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '36px 24px',
        }}>
          <div style={{
            maxWidth: '880px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0', textAlign: 'center',
          }}>
            {[
              { num: '8 min',  label: 'Avg Response Time', color: '#10b981' },
              { num: '12k+',   label: 'Lives Impacted',    color: '#3b82f6' },
              { num: '1.2k',   label: 'Active Ambulances', color: '#f59e0b' },
              { num: '248',    label: 'Hospitals Connected',color: '#8b5cf6' },
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                padding: '20px 12px',
                borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: s.color, marginBottom: '4px' }}>{s.num}</div>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ padding: '80px 24px', maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '34px', fontWeight: '800', textAlign: 'center',
            margin: '0 0 10px', letterSpacing: '-0.02em',
          }}>How It Works</h2>
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '15px', marginBottom: '48px' }}>
            From SOS to hospital arrival in under 10 minutes
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { Icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', step: '01', title: 'Instant SOS', text: 'Patient triggers SOS. GPS location and medical profile are instantly captured.' },
              { Icon: MapPin,      color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', step: '02', title: 'Live Tracking', text: 'Nearest ambulance is dispatched. Real-time maps track the route with live ETA.' },
              { Icon: BrainCircuit,color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', step: '03', title: 'AI Triage',   text: 'AI analyzes symptoms and recommends the best hospital based on bed availability.' },
              { Icon: Activity,    color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', step: '04', title: 'Hospital Prep',text: 'Hospital dashboard lights up. Doctors and ICU teams are notified before arrival.' },
            ].map(({ Icon, color, bg, border, step, title, text }) => (
              <div
                key={step}
                style={{
                  ...glass,
                  borderRadius: '20px', border: `1px solid ${border}`,
                  padding: '28px', position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${bg}`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
              >
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  fontSize: '11px', fontWeight: '800', color,
                  background: bg, padding: '3px 10px', borderRadius: '20px',
                  border: `1px solid ${border}`,
                }}>
                  {step}
                </div>
                <div style={{
                  width: '46px', height: '46px', background: bg,
                  borderRadius: '14px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: '18px',
                  border: `1px solid ${border}`,
                }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 10px', color: '#f1f5f9' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{
          padding: '80px 24px', textAlign: 'center',
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(5,150,105,0.1) 0%, transparent 70%)',
        }}>
          <h2 style={{ fontSize: '40px', fontWeight: '900', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
            Ready to save lives?
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '500px', margin: '0 auto 36px', lineHeight: 1.75 }}>
            Explore the platform as a patient, driver, hospital, or admin.
          </p>
          <Link to="/login" style={{
            padding: '16px 48px',
            background: 'linear-gradient(135deg,#059669,#10b981)',
            color: '#fff', borderRadius: '16px', fontSize: '17px', fontWeight: '800',
            textDecoration: 'none', boxShadow: '0 8px 32px rgba(5,150,105,0.4)',
            display: 'inline-block', letterSpacing: '-0.01em',
          }}>
            Open Demo Dashboard →
          </Link>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          padding: '28px 24px', textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          color: '#334155', fontSize: '13px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{
              width: '20px', height: '20px', background: '#059669',
              borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
            }}>🚑</div>
            <span style={{ fontWeight: '700', color: '#475569' }}>MediRoute</span>
          </div>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} MediRoute Platform. Built for rapid emergency response.</p>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
