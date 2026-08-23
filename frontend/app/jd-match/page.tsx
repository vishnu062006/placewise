'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { FaArrowLeft, FaCheck, FaTimes, FaBars } from 'react-icons/fa'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

// Highly detailed mock JDs to properly test the engine's extraction capabilities
const DEFAULT_JDS = [
  { 
    label: "Software Engineer", 
    text: "We are seeking a Software Engineer to join our core backend team. You will design, build, and scale APIs handling millions of requests. Requirements: B.S. in Computer Science or related field. Minimum CGPA: 7.5. Proficient in Java, Go, or Python. Deep understanding of RDBMS (PostgreSQL/MySQL), OS concepts (concurrency, memory management), and RESTful API design. Experience with Docker, Kubernetes, and AWS (EC2, S3) is a strong plus." 
  },
  { 
    label: "Full Stack", 
    text: "Looking for an energetic Full Stack Engineer. Responsibilities include developing responsive web applications using React and Next.js, and building robust Node.js/Express backends. Requirements: Strong fundamentals in HTML, CSS, JavaScript/TypeScript. Experience with state management, MongoDB, and Git. You should have at least 1-2 deployed projects demonstrating end-to-end integration and secure authentication flows." 
  },
  { 
    label: "Frontend UI", 
    text: "Hiring a Frontend Web Developer to craft pixel-perfect, accessible UIs. Must be highly skilled in React.js, Tailwind CSS, and Modern JavaScript (ES6+). Requirements: Minimum CGPA of 7.0 required. Experience building SPAs, consuming RESTful APIs, and optimizing web vitals. Knowledge of CI/CD pipelines (GitHub Actions/Vercel) and responsive design principles is mandatory." 
  },
  { 
    label: "Data Analyst", 
    text: "Data Analyst role for our product growth team. You will translate raw data into actionable business insights. Requirements: Strong proficiency in Python (Pandas, NumPy) and advanced SQL (window functions, CTEs). Experience creating dashboards in Tableau, PowerBI, or Metabase. Familiarity with A/B testing methodologies and statistical modeling. Excellent communication skills to present findings to stakeholders." 
  }
];

export default function JDMatchPage() {
  const [jdText, setJdText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [hasStoredResume, setHasStoredResume] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Mobile nav state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setHasStoredResume(!!sessionStorage.getItem('placewise_result'))
  }, [])

  const handleMatch = async () => {
    if (!jdText.trim()) {
      setError('Paste a job description first.')
      return
    }
    if (!hasStoredResume && !file) {
      setError('Upload a resume, or analyze one first.')
      return
    }

    setError('')
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('jd_text', jdText)

      if (hasStoredResume) {
        const stored = JSON.parse(sessionStorage.getItem('placewise_result')!)
        formData.append('extracted_data', JSON.stringify(stored.extractedData))
      } else if (file) {
        formData.append('file', file)
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/match-jd`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setResult(data.jd_match)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Match failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${inter.className} min-h-screen bg-[#fbfbf7] text-zinc-950 selection:bg-lime-300 selection:text-zinc-950 flex flex-col overflow-x-hidden`}>
      
      {/* Brutalist Grid Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#18181b1a_1px,transparent_1px),linear-gradient(to_bottom,#18181b1a_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* FLOATING GLASSMORPHISM NAVBAR */}
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:top-6">
        <nav className="relative flex w-full max-w-6xl items-center justify-between rounded-full border-2 border-zinc-950 bg-white/70 px-4 py-3 backdrop-blur-xl shadow-[4px_4px_0px_#18181b] transition-all md:px-8">
          <Link href="/" aria-label="Trajekt home" className="flex items-baseline gap-2 transition-transform hover:-translate-y-0.5">
            <span className={`${jakarta.className} text-xl font-black tracking-tight`}>Trajekt</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/upload" className="text-sm font-bold text-zinc-600 transition-colors hover:text-zinc-950">
              Analyze Resume
            </Link>
            <span className="text-zinc-300">|</span>
            <span className="text-sm font-black text-zinc-950">
              JD Match
            </span>
          </div>

          <div className="hidden md:block">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-950 transition-colors"
            >
              <FaArrowLeft /> Back to Home
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-950 bg-white shadow-[2px_2px_0px_#18181b] active:translate-y-[2px] active:shadow-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Mobile Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+12px)] rounded-3xl border-2 border-zinc-950 bg-white/90 p-6 backdrop-blur-xl shadow-[8px_8px_0px_#18181b] md:hidden">
              <div className="flex flex-col gap-6 text-center">
                <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black text-zinc-950">Analyze Resume</Link>
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black text-zinc-500">Back to Home</Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-6 pt-32 pb-24 md:pt-40">
        
        <div className="mb-10 text-center md:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-zinc-950 bg-indigo-300 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-950 shadow-[4px_4px_0px_#18181b]">
            Targeted Evaluation
          </div>
          <h1 className={`${jakarta.className} mb-4 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl`}>
            Match your resume to a job.
          </h1>
          <p className="text-lg font-bold text-zinc-600">
            Paste a job description. See exactly which skills you match, which you&apos;re missing, and whether you meet the CGPA bar.
          </p>
        </div>

        <div className="space-y-8">
          {/* Resume Source */}
          <div className="rounded-3xl border-2 border-zinc-950 bg-white p-6 shadow-[8px_8px_0px_#18181b] md:p-8">
            <label className="mb-4 block text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Step 1: Resume Source
            </label>
            {hasStoredResume ? (
              <div className="flex items-center gap-4 rounded-2xl border-2 border-zinc-950 bg-lime-100 p-4 shadow-[4px_4px_0px_#18181b]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-zinc-950 bg-lime-300 text-zinc-950">
                  <FaCheck />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-950">Using Active Session</h4>
                  <p className="text-xs font-bold text-zinc-600">Your last analyzed resume is ready.</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                <div className={`flex items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition-all ${
                  file ? 'border-zinc-950 bg-lime-100' : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100'
                }`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 ${
                    file ? 'border-zinc-950 bg-lime-300' : 'border-zinc-300 bg-white'
                  }`}>
                    {file ? <FaCheck className="text-zinc-950" /> : <span className="text-xl font-bold">+</span>}
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-black text-zinc-950 truncate">
                      {file ? file.name : 'Upload PDF Resume'}
                    </h4>
                    <p className="text-xs font-bold text-zinc-500">
                      {file ? 'Ready for matching' : 'Click or drag file here'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* JD Textarea */}
          <div className="rounded-3xl border-2 border-zinc-950 bg-white p-6 shadow-[8px_8px_0px_#18181b] md:p-8">
            <label className="mb-4 block text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Step 2: Job Description
            </label>
            
            {/* Quick JD Templates */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">Templates:</span>
              {DEFAULT_JDS.map((jd) => (
                <button
                  key={jd.label}
                  onClick={() => setJdText(jd.text)}
                  className="rounded-full border-2 border-zinc-950 bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-[2px_2px_0px_#18181b] transition-all hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-[3px_3px_0px_#18181b] active:translate-y-[1px] active:shadow-none"
                >
                  {jd.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here (responsibilities, requirements, tech stack)..."
                rows={8}
                className="w-full rounded-2xl border-2 border-zinc-950 bg-[#fbfbf7] p-4 text-sm font-medium text-zinc-900 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] focus:bg-white focus:outline-none transition-colors resize-none placeholder:font-bold placeholder:text-zinc-400"
              />
            </div>
          </div>

          {error && (
            <div className="inline-flex w-full items-center gap-3 rounded-2xl border-2 border-zinc-950 bg-rose-200 p-4 text-sm font-bold text-zinc-950 shadow-[4px_4px_0px_#18181b]">
              <FaTimes className="shrink-0" /> {error}
            </div>
          )}

          {/* Action CTA */}
          <button
            onClick={handleMatch}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-zinc-950 bg-zinc-950 py-5 text-lg font-black text-white shadow-[6px_6px_0px_#a3e635] transition-all hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#a3e635] active:translate-y-[6px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Matching...
              </span>
            ) : (
              'Match Resume to JD'
            )}
          </button>

          {/* EMPTY STATE OR RESULT CARD */}
          {!result && !loading ? (
            <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border-2 border-zinc-950 bg-white p-12 text-center shadow-[6px_6px_0px_#18181b]">
              <div className="mb-4 text-5xl">🎯</div>
              <h3 className={`${jakarta.className} mb-2 text-2xl font-black text-zinc-950`}>Ready to Match</h3>
              <p className="max-w-md text-sm font-bold leading-relaxed text-zinc-600">
                Upload your resume and paste a Job Description above (or click a template) to see your exact match score, missing skills, and CGPA fit.
              </p>
            </div>
          ) : result ? (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-3xl border-2 border-zinc-950 bg-white p-6 shadow-[12px_12px_0px_#18181b] md:p-10">
              
              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-zinc-950 pb-8">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                    {result.role_title || 'Analyzed Role'}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`${jakarta.className} text-6xl font-black tracking-tighter text-zinc-950`}>
                      {result.match_score !== null ? `${result.match_score}` : '—'}
                    </span>
                    {result.match_score !== null && <span className="text-2xl font-black text-zinc-400">/ 100</span>}
                  </div>
                </div>
                
                {result.min_cgpa_required !== null && (
                  <div className={`inline-flex items-center gap-2 rounded-full border-2 border-zinc-950 px-4 py-2 text-sm font-black shadow-[4px_4px_0px_#18181b] ${
                    result.cgpa_requirement_met ? 'bg-lime-300 text-zinc-950' : 'bg-rose-300 text-zinc-950'
                  }`}>
                    {result.cgpa_requirement_met ? <FaCheck /> : <FaTimes />}
                    CGPA {result.cgpa_requirement_met ? 'Met' : 'Not Met'} ({result.min_cgpa_required}+)
                  </div>
                )}
              </div>

              {result.matched_required_skills?.length > 0 && (
                <div className="mb-8">
                  <h4 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Matched Signals</h4>
                  <div className="flex flex-wrap gap-3">
                    {result.matched_required_skills.map((s: string) => (
                      <span key={s} className="inline-flex items-center gap-2 rounded-xl border-2 border-zinc-950 bg-lime-100 px-4 py-2 text-sm font-black text-zinc-950 shadow-[2px_2px_0px_#18181b]">
                        <FaCheck className="text-lime-600" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.missing_required_skills?.length > 0 && (
                <div>
                  <h4 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Critical Missing</h4>
                  <div className="flex flex-wrap gap-3">
                    {result.missing_required_skills.map((s: string) => (
                      <span key={s} className="inline-flex items-center gap-2 rounded-xl border-2 border-zinc-950 bg-rose-100 px-4 py-2 text-sm font-black text-zinc-950 shadow-[2px_2px_0px_#18181b]">
                        <FaTimes className="text-rose-600" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}