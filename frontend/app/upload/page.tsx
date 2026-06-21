'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AnalysisLoading from '@/components/AnalysisLoading'

const ROLES = [
  { value: 'faang_sde', label: 'FAANG / Top Tier', desc: 'Google, Microsoft, Amazon, Meta', icon: '⚡' },
  { value: 'product_company', label: 'Product Companies', desc: 'Zepto, Razorpay, CRED, Atlassian', icon: '🚀' },
  { value: 'service_company', label: 'Service Companies', desc: 'TCS, Infosys, Wipro, Cognizant', icon: '🏢' },
  { value: 'ml_data_role', label: 'Data / ML Roles', desc: 'Data Analyst, ML Engineer fresher', icon: '🤖' },
  { value: 'core_engineering', label: 'Core Engineering', desc: 'Embedded, VLSI, Mech — for ECE/EE', icon: '⚙️' },
]

type Stage = 'upload' | 'role' | 'analyzing'

export default function UploadPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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
      const formData = new FormData()
      formData.append('file', file)
      formData.append('role', selectedRole)
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/analyze`, {
        method: 'POST', body: formData,
      })
      
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      
      clearInterval(interval)
      sessionStorage.setItem('placewise_result', JSON.stringify(data))
      sessionStorage.setItem('placewise_role', selectedRole)
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
    <div className="min-h-screen bg-[#09090B] font-sans text-white selection:bg-[#10B981] selection:text-white flex flex-col">
      
      {/* Premium Sticky Navigation */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#09090B]/80 px-6 backdrop-blur-xl">
        <Link href="/" className="text-xl font-bold tracking-tighter text-white no-underline transition-opacity hover:opacity-80">
          place<span className="text-[#10B981]">wise</span>
        </Link>

        {/* Apple-style Progress Indicator */}
        <div className="flex items-center gap-2 sm:gap-4">
          {['Upload', 'Role', 'Analysis'].map((label, i) => {
            const isActive = i === stageIndex
            const isPast = i < stageIndex
            return (
              <div key={label} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-all duration-300 ${
                    isPast ? 'bg-[#10B981] border-[#10B981] text-[#09090B]' : 
                    isActive ? 'border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 
                    'border-white/20 text-white/40'
                  }`}>
                    {isPast ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : i + 1}
                  </div>
                  <span className={`hidden text-xs font-semibold tracking-wide uppercase sm:block ${isActive ? 'text-white' : 'text-white/40'}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div className={`h-px w-8 sm:w-12 ${isPast ? 'bg-[#10B981]' : 'bg-white/10'}`} />}
              </div>
            )
          })}
        </div>
      </nav>

      <main className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-12">
        
        {/* STAGE 1: FOCUSED UPLOAD */}
        {stage === 'upload' && (
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Start Your Evaluation
            </h1>
            <p className="mb-10 text-lg text-zinc-400">
              Upload your resume and we'll evaluate it exactly like a senior technical recruiter would.
            </p>

            {/* Clean, Generous Dropzone */}
            <div
              className={`group relative w-full overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                dragActive ? 'border-[#10B981] bg-[#10B981]/5' : 
                file ? 'border-white/10 bg-white/[0.02]' : 
                'border-white/15 bg-transparent hover:border-white/30 hover:bg-white/[0.02]'
              }`}
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !file && inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept=".pdf,image/png,image/jpeg,image/jpg" onChange={handleFileChange} className="hidden" />

              {!file ? (
                <div className="flex cursor-pointer flex-col items-center justify-center py-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-zinc-400 group-hover:scale-110 group-hover:text-white transition-all">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">Drag & Drop Resume</h3>
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">PDF • PNG • JPG Supported</p>
                  <span className="text-sm font-medium text-zinc-400">or <span className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">Browse Files</span></span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-300">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#10B981]">
                    {file.type.startsWith('image/') ? (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    )}
                  </div>
                  <h3 className="mb-2 max-w-[300px] truncate text-lg font-bold text-white">{file.name}</h3>
                  <div className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-[#10B981]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    File verified and ready for evaluation
                  </div>
                  
                  {/* Simplified High-Trust Badges */}
                  <div className="flex items-center justify-center gap-6 text-xs font-bold uppercase tracking-widest text-zinc-500">
                    <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Private</span>
                    <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> ~45s Analysis</span>
                  </div>

                  <button onClick={(e) => { e.stopPropagation(); setFile(null) }} className="mt-8 text-xs font-semibold text-zinc-500 hover:text-white transition-colors">
                    Upload a different file
                  </button>
                </div>
              )}
            </div>

            {error && <p className="mt-4 text-sm font-medium text-rose-400">{error}</p>}

            {/* Primary CTA */}
            <button
              disabled={!file}
              onClick={() => setStage('role')}
              className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-5 text-lg font-bold transition-all duration-300 ${
                file 
                  ? 'bg-white text-[#09090B] shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-[1.02] hover:bg-zinc-200' 
                  : 'cursor-not-allowed bg-white/5 text-zinc-500'
              }`}
            >
              Proceed to Role Selection <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}

        {/* STAGE 2: ROLE SELECTION */}
        {stage === 'role' && (
          <div className="mx-auto w-full max-w-2xl animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Calibrate the Engine
              </h2>
              <p className="text-lg text-zinc-400">
                Select your target role to contextualize your missing signals.
              </p>
            </div>

            <div className="grid gap-3 mb-10">
              {ROLES.map(r => (
                <div
                  key={r.value}
                  onClick={() => setSelectedRole(r.value)}
                  className={`group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                    selectedRole === r.value 
                      ? 'border-white bg-white/10' 
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl transition-transform group-hover:scale-105">
                    {r.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-base font-bold ${selectedRole === r.value ? 'text-white' : 'text-zinc-200'}`}>
                      {r.label}
                    </h4>
                    <p className="text-sm text-zinc-500">{r.desc}</p>
                  </div>
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                    selectedRole === r.value ? 'border-white bg-white text-[#09090B]' : 'border-white/20 bg-transparent'
                  }`}>
                    {selectedRole === r.value && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="mb-6 text-center text-sm font-medium text-rose-400">{error}</p>}

            <div className="flex gap-4">
              <button
                onClick={() => setStage('upload')}
                className="flex items-center justify-center rounded-2xl border border-white/10 bg-transparent px-8 py-5 text-sm font-bold text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                Back
              </button>
              <button
                disabled={!selectedRole}
                onClick={handleAnalyze}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-5 text-lg font-bold transition-all duration-300 ${
                  selectedRole 
                    ? 'bg-white text-[#09090B] shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-[1.02] hover:bg-zinc-200' 
                    : 'cursor-not-allowed bg-white/5 text-zinc-500'
                }`}
              >
                Start Evaluation <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: ANALYZING */}
        {stage === 'analyzing' && (
          <div className="mx-auto w-full max-w-2xl animate-in fade-in zoom-in-95 duration-500">
            <AnalysisLoading steps={analyzeSteps} activeStep={analyzeStep} />
          </div>
        )}

      </main>
    </div>
  )
}