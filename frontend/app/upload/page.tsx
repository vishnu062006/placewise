'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AnalysisLoading from '@/components/AnalysisLoading'

const ROLES = [
  { value: 'faang_sde', label: 'FAANG / Top Tier', desc: 'Google, Microsoft, Amazon, Meta', icon: '⚡', color: '#6c63ff' },
  { value: 'product_company', label: 'Product Companies', desc: 'Zepto, Razorpay, CRED, Atlassian', icon: '🚀', color: '#38bdf8' },
  { value: 'service_company', label: 'Service Companies', desc: 'TCS, Infosys, Wipro, Cognizant', icon: '🏢', color: '#34d399' },
  { value: 'ml_data_role', label: 'Data / ML Roles', desc: 'Data Analyst, ML Engineer fresher', icon: '🤖', color: '#fbbf24' },
  { value: 'core_engineering', label: 'Core Engineering', desc: 'Embedded, VLSI, Mech — for ECE/EE', icon: '⚙️', color: '#f87171' },
]

type Stage = 'upload' | 'role' | 'analyzing'

export default function UploadPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [analyzeStep, setAnalyzeStep] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const analyzeSteps = [
    'Extracting resume text…',
    'Parsing skills & projects with LLM…',
    'Loading role knowledge base…',
    'Running placement scorer…',
    'Generating your roadmap…',
  ]

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
      setError('')
    } else {
      setError('Please upload a PDF file.')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (picked?.type === 'application/pdf') {
      setFile(picked)
      setError('')
    } else {
      setError('Please upload a PDF file.')
    }
  }

  const handleAnalyze = async () => {
    if (!file || !selectedRole) return
    setStage('analyzing')

    // Simulate progress steps while API runs
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step < analyzeSteps.length) setAnalyzeStep(step)
    }, 1800)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('role', selectedRole)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()

      clearInterval(interval)

      // Store result in sessionStorage and navigate
      sessionStorage.setItem('placewise_result', JSON.stringify(data))
      sessionStorage.setItem('placewise_role', selectedRole)
      sessionStorage.setItem('placewise_filename', file.name)
      router.push('/results')
    } catch (err: unknown) {
      clearInterval(interval)
      setStage('role')
      setError(err instanceof Error ? err.message : 'Something went wrong. Make sure the backend is running.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <Link href="/" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em', textDecoration: 'none', color: 'var(--text)' }}>
          place<span className="gradient-text">wise</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['upload', 'role'] as Stage[]).map((s, i) => (
            <div key={s} style={{
              width: 24, height: 4, borderRadius: 2,
              background: stage === s || (stage === 'analyzing' && i === 1) ? 'var(--accent)' :
                          (s === 'upload' && (stage === 'role' || stage === 'analyzing')) ? 'var(--accent)' :
                          'var(--border2)'
            }} />
          ))}
          <div style={{ width: 24, height: 4, borderRadius: 2, background: stage === 'analyzing' ? 'var(--accent)' : 'var(--border2)' }} />
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>

        {/* STAGE 1: Upload */}
        {stage === 'upload' && (
          <div className="fade-in-up" style={{ width: '100%', maxWidth: '540px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
              Upload your resume
            </h1>
            <p style={{ color: 'var(--text2)', textAlign: 'center', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
              PDF format only. Your resume is processed securely.
            </p>

            {/* Drop zone */}
            <div
              className={dragActive ? 'drag-active' : ''}
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive || file ? 'var(--accent)' : 'var(--border2)'}`,
                borderRadius: '16px',
                padding: '3.5rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: file ? 'rgba(108,99,255,0.06)' : dragActive ? 'rgba(108,99,255,0.08)' : 'var(--surface)',
                transition: 'all 0.2s',
                marginBottom: '1rem',
                boxShadow: dragActive || file ? '0 18px 60px rgba(0,0,0,0.22)' : 'none',
              }}
            >
              <input ref={inputRef} type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />

              {file ? (
                <>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: 'var(--accent2)', marginBottom: '0.25rem' }}>
                    {file.name}
                  </div>
                  <div style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>
                    {(file.size / 1024).toFixed(1)} KB · Click to change
                  </div>
                  <div style={{
                    margin: '1rem auto 0',
                    maxWidth: 320,
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    background: 'rgba(0,0,0,0.16)',
                    padding: '0.85rem',
                    textAlign: 'left',
                    color: 'var(--text3)',
                    fontSize: '0.78rem',
                    lineHeight: 1.5
                  }}>
                    PDF ready for analysis. We extract resume signals and send only this file to the analysis API.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📎</div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>
                    Drop your resume here
                  </div>
                  <div style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>or click to browse</div>
                </>
              )}
            </div>

            {error && (
              <div style={{ color: 'var(--red)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              {['Secure processing', 'PDF only', '~45 sec analysis'].map(item => (
                <div key={item} style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '0.75rem',
                  color: 'var(--text3)',
                  background: 'rgba(255,255,255,0.025)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  {item}
                </div>
              ))}
            </div>

            <button
              disabled={!file}
              onClick={() => { if (file) setStage('role') }}
              style={{
                width: '100%', padding: '0.9rem',
                background: file ? 'var(--accent)' : 'var(--surface2)',
                color: file ? '#fff' : 'var(--text3)',
                border: 'none', borderRadius: '10px',
                fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem',
                cursor: file ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: file ? '0 0 25px rgba(108,99,255,0.25)' : 'none'
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STAGE 2: Role selection */}
        {stage === 'role' && (
          <div className="fade-in-up" style={{ width: '100%', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
              What&apos;s your target role?
            </h1>
            <p style={{ color: 'var(--text2)', textAlign: 'center', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
              We&apos;ll tailor the gap analysis to your specific goal.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {ROLES.map(role => (
                <div
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  style={{
                    border: `1px solid ${selectedRole === role.value ? role.color : 'var(--border)'}`,
                    borderRadius: '12px',
                    padding: '1.1rem 1.4rem',
                    cursor: 'pointer',
                    background: selectedRole === role.value ? `${role.color}10` : 'var(--surface)',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{role.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: selectedRole === role.value ? role.color : 'var(--text)' }}>
                      {role.label}
                    </div>
                    <div style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: '0.1rem' }}>{role.desc}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `2px solid ${selectedRole === role.value ? role.color : 'var(--border2)'}`,
                    background: selectedRole === role.value ? role.color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {selectedRole === role.value && <span style={{ color: '#fff', fontSize: '0.6rem' }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ color: 'var(--red)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setStage('upload')}
                style={{
                  padding: '0.9rem 1.5rem',
                  background: 'transparent', color: 'var(--text2)',
                  border: '1px solid var(--border2)', borderRadius: '10px',
                  fontFamily: 'Syne', fontWeight: 600, fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
              <button
                disabled={!selectedRole}
                onClick={handleAnalyze}
                style={{
                  flex: 1, padding: '0.9rem',
                  background: selectedRole ? 'var(--accent)' : 'var(--surface2)',
                  color: selectedRole ? '#fff' : 'var(--text3)',
                  border: 'none', borderRadius: '10px',
                  fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem',
                  cursor: selectedRole ? 'pointer' : 'not-allowed',
                  boxShadow: selectedRole ? '0 0 25px rgba(108,99,255,0.25)' : 'none'
                }}
              >
                Analyse My Resume →
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: Analyzing */}
        {stage === 'analyzing' && (
          <AnalysisLoading steps={analyzeSteps} activeStep={analyzeStep} />
        )}
      </main>
    </div>
  )
}
