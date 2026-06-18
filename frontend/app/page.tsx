'use client'

import { useState } from 'react'
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
  { num: '02', title: 'Pick Your Target', desc: 'Choose the placement track: top-tier SDE, product, service, ML, or core.' },
  { num: '03', title: 'Get Explainable Score', desc: 'See exactly which signals boosted or reduced your estimated readiness.' },
  { num: '04', title: 'Close the Gap', desc: 'Role-specific gaps become a focused 4-week improvement plan.' },
]

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(16px)',
        padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px'
      }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>
          place<span className="gradient-text">wise</span>
        </span>

        {/* Desktop links */}
        <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#how" style={{ color: 'var(--text2)', fontSize: '0.85rem', textDecoration: 'none' }}>How it works</a>
          <a href="#sample-report" style={{ color: 'var(--text2)', fontSize: '0.85rem', textDecoration: 'none' }}>Sample report</a>
          <Link href="/upload" style={{
            background: 'var(--accent)', color: '#fff',
            padding: '0.4rem 1.1rem', borderRadius: '6px',
            fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
            fontFamily: 'Syne', boxShadow: '0 0 16px rgba(108,99,255,0.3)'
          }}>
            Try it free
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(o => !o)}
          style={{
            display: 'none', flexDirection: 'column', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px'
          }}
          aria-label="Menu"
        >
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: 'block', width: 22, height: 1.5,
              background: menuOpen && i === 1 ? 'transparent' : 'var(--text2)',
              borderRadius: 2,
              transform: menuOpen ? (i === 0 ? 'rotate(45deg) translate(4px, 4px)' : i === 2 ? 'rotate(-45deg) translate(4px, -4px)' : '') : 'none',
              transition: 'all 0.2s'
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <a href="#how" onClick={() => setMenuOpen(false)} style={{ color: 'var(--text)', fontSize: '1.2rem', fontFamily: 'Syne', fontWeight: 700, textDecoration: 'none' }}>How it works</a>
        <a href="#sample-report" onClick={() => setMenuOpen(false)} style={{ color: 'var(--text)', fontSize: '1.2rem', fontFamily: 'Syne', fontWeight: 700, textDecoration: 'none' }}>Sample report</a>
        <Link href="/upload" onClick={() => setMenuOpen(false)} style={{
          background: 'var(--accent)', color: '#fff',
          padding: '0.85rem 2.5rem', borderRadius: '10px',
          fontSize: '1rem', fontWeight: 700, textDecoration: 'none', fontFamily: 'Syne'
        }}>
          Try it free →
        </Link>
      </div>

      {/* Hero */}
      <section className="grid-bg" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(5rem, 12vw, 7rem) 1.25rem 3rem',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: 'min(600px, 100vw)', height: '300px',
          background: 'radial-gradient(ellipse, rgba(108,99,255,0.13) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="fade-in-up fade-in-up-1" style={{ textAlign: 'center', maxWidth: '680px', width: '100%' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: '100px', padding: '0.3rem 0.9rem',
            fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '1.75rem', fontWeight: 500
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulseDot 2s infinite' }} />
            Free for all engineering students
          </div>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 7vw, 4.2rem)',
            lineHeight: 1.06, fontWeight: 800, marginBottom: '1.25rem',
            letterSpacing: '-0.04em'
          }}>
            Know your placement<br />
            readiness from your <span className="gradient-text">resume.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)',
            color: 'var(--text2)', maxWidth: '480px',
            margin: '0 auto 2rem', lineHeight: 1.75
          }}>
            Upload your resume. Get a placement score, role-specific skill gaps, and a practical 4-week roadmap — in under 60 seconds.
          </p>

          <div className="hero-cta" style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/upload" style={{
              background: 'var(--accent)', color: '#fff',
              padding: '0.85rem 1.75rem', borderRadius: '10px',
              fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              boxShadow: '0 0 32px rgba(108,99,255,0.32)', transition: 'all 0.2s'
            }}>
              Analyse My Resume →
            </Link>
            <a href="#sample-report" style={{
              background: 'transparent', color: 'var(--text)',
              padding: '0.85rem 1.75rem', borderRadius: '10px',
              fontFamily: 'Syne', fontWeight: 600, fontSize: '0.95rem',
              textDecoration: 'none', border: '1px solid var(--border2)',
              transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center'
            }}>
              See Sample Report
            </a>
          </div>

          {/* Trust chips — hide on mobile to save space */}
          <div className="stat-pills-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.6rem', marginTop: '2rem'
          }}>
            {['Trained on 1,500+ records', 'No signup needed', '~45 sec analysis', 'Explainable scoring'].map(item => (
              <div key={item} style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid var(--border)',
                borderRadius: '10px', padding: '0.7rem',
                color: 'var(--text2)', fontSize: '0.78rem', fontWeight: 500
              }}>{item}</div>
            ))}
          </div>
        </div>

        {/* Role pills */}
        <div className="fade-in-up fade-in-up-3" style={{
          display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
          justifyContent: 'center', marginTop: '3rem', padding: '0 1rem'
        }}>
          {roles.map(r => (
            <span key={r.label} className="role-pill" style={{
              background: r.bg, border: `1px solid ${r.color}30`,
              color: r.color, borderRadius: '100px',
              padding: '0.3rem 0.85rem', fontSize: '0.78rem', fontWeight: 500,
              whiteSpace: 'nowrap'
            }}>
              {r.icon} {r.label}
            </span>
          ))}
        </div>
      </section>

      {/* Sample report */}
      <section id="sample-report" style={{ padding: '1rem 1.25rem 5rem' }}>
        <SampleReport />
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: 'clamp(3rem,8vw,6rem) 1.25rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>The Process</p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 800 }}>
            From resume to roadmap<br />in under 60 seconds
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1px', background: 'var(--border)'
        }}>
          {steps.map((s) => (
            <div key={s.num} style={{ background: 'var(--bg)', padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                color: 'var(--accent)', fontWeight: 500,
                letterSpacing: '0.06em', marginBottom: '0.85rem',
                opacity: 0.7
              }}>{s.num}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section style={{
        padding: 'clamp(2.5rem,6vw,4rem) 1.25rem',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)'
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--text3)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>Under the Hood</p>
          <p style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: '0.92rem' }}>
            LLaMA 3.3 70B via Groq parses your resume into structured signals.
            An XGBoost model trained on 1,500+ campus placement records gives the probability score.
            ChromaDB grounds the gap analysis in role-specific placement expectations.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.75rem' }}>
            {['LLaMA 3.3 70B', 'Groq', 'XGBoost', 'ChromaDB', 'FastAPI', 'Next.js 14'].map(t => (
              <span key={t} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text2)', borderRadius: '6px',
                padding: '0.28rem 0.75rem', fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)', fontWeight: 500
              }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(4rem,10vw,8rem) 1.25rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '1.25rem' }}>
          Ready to find your<br /><span className="gradient-text">placement score?</span>
        </h2>
        <p style={{ color: 'var(--text2)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Takes 45 seconds. Free. No signup required.
        </p>
        <Link href="/upload" style={{
          background: 'var(--accent)', color: '#fff',
          padding: '0.95rem 2.25rem', borderRadius: '10px',
          fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem',
          textDecoration: 'none', boxShadow: '0 0 40px rgba(108,99,255,0.3)',
          display: 'inline-block'
        }}>
          Upload Your Resume →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1.75rem 1.25rem',
        textAlign: 'center',
        color: 'var(--text3)', fontSize: '0.78rem'
      }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800 }}>placewise</span>
        {' '}— built for engineering students, by engineering students.
      </footer>
    </div>
  )
}
