'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import AnalysisLoading from '@/components/AnalysisLoading'
import { analyzeResume } from "@/lib/api"
import { FaArrowRight, FaCheck, FaTimes, FaBars, FaArrowLeft } from 'react-icons/fa'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

const ROLES = [
  { value: 'faang_sde', label: 'FAANG / Top Tier', desc: 'Google, Microsoft, Amazon, Meta', icon: '⚡' },
  { value: 'product_company', label: 'Product Companies', desc: 'Zepto, Razorpay, CRED, Atlassian', icon: '🚀' },
  { value: 'service_company', label: 'Service Companies', desc: 'TCS, Infosys, Wipro, Cognizant', icon: '🏢' },
  { value: 'ml_data_role', label: 'Data / ML Roles', desc: 'Data Analyst, ML Engineer fresher', icon: '🤖' },
  { value: 'core_engineering', label: 'Core Engineering', desc: 'Embedded, VLSI, Mech — for ECE/EE', icon: '⚙️' },
]

const TRACKS = [
  { value: 'full_time', label: 'Full-Time Placement', desc: 'Final year, applying for full-time roles' },
  { value: 'internship', label: 'Internship', desc: 'Applying for a summer/off-cycle internship' },
]

type Stage = 'upload' | 'role' | 'analyzing'

export default function UploadPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedTrack, setSelectedTrack] = useState('full_time')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Original Analysis State
  const [analyzeStep, setAnalyzeStep] = useState(0)
  const analyzeSteps = [
    'Structuring extracted text...',
    'Evaluating against role requirements...',
    'Calculating placement probability...',
    'Identifying missing recruiter signals...',
    'Generating 4-week roadmap...',
  ]

  // File Handling 
  const handleFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (validTypes.includes(selectedFile.type)) {
      setFile(selectedFile)
      setError('')
    } else {
      setError('Unsupported format. Please upload a PDF, PNG, or JPG.')
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  // Backend Execution
  const handleAnalyze = async () => {
    if (!file || !selectedRole) return
    setStage('analyzing')
    
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step < analyzeSteps.length) setAnalyzeStep(step)
    }, 1800)
    
    try {
      const data = await analyzeResume(file, selectedRole, selectedTrack)
      
      clearInterval(interval)
      sessionStorage.setItem('placewise_result', JSON.stringify(data))
      sessionStorage.setItem('placewise_role', selectedRole)
      sessionStorage.setItem('placewise_track', selectedTrack)
      sessionStorage.setItem('placewise_filename', file.name)
      router.push('/results')
    } catch (err: unknown) {
      clearInterval(interval)
      setStage('role')
      setError(err instanceof Error ? err.message : 'Analysis engine offline. Ensure backend is running.')
    }
  }

  const stageIndex = stage === 'upload' ? 0 : stage === 'role' ? 1 : 2

  return (
    <div className={`${inter.className} min-h-screen bg-[#fbfbf7] text-zinc-950 selection:bg-lime-300 selection:text-zinc-950 flex flex-col overflow-x-hidden`}>
      
      {/* Brutalist Grid Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#18181b1a_1px,transparent_1px),linear-gradient(to_bottom,#18181b1a_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* FLOATING GLASSMORPHISM NAVBAR - UNIFIED DESIGN */}
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:top-6">
        <nav className="relative flex w-full max-w-6xl items-center justify-between rounded-full border-2 border-zinc-950 bg-white/70 px-4 py-3 backdrop-blur-xl shadow-[4px_4px_0px_#18181b] transition-all md:px-8">
          <Link href="/" aria-label="Trajekt home" className="flex items-baseline gap-2 transition-transform hover:-translate-y-0.5">
            <span className={`${jakarta.className} text-xl font-black tracking-tight`}>Trajekt</span>
          </Link>

          {/* Desktop Nav - Match JD Match Style */}
          <div className="hidden items-center gap-8 md:flex">
            <span className="text-sm font-black text-zinc-950">
              Analyze Resume
            </span>
            <span className="text-zinc-300">|</span>
            <Link href="/jd-match" className="text-sm font-bold text-zinc-600 transition-colors hover:text-zinc-950">
              JD Match
            </Link>
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
                <Link href="/jd-match" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black text-zinc-950">JD Match</Link>
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black text-zinc-500">Back to Home</Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center p-6 pt-32 pb-24 sm:p-12 sm:pt-40">
        
        {/* PROGRESS INDICATOR - Moved from navbar to content area */}
        {stage !== 'analyzing' && (
          <div className="mb-12 hidden w-full justify-center sm:flex animate-in fade-in duration-500">
            <div className="flex items-center gap-2 md:gap-4 rounded-full border-2 border-zinc-950 bg-white px-6 py-3 shadow-[4px_4px_0px_#18181b]">
              {['Upload', 'Role', 'Analysis'].map((label, i) => {
                const isActive = i === stageIndex
                const isPast = i < stageIndex
                return (
                  <div key={label} className="flex items-center gap-2 md:gap-4">
                    <div className={`flex items-center gap-2 rounded-full border-2 px-3 py-1 transition-all duration-300 ${
                      isPast ? 'bg-lime-300 border-zinc-950 text-zinc-950' : 
                      isActive ? 'bg-zinc-950 border-zinc-950 text-white' : 
                      'bg-transparent border-zinc-200 text-zinc-400'
                    }`}>
                      <div className="text-[10px] font-black">
                        {isPast ? <FaCheck className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className="text-xs font-bold tracking-wide uppercase">
                        {label}
                      </span>
                    </div>
                    {i < 2 && <div className={`h-1 w-6 md:w-10 rounded-full ${isPast ? 'bg-zinc-950' : 'bg-zinc-200'}`} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STAGE 1: FOCUSED UPLOAD */}
        {stage === 'upload' && (
          <div className="flex w-full flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <h1 className={`${jakarta.className} mb-4 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl`}>
              Start Your Evaluation
            </h1>
            <p className="mb-10 text-lg font-bold text-zinc-600">
              Upload your resume and we'll evaluate it exactly like a senior technical recruiter would.
            </p>

            {/* Brutalist Dropzone */}
            <div
              className={`group relative w-full cursor-pointer rounded-3xl border-4 border-dashed transition-all duration-300 ${
                dragActive ? 'border-zinc-950 bg-lime-50 scale-[1.02]' : 
                file ? 'border-zinc-950 bg-lime-100 shadow-[8px_8px_0px_#18181b] border-solid' :
                'border-zinc-300 bg-white hover:border-zinc-950 hover:shadow-[8px_8px_0px_#18181b]'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => !file && inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept=".pdf,image/png,image/jpeg,image/jpg" onChange={handleFileChange} className="hidden" />

              {!file ? (
                <div className="flex cursor-pointer flex-col items-center justify-center p-12">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-zinc-950 bg-white shadow-[4px_4px_0px_#18181b] group-hover:-translate-y-2 group-hover:shadow-[6px_6px_0px_#18181b] transition-all">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <h3 className={`${jakarta.className} mb-2 text-2xl font-black text-zinc-950`}>Drag & Drop Resume</h3>
                  <p className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-500">PDF FORMAT PREFERRED</p>
                  <span className="text-sm font-bold text-zinc-600">or <span className="text-indigo-600 underline decoration-indigo-300 underline-offset-4 hover:decoration-indigo-600">Browse Files</span></span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 animate-in zoom-in-95 duration-300">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-zinc-950 bg-lime-300 shadow-[4px_4px_0px_#18181b]">
                    {file.type.startsWith('image/') ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    )}
                  </div>
                  <h3 className={`${jakarta.className} mb-3 max-w-[300px] truncate text-xl font-black text-zinc-950`}>{file.name}</h3>
                  
                  <div className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-zinc-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-950 shadow-[2px_2px_0px_#18181b]">
                    <FaCheck className="text-lime-500" /> Verified & Ready
                  </div>

                  <button onClick={(e) => { e.stopPropagation(); setFile(null) }} className="text-sm font-bold text-zinc-500 hover:text-zinc-950 transition-colors underline underline-offset-4">
                    Upload a different file
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-zinc-950 bg-rose-200 px-4 py-3 text-sm font-bold text-zinc-950 shadow-[2px_2px_0px_#18181b]">
                <FaTimes /> {error}
              </div>
            )}

            {/* Primary CTA */}
            <button
              disabled={!file}
              onClick={() => setStage('role')}
              className={`mt-10 flex w-full items-center justify-center gap-3 rounded-full border-2 py-5 text-lg font-black transition-all duration-300 ${
                file 
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-[6px_6px_0px_#a3e635] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#a3e635] active:translate-y-[6px] active:shadow-none' 
                  : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
              }`}
            >
              Proceed to Role Selection <FaArrowRight />
            </button>
          </div>
        )}

        {/* STAGE 2: ROLE SELECTION */}
        {stage === 'role' && (
          <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-10 text-center">
              <h2 className={`${jakarta.className} mb-4 text-3xl font-black tracking-tight text-zinc-950 md:text-4xl`}>
                Calibrate the Engine
              </h2>
              <p className="text-lg font-bold text-zinc-600">
                Select your target role to contextualize your missing signals.
              </p>
            </div>

            {/* Track Toggle */}
            <div className="mb-6 flex rounded-2xl border-2 border-zinc-950 bg-white p-1 shadow-[4px_4px_0px_#18181b]">
              {TRACKS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setSelectedTrack(t.value)}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-black transition-all duration-200 ${
                    selectedTrack === t.value
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'bg-transparent text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="mb-10 text-center text-sm font-bold text-zinc-500">
              {TRACKS.find(t => t.value === selectedTrack)?.desc}
            </p>

            <div className="grid gap-4 mb-10">
              {ROLES.map(r => (
                <div
                  key={r.value}
                  onClick={() => setSelectedRole(r.value)}
                  className={`group flex cursor-pointer items-center gap-5 rounded-2xl border-2 p-5 transition-all duration-200 ${
                    selectedRole === r.value 
                      ? 'border-zinc-950 bg-lime-300 shadow-[6px_6px_0px_#18181b] -translate-y-1' 
                      : 'border-zinc-200 bg-white hover:border-zinc-950 hover:shadow-[4px_4px_0px_#18181b] hover:-translate-y-1'
                  }`}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-zinc-950 bg-white text-2xl shadow-[2px_2px_0px_#18181b] transition-transform group-hover:scale-105">
                    {r.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`${jakarta.className} text-lg font-black text-zinc-950`}>
                      {r.label}
                    </h4>
                    <p className="text-sm font-bold text-zinc-600 mt-1">{r.desc}</p>
                  </div>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                    selectedRole === r.value ? 'border-zinc-950 bg-zinc-950 text-white shadow-[2px_2px_0px_#18181b]' : 'border-zinc-300 bg-zinc-50'
                  }`}>
                    {selectedRole === r.value && <FaCheck className="w-3 h-3" />}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-zinc-950 bg-rose-200 px-4 py-3 text-sm font-bold text-zinc-950 shadow-[2px_2px_0px_#18181b]">
                <FaTimes /> {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-4 sm:flex-row">
              <button
                onClick={() => setStage('upload')}
                className="flex items-center justify-center rounded-full border-2 border-zinc-950 bg-white px-8 py-5 text-sm font-black text-zinc-950 shadow-[4px_4px_0px_#18181b] transition-all hover:translate-y-[2px] hover:bg-zinc-50 hover:shadow-[2px_2px_0px_#18181b] active:translate-y-[4px] active:shadow-none"
              >
                Back
              </button>
              <button
                disabled={!selectedRole}
                onClick={handleAnalyze}
                className={`flex flex-1 items-center justify-center gap-3 rounded-full border-2 py-5 text-lg font-black transition-all duration-300 ${
                  selectedRole 
                    ? 'border-zinc-950 bg-zinc-950 text-white shadow-[6px_6px_0px_#a3e635] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#a3e635] active:translate-y-[6px] active:shadow-none' 
                    : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
                }`}
              >
                Start Evaluation <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: ANALYZING */}
        {stage === 'analyzing' && (
          <div className="w-full animate-in fade-in zoom-in-95 duration-500 rounded-3xl border-2 border-zinc-950 bg-white p-8 md:p-12 shadow-[12px_12px_0px_#18181b]">
            <AnalysisLoading steps={analyzeSteps} activeStep={analyzeStep} />
          </div>
        )}

      </main>
    </div>
  )
}