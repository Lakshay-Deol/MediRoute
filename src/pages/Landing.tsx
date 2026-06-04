import { Link } from 'react-router-dom';
import { MapPin, BrainCircuit, Activity, Clock, ShieldAlert, Cpu } from 'lucide-react';

const S = {
  page: { minHeight: '100vh', background: '#f8fafc', color: '#0f172a' },
  header: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 100 },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { width: '40px', height: '40px', background: '#059669', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  logoText: { fontWeight: '800', fontSize: '20px', color: '#0f172a' },
  hero: { padding: '80px 24px', textAlign: 'center' as const, background: 'linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%)', borderBottom: '1px solid #e2e8f0' },
  h1: { fontSize: '48px', fontWeight: '900', color: '#0f172a', margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.1 },
  h1Highlight: { color: '#059669' },
  subtitle: { fontSize: '18px', color: '#475569', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.5 },
  ctaBtn: { padding: '14px 32px', background: '#059669', color: '#fff', borderRadius: '12px', fontSize: '16px', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(5,150,105,0.25)', transition: 'transform 0.2s' },
  section: { padding: '64px 24px', maxWidth: '1000px', margin: '0 auto' },
  h2: { fontSize: '32px', fontWeight: '800', textAlign: 'center' as const, margin: '0 0 40px', color: '#0f172a' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
  card: { background: '#fff', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  cardIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  cardTitle: { fontSize: '20px', fontWeight: '700', margin: '0 0 12px', color: '#0f172a' },
  cardText: { fontSize: '15px', color: '#64748b', lineHeight: 1.6, margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginTop: '40px' },
  statCard: { textAlign: 'center' as const, padding: '24px', background: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0' },
  statNum: { fontSize: '36px', fontWeight: '900', color: '#059669', marginBottom: '8px' },
  statLabel: { fontSize: '14px', fontWeight: '600', color: '#065f46' },
  footer: { background: '#0f172a', padding: '40px 24px', textAlign: 'center' as const, color: '#94a3b8' },
  codeBlock: { background: '#1e293b', color: '#e2e8f0', padding: '24px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '14px', textAlign: 'left' as const, overflowX: 'auto' as const, lineHeight: 1.5, border: '1px solid #334155' },
};

export default function Landing() {
  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoIcon}>🚑</div>
          <span style={S.logoText}>MediRoute</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#475569', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>Sign In</Link>
          <Link to="/login" style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>Try Demo</Link>
        </div>
      </header>

      <section style={S.hero}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#dcfce7', color: '#166534', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '700', marginBottom: '24px' }}>
          <span style={{ width: '8px', height: '8px', background: '#166534', borderRadius: '50%' }} className="pulse-green" /> Live Demo Available
        </div>
        <h1 style={S.h1}>
          Smart Emergency Dispatch<br />
          <span style={S.h1Highlight}>Powered by AI & Live Maps</span>
        </h1>
        <p style={S.subtitle}>
          Connect patients to the nearest ambulance and allocate the best hospital based on real-time bed availability and AI triage.
        </p>
        <Link to="/login" style={S.ctaBtn}>
          Access Dashboards <span style={{ fontSize: '18px' }}>→</span>
        </Link>

        <div style={{ maxWidth: '800px', margin: '48px auto 0', padding: '8px', background: '#fff', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200&h=600" alt="Dashboard Preview" style={{ width: '100%', borderRadius: '16px', display: 'block', objectFit: 'cover', height: '400px' }} />
        </div>
      </section>

      <section style={S.section}>
        <h2 style={S.h2}>How It Works</h2>
        <div style={S.grid}>
          <div style={S.card}>
            <div style={{ ...S.cardIcon, background: '#fee2e2', color: '#dc2626' }}><ShieldAlert size={24} /></div>
            <h3 style={S.cardTitle}>1. Instant SOS</h3>
            <p style={S.cardText}>Patient triggers SOS. GPS location and medical profile (blood group, allergies) are instantly captured.</p>
          </div>
          <div style={S.card}>
            <div style={{ ...S.cardIcon, background: '#fef3c7', color: '#d97706' }}><MapPin size={24} /></div>
            <h3 style={S.cardTitle}>2. Live Tracking</h3>
            <p style={S.cardText}>Nearest available ambulance is dispatched. Real-time Leaflet maps track the route with live ETA updates.</p>
          </div>
          <div style={S.card}>
            <div style={{ ...S.cardIcon, background: '#dbeafe', color: '#2563eb' }}><BrainCircuit size={24} /></div>
            <h3 style={S.cardTitle}>3. AI Triage</h3>
            <p style={S.cardText}>AI analyzes symptoms to predict severity and recommends the best hospital based on current bed availability.</p>
          </div>
          <div style={S.card}>
            <div style={{ ...S.cardIcon, background: '#dcfce7', color: '#166534' }}><Activity size={24} /></div>
            <h3 style={S.cardTitle}>4. Hospital Prep</h3>
            <p style={S.cardText}>Hospital dashboard lights up with incoming patient details. Doctors and ICU teams are notified before arrival.</p>
          </div>
        </div>

        <div style={S.statsGrid}>
          <div style={S.statCard}>
            <div style={S.statNum}>8 min</div>
            <div style={S.statLabel}>Avg Response Time</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statNum}>12k+</div>
            <div style={S.statLabel}>Lives Impacted</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statNum}>1.2k</div>
            <div style={S.statLabel}>Active Ambulances</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statNum}>248</div>
            <div style={S.statLabel}>Hospitals Connected</div>
          </div>
        </div>
      </section>

      <section style={{ background: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '64px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            <Cpu size={32} color="#059669" />
            <h2 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Integrate AI & Live Data</h2>
          </div>
          <p style={{ textAlign: 'center', fontSize: '16px', color: '#64748b', maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            The current demo uses Zustand stores to simulate real-time mapping and bed updates. Here is how you connect this frontend to a real backend.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={S.card}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#0f172a', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>1</span>
                Real-Time Map Tracking (WebSockets)
              </h3>
              <p style={S.cardText}>Replace the <code>useAmbulanceSimulator</code> hook with a Socket.io connection that listens to GPS hardware events from ambulance phones.</p>
              <div style={{ ...S.codeBlock, marginTop: '16px' }}>
<span style={{ color: '#c678dd' }}>import</span> {'{'} io {'}'} <span style={{ color: '#c678dd' }}>from</span> <span style={{ color: '#98c379' }}>'socket.io-client'</span>;{'\n\n'}
<span style={{ color: '#e5c07b' }}>useEffect</span>({'() => {'}{'\n'}
{'  '}<span style={{ color: '#c678dd' }}>const</span> socket = <span style={{ color: '#61afef' }}>io</span>(<span style={{ color: '#98c379' }}>'wss://api.mediroute.in'</span>);{'\n'}
{'  '}socket.<span style={{ color: '#61afef' }}>on</span>(<span style={{ color: '#98c379' }}>'ambulanceLocation'</span>, (data) {'=> {'}{'\n'}
{'    '}<span style={{ color: '#5c6370' }}>// data = {'{ id: "a1", lat: 28.5, lng: 77.2 }'}</span>{'\n'}
{'    '}<span style={{ color: '#61afef' }}>updateAmbulanceLocation</span>(data);{'\n'}
{'  }'});{'\n'}
{'  '}<span style={{ color: '#c678dd' }}>return</span> () {'=>'} socket.<span style={{ color: '#61afef' }}>disconnect</span>();{'\n'}
{'}, []);'}
              </div>
            </div>

            <div style={S.card}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#0f172a', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>2</span>
                AI Triage & Recommendation
              </h3>
              <p style={S.cardText}>Send the patient's symptoms and location to a Python backend running an LLM or ML model. Return severity score and ranked hospital IDs.</p>
              <div style={{ ...S.codeBlock, marginTop: '16px' }}>
<span style={{ color: '#c678dd' }}>const</span> <span style={{ color: '#61afef' }}>analyzeEmergency</span> = <span style={{ color: '#c678dd' }}>async</span> (symptoms, loc) {'=> {'}{'\n'}
{'  '}<span style={{ color: '#c678dd' }}>const</span> res = <span style={{ color: '#c678dd' }}>await</span> <span style={{ color: '#61afef' }}>fetch</span>(<span style={{ color: '#98c379' }}>'/api/v1/ai/triage'</span>, {'{'}{'\n'}
{'    '}method: <span style={{ color: '#98c379' }}>'POST'</span>,{'\n'}
{'    '}body: <span style={{ color: '#e5c07b' }}>JSON</span>.<span style={{ color: '#61afef' }}>stringify</span>({'{'} symptoms, loc {'}'}){'\n'}
{'  }'});{'\n'}
{'  '}<span style={{ color: '#c678dd' }}>const</span> data = <span style={{ color: '#c678dd' }}>await</span> res.<span style={{ color: '#61afef' }}>json</span>();{'\n'}
{'  '}<span style={{ color: '#5c6370' }}>// data = {'{ severity: "critical", hospitals: ["h1", "h3"] }'}</span>{'\n'}
{'  '}<span style={{ color: '#c678dd' }}>return</span> data;{'\n'}
{'}'};
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', textAlign: 'center', background: '#fff' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', marginBottom: '24px' }}>Ready to save lives?</h2>
        <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Explore the platform from the perspective of a patient, driver, hospital, or command center administrator.
        </p>
        <Link to="/login" style={{ ...S.ctaBtn, padding: '16px 40px', fontSize: '18px' }}>
          Open Demo Dashboard
        </Link>
      </section>

      <footer style={S.footer}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '24px', height: '24px', background: '#059669', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🚑</div>
          <span style={{ fontWeight: '700', color: '#fff' }}>MediRoute</span>
        </div>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} MediRoute Platform. Built for rapid emergency response.</p>
      </footer>
    </div>
  );
}
