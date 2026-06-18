import Link from 'next/link'
import SampleReport from '@/components/SampleReport'

const roles = [
  { label: 'FAANG / Top Tier', color: '#6c63ff', bg: 'rgba(108,99,255,0.1)', icon: '⚡' },
  { label: 'Product Companies', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', icon: '🚀' },
  { label: 'Service Companies', color: '#34d399', bg: 'rgba(52,211,153,0.1)', icon: '🏢' },
  { label: 'Data / ML Roles', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', icon: '🤖' },
  { label: 'Core Engineering', color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: '⚙️' },
]

const steps = [
  { num: '01', title: 'Upload Resume', desc: 'Drop your PDF. We extract skills, projects, CGPA, internships, and profile links.' },
  { num: '02', title: 'Pick Your Target', desc: 'Choose the placement track you care about: top-tier SDE, product, service, ML, or core.' },
  { num: '03', title: 'Get Explainable Score', desc: 'The report shows the signals that increased or reduced your estimated readiness.' },
  { num: '04', title: 'Close the Gap', desc: 'Role-specific gaps are converted into a focused 4-week improvement plan.' },
]

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(12px)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px'
      }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>
          place<span className="gradient-text">wise</span>
        </span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#how" style={{ color: 'var(--text2)', fontSize: '0.85rem', textDecoration: 'none' }}>How it works</a>
          <a href="#sample-report" style={{ color: 'var(--text2)', fontSize: '0.85rem', textDecoration: 'none' }}>Sample report</a>
          <Link href="/upload" style={{
            background: 'var(--accent)', color: '#fff',
            padding: '0.4rem 1rem', borderRadius: '6px',
            fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none',
            fontFamily: 'Syne'
          }}>
            Try it free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid-bg" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '6rem 1.5rem 4rem',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(108,99,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="fade-in-up fade-in-up-1" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: '100px', padding: '0.3rem 0.9rem',
            fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '2rem',
            fontWeight: 500
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulseDot 2s infinite' }} />
            Free for all engineering students
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05, fontWeight: 800, marginBottom: '1.5rem' }}>
            Explainable placement<br />
            readiness from your <span className="gradient-text">resume.</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text2)', maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Upload your resume and get an estimated placement readiness score, role-specific gaps, and a practical 4-week roadmap.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/upload" style={{
              background: 'var(--accent)', color: '#fff',
              padding: '0.85rem 2rem', borderRadius: '10px',
              fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s', boxShadow: '0 0 30px rgba(108,99,255,0.3)'
            }}>
              Analyse My Resume →
            </Link>
            <a href="#sample-report" style={{
              background: 'transparent', color: 'var(--text)',
              padding: '0.85rem 2rem', borderRadius: '10px',
              fontFamily: 'Syne', fontWeight: 600, fontSize: '1rem',
              textDecoration: 'none', border: '1px solid var(--border2)',
              transition: 'all 0.2s'
            }}>
              See Sample Report
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginTop: '2.5rem' }}>
            {['Trained on 1,500+ placement records', 'No signup required', 'Analysis takes ~45 seconds', 'Explainable scoring'].map(item => (
              <div key={item} style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.85rem',
                color: 'var(--text2)',
                fontSize: '0.82rem',
                fontWeight: 600
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Role pills */}
        <div className="fade-in-up fade-in-up-3" style={{
          display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center',
          marginTop: '4rem'
        }}>
          {roles.map(r => (
            <span key={r.label} style={{
              background: r.bg, border: `1px solid ${r.color}30`,
              color: r.color, borderRadius: '100px',
              padding: '0.35rem 0.9rem', fontSize: '0.8rem', fontWeight: 500
            }}>
              {r.icon} {r.label}
            </span>
          ))}
        </div>
      </section>

      <section style={{ padding: '1rem 1.5rem 6rem' }}>
        <SampleReport />
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '6rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>The Process</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800 }}>
            From resume to roadmap<br />in under 60 seconds
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5px', background: 'var(--border)' }}>
          {steps.map((s) => (
            <div key={s.num} style={{
              background: 'var(--bg)',
              padding: '2rem',
            }}>
              <div style={{ fontFamily: 'Syne', fontSize: '0.7rem', color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1rem' }}>{s.num}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.6rem' }}>{s.title}</h3>
              <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack callout */}
      <section style={{
        padding: '4rem 1.5rem',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--text3)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Under the Hood</p>
          <p style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: '0.95rem' }}>
            LLaMA 3.3 70B via Groq parses your resume into structured signals. 
            An XGBoost model trained on 1,500+ campus placement records gives the probability score. 
            ChromaDB grounds the gap analysis in role-specific placement expectations.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            {['LLaMA 3.3 70B', 'Groq', 'XGBoost', 'ChromaDB', 'FastAPI', 'Next.js 14'].map(t => (
              <span key={t} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text2)', borderRadius: '6px',
                padding: '0.3rem 0.8rem', fontSize: '0.8rem', fontWeight: 500
              }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '8rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1.5rem' }}>
          Ready to find your<br /><span className="gradient-text">placement score?</span>
        </h2>
        <p style={{ color: 'var(--text2)', marginBottom: '2.5rem', fontSize: '1rem' }}>
          Takes 45 seconds. Free. No signup required.
        </p>
        <Link href="/upload" style={{
          background: 'var(--accent)', color: '#fff',
          padding: '1rem 2.5rem', borderRadius: '10px',
          fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem',
          textDecoration: 'none', boxShadow: '0 0 40px rgba(108,99,255,0.35)'
        }}>
          Upload Your Resume →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'var(--text3)', fontSize: '0.8rem'
      }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800 }}>placewise</span>
        {' '}— built for engineering students, by engineering students.
      </footer>
    </div>
  )
}
