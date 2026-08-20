'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { FaCheck, FaTimes, FaStar, FaArrowLeft, FaBars } from 'react-icons/fa'

import ScoreRing from '@/components/ScoreRing'
import SkillGapCard from '@/components/SkillGapCard'
import RoadmapTimeline from '@/components/RoadmapTimeline'
import ScoreBreakdown, { type ScoreFactor } from '@/components/ScoreBreakdown'
import ResumeSignals from '@/components/ResumeSignals'
import BenchmarkCard from '@/components/BenchmarkCard'
import ShareCard from '@/components/ShareCard'
import CompanyCompatibility from '@/components/CompanyCompatibility'
import SaveResumePrompt from "@/components/SaveResumePrompt"

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

const ROLE_LABELS: Record<string, string> = {
  faang_sde: 'FAANG / Top Tier',
  product_company: 'Product Companies',
  service_company: 'Service Companies',
  ml_data_role: 'Data / ML Roles',
  core_engineering: 'Core Engineering',
}

type Project = string | {
  name?: string; title?: string; description?: string
  tech?: string[] | string; tech_used?: string[] | string
}
type GapItem = { skill: string; importance: 'critical' | 'high' | 'medium' | 'low'; reason?: string }
type Recommendation = { title: string; action: string; why?: string }
type AnalysisResult = {
  placement_score?: {
    final_score?: number; score?: number; probability?: number
    band_label?: string; confidence?: number; factors?: ScoreFactor[]
    benchmark?: { role_average?: number; candidate_score?: number; percentile?: number; label?: string; explanation?: string }
    explanation?: string
  }
  extracted?: {
    skills?: string[]; technical_skills?: string[]; parsed_data?: { skills?: string[] }
    projects?: Project[]; cgpa?: string | number; gpa?: string | number
    internship_count?: number; internships?: unknown[]
    leetcode_count?: number; dsa_problems?: number
  }
  skills?: { technical?: string[]; dsa_signals?: string[] }
  profile?: { cgpa?: string | number; internship_count?: number; project_count?: number; github_present?: boolean; linkedin_present?: boolean }
  projects?: Project[]
  gap_analysis?: { gaps?: string[] | GapItem[]; missing_skills?: string[] | GapItem[]; strengths?: string[]; recommendations?: Recommendation[] }
  score_factors?: ScoreFactor[]
  confidence?: number
  benchmark?: { role_average?: number; candidate_score?: number; percentile?: number; label?: string; explanation?: string }
  strengths?: string[]; weaknesses?: string[]; recommendations?: Recommendation[]
  extractedData?: { certifications?: string[]; github_present?: boolean; linkedin_present?: boolean }
  roadmap?: unknown; summary?: string
}

// PREMIUM BRUTALIST SECTION WRAPPER
function Section({ title, subtitle, children, action, className = '' }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={`group flex h-full w-full flex-col overflow-hidden rounded-3xl border-2 border-zinc-950 bg-white p-6 shadow-[8px_8px_0px_#18181b] transition-transform hover:-translate-y-1 hover:shadow-[12px_12px_0px_#18181b] sm:p-8 ${className}`}>
      <div className="mb-6 flex shrink-0 items-start justify-between gap-4 border-b-2 border-zinc-950 pb-4">
        <div>
          <h2 className={`${jakarta.className} text-xl font-black tracking-tight text-zinc-950`}>{title}</h2>
          {subtitle && <p className="mt-1 text-sm font-bold text-zinc-600">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="relative flex flex-1 flex-col">{children}</div>
    </section>
  )
}

function StatPill({ label, value, color = 'bg-lime-300', helper }: { label: string; value: string | number; color?: string; helper?: string }) {
  return (
    <div className="group flex h-full flex-col justify-center overflow-hidden rounded-2xl border-2 border-zinc-950 bg-[#fbfbf7] p-5 shadow-[4px_4px_0px_#18181b] transition-transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</div>
        <div className={`h-3 w-3 rounded-full border-2 border-zinc-950 ${color}`} />
      </div>
      <div className={`${jakarta.className} mt-3 text-3xl font-black tracking-tighter text-zinc-950`}>{value}</div>
      {helper && <div className="mt-1 text-xs font-bold text-zinc-600">{helper}</div>}
    </div>
  )
}

function SignalRow({ items, tone }: { items: string[]; tone: 'positive' | 'negative' }) {
  if (!items.length) return null
  const isPositive = tone === 'positive'
  const bgColor = isPositive ? 'bg-lime-200' : 'bg-rose-200'
  const textColor = isPositive ? 'text-lime-700' : 'text-rose-700'
  
  return (
    <div className="flex h-full flex-col gap-3">
      {items.slice(0, 5).map((item, i) => (
        <div key={i} className={`flex flex-1 items-start gap-3 rounded-xl border-2 border-zinc-950 ${bgColor} p-4 shadow-[2px_2px_0px_#18181b] transition-transform hover:-translate-x-1`}>
          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-zinc-950 bg-white text-[10px] font-black ${textColor}`}>
            {isPositive ? <FaCheck /> : <FaTimes />}
          </div>
          <span className="text-sm font-bold leading-relaxed text-zinc-950">{item}</span>
        </div>
      ))}
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [role, setRole] = useState('')
  const [filename, setFilename] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'compatibility' | 'gaps' | 'roadmap'>('overview')
  const [simulatedBoost, setSimulatedBoost] = useState(0)
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({})
  const [isCmdKOpen, setIsCmdKOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('placewise_result')
    const r = sessionStorage.getItem('placewise_role')
    const fn = sessionStorage.getItem('placewise_filename')
    if (!raw) { router.push('/upload'); return }
    try {
      setResult(JSON.parse(raw))
      setRole(r || '')
      setFilename(fn || 'resume.pdf')
    } catch {
      router.push('/upload')
    }
  }, [router])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setIsCmdKOpen(o => !o) }
      if (e.key === 'Escape') setIsCmdKOpen(false)
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleFeedbackSubmit = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rating: feedbackRating, 
          role: role, 
          filename: filename,
          score: result?.placement_score?.final_score ?? result?.placement_score?.score ?? 0 
        })
      })
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    } finally {
      setFeedbackSubmitted(true)
    }
  }

  if (!result) return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbf7]">
      <div className="flex h-16 w-16 animate-spin items-center justify-center rounded-2xl border-4 border-zinc-950 bg-lime-300 shadow-[4px_4px_0px_#18181b]" />
    </div>
  )

  const { placement_score, extracted, gap_analysis, roadmap, profile } = result
  const baseScore = placement_score?.final_score ?? placement_score?.score ?? placement_score?.probability ?? 0
  const displayedScore = Math.min(100, baseScore + simulatedBoost)
  
  const gaps = (gap_analysis?.gaps ?? gap_analysis?.missing_skills ?? []) as string[] | GapItem[]
  const skills: string[] = result.skills?.technical || extracted?.skills || extracted?.technical_skills || extracted?.parsed_data?.skills || []
  const projects = result.projects || extracted?.projects || []
  const cgpa = profile?.cgpa || extracted?.cgpa || extracted?.gpa || '—'
  const internships = profile?.internship_count ?? extracted?.internship_count ?? extracted?.internships?.length ?? 0
  const scoreFactors = result.score_factors || placement_score?.factors || []
  const confidence = result.confidence ?? placement_score?.confidence
  const benchmark = result.benchmark || placement_score?.benchmark
  
  const strengths = result.strengths || gap_analysis?.strengths || scoreFactors.filter(f => f.impact > 0).map(f => f.name)
  const weaknesses = result.weaknesses || gaps.map(g => typeof g === 'string' ? g : g.skill)
  const recommendations: Recommendation[] = result.recommendations || gap_analysis?.recommendations || weaknesses.slice(0, 4).map(title => ({
    title, action: `Make this signal explicit for ${ROLE_LABELS[role] || 'the selected role'}.`,
  }))
  
  const certifications = result.extractedData?.certifications || []
  const githubPresent = result.extractedData?.github_present ?? profile?.github_present
  const linkedinPresent = result.extractedData?.linkedin_present ?? profile?.linkedin_present

  const topGap = weaknesses[0] || 'core requirements'
  const targetRoleLabel = ROLE_LABELS[role] || role || 'Target Role'
  
  const rawRoadmap = roadmap as any
  const actualVerdict = rawRoadmap?.honest_verdict || rawRoadmap?.summary
  
  const recruiterTake = actualVerdict || (baseScore >= 80
    ? `"Strong foundation. Great trajectory for ${targetRoleLabel}. Just polish up on ${topGap} before the technical loop."`
    : `"Solid potential, but the lack of explicit ${topGap} signals makes this a tough sell for the initial ATS screen. Let's fix that."`)
    
  const probability = baseScore >= 80 ? 'High' : baseScore >= 60 ? 'Medium' : 'Low'
  const probabilityBg = probability === 'High' ? 'bg-lime-300' : probability === 'Medium' ? 'bg-amber-300' : 'bg-rose-300'

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'compatibility', label: 'Company Fit' },
    { id: 'gaps', label: 'Skill Gaps' },
    { id: 'roadmap', label: '4-Week Plan' },
  ] as const

  const handleToggle = (id: string, points: number) => {
    setActiveToggles(prev => {
      const isActive = !!prev[id]
      setSimulatedBoost(cur => cur + (isActive ? -points : points))
      return { ...prev, [id]: !isActive }
    })
  }

  const simulatorActions = recommendations.slice(0, 3).map((rec, i) => ({
    id: `sim_${i}`, label: rec.title, points: i === 0 ? 6 : i === 1 ? 4 : 3
  }))

  return (
    <div className={`${inter.className} min-h-screen bg-[#fbfbf7] text-zinc-950 selection:bg-lime-300 selection:text-zinc-950 overflow-x-hidden`}>
      
      {/* Brutalist Grid Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#18181b1a_1px,transparent_1px),linear-gradient(to_bottom,#18181b1a_1px,transparent_1px)] bg-[size:32px_32px] print:hidden" />

      {/* Cmd+K Modal (Brutalist Light Mode) */}
      {isCmdKOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-zinc-950/40 px-4 pt-32 backdrop-blur-sm print:hidden" onClick={() => setIsCmdKOpen(false)}>
          <div className="w-full max-w-lg rounded-3xl border-2 border-zinc-950 bg-white p-6 shadow-[12px_12px_0px_#18181b] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <input type="text" placeholder="Type a command or search..." className="w-full rounded-xl border-2 border-zinc-950 bg-[#fbfbf7] px-4 py-3 text-lg font-bold text-zinc-950 outline-none placeholder:text-zinc-400 focus:bg-white" autoFocus />
            <div className="mt-4 flex flex-col gap-2 border-t-2 border-zinc-950 pt-4">
              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">Quick Actions</div>
              <button onClick={() => { setIsCmdKOpen(false); router.push('/upload') }} className="w-full rounded-xl border-2 border-transparent px-4 py-3 text-left text-sm font-bold text-zinc-950 hover:border-zinc-950 hover:bg-zinc-50 hover:shadow-[2px_2px_0px_#18181b] transition-all">📄 Upload New Resume Version</button>
              <button onClick={() => { setIsCmdKOpen(false); window.print() }} className="w-full rounded-xl border-2 border-transparent px-4 py-3 text-left text-sm font-bold text-zinc-950 hover:border-zinc-950 hover:bg-zinc-50 hover:shadow-[2px_2px_0px_#18181b] transition-all">⬇️ Export Report as PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING GLASSMORPHISM NAVBAR */}
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:top-6 print:hidden">
        <nav className="relative flex w-full max-w-6xl items-center justify-between rounded-full border-2 border-zinc-950 bg-white/80 px-4 py-3 backdrop-blur-xl shadow-[4px_4px_0px_#18181b] transition-all md:px-8">
          <Link href="/" aria-label="Trajekt home" className="flex items-baseline gap-2 transition-transform hover:-translate-y-0.5">
            <span className={`${jakarta.className} text-xl font-black tracking-tight`}>Trajekt</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-4 md:flex">
            <div className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-zinc-200 bg-white px-4 py-1.5 text-xs font-bold text-zinc-500 transition-all hover:border-zinc-950 hover:text-zinc-950 hover:shadow-[2px_2px_0px_#18181b]" onClick={() => setIsCmdKOpen(true)}>
              <span>Search</span>
              <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-950 border border-zinc-300">⌘K</kbd>
            </div>
            <Link href="/jd-match" className="text-sm font-bold text-zinc-600 transition-colors hover:text-zinc-950 ml-4">
              JD Match
            </Link>
          </div>

          <div className="hidden md:block">
            <Link
              href="/upload"
              className="rounded-full border-2 border-zinc-950 bg-zinc-950 px-6 py-2.5 text-sm font-black text-white shadow-[4px_4px_0px_#a3e635] transition-all hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#a3e635] active:translate-y-[4px] active:shadow-none"
            >
              New Analysis
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
            <div className="absolute left-0 right-0 top-[calc(100%+12px)] rounded-3xl border-2 border-zinc-950 bg-white/95 p-6 backdrop-blur-xl shadow-[8px_8px_0px_#18181b] md:hidden">
              <div className="flex flex-col gap-6 text-center">
                <Link href="/jd-match" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black text-zinc-950">JD Match</Link>
                <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black text-zinc-950">New Analysis</Link>
                <button onClick={() => {setIsMobileMenuOpen(false); setIsCmdKOpen(true)}} className="text-xl font-black text-zinc-500">Search (⌘K)</button>
              </div>
            </div>
          )}
        </nav>
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pt-32 pb-24 sm:px-6 sm:pt-40 print:m-0 print:block print:w-full print:p-0">

        <header className="mb-10 text-center md:text-left">
          <div className="mb-4 flex flex-wrap justify-center md:justify-start items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border-2 border-zinc-950 bg-white px-4 py-1.5 text-xs font-bold text-zinc-950 shadow-[2px_2px_0px_#18181b]">
              <span className="max-w-[150px] truncate sm:max-w-xs">{filename}</span>
            </div>
            <span className="rounded-full border-2 border-zinc-950 bg-indigo-300 px-4 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-zinc-950 shadow-[2px_2px_0px_#18181b]">
              {targetRoleLabel}
            </span>
          </div>
          <h1 className={`${jakarta.className} text-4xl font-black tracking-tight text-zinc-950 md:text-6xl`}>
            Placement Analysis
          </h1>
        </header>

        {/* HERO SCORE CARD */}
        <div className="relative mb-10 overflow-hidden rounded-[2.5rem] border-2 border-zinc-950 bg-white p-8 shadow-[12px_12px_0px_#18181b] md:p-12">
          
          <div className="relative z-10 grid items-center gap-8 md:grid-cols-[240px_1fr] md:gap-16">
            
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-full bg-[#fbfbf7] p-2 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)]">
                 <ScoreRing score={displayedScore} size={200} />
              </div>
              {simulatedBoost > 0 && (
                <div className="mt-5 rounded-full border-2 border-zinc-950 bg-lime-300 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-zinc-950 shadow-[4px_4px_0px_#18181b] animate-in slide-in-from-bottom-2">
                  +{simulatedBoost} Projected Points
                </div>
              )}
            </div>

            <div className="flex flex-col text-center md:text-left">
              <div className="mb-6 flex items-center justify-center gap-4 md:justify-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-zinc-950 bg-indigo-300 shadow-[4px_4px_0px_#18181b]">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <div className="text-sm font-black text-zinc-950">AI Recruiter Readout</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Target: {targetRoleLabel}</div>
                </div>
              </div>

              <blockquote className={`${jakarta.className} mb-8 border-l-4 border-zinc-950 bg-zinc-50 p-4 text-xl font-bold leading-relaxed tracking-tight text-zinc-950 sm:text-2xl`}>
                {recruiterTake}
              </blockquote>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-zinc-500">Interview Probability</span>
                    <span className={`rounded px-2 py-0.5 border-2 border-zinc-950 shadow-[2px_2px_0px_#18181b] text-zinc-950 ${probabilityBg}`}>{probability}</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full border-2 border-zinc-950 bg-zinc-100">
                    <div className={`h-full border-r-2 border-zinc-950 transition-all duration-700 ease-out ${probabilityBg}`} style={{ width: `${displayedScore}%` }} />
                  </div>
                </div>
                
                {baseScore >= 60 && (
                  <div className="mt-4 shrink-0 sm:mt-0 print:hidden">
                    <ShareCard
                      score={displayedScore}
                      role={role}
                      bandLabel={placement_score?.band_label || 'Placement Ready'}
                      cgpa={cgpa as string}
                      skillsCount={skills.length}
                      internships={Number(internships) || 0}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SIGN IN TO SAVE */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl border-2 border-zinc-950 bg-indigo-300 p-8 shadow-[8px_8px_0px_#18181b]">
           <div className="text-center md:text-left">
             <h3 className={`${jakarta.className} text-2xl font-black text-zinc-950`}>Save this analysis permanently.</h3>
             <p className="mt-2 text-sm font-bold text-zinc-800 max-w-md">Sign in to securely store your resume, track your application progress, and get weekly roadmap updates.</p>
           </div>
           <div className="shrink-0 bg-white rounded-2xl border-2 border-zinc-950 p-2 shadow-[4px_4px_0px_#18181b]">
             <SaveResumePrompt />
           </div>
        </div>

        {/* STAT PILLS */}
        <div className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:auto-rows-fr">
          <StatPill label="CGPA" value={cgpa} color="bg-lime-400" helper="Academic Benchmark" />
          <StatPill label="Internships" value={internships} color="bg-indigo-400" helper="Professional Exposure" />
          <StatPill label="Skills" value={skills.length} color="bg-rose-400" helper="Detected Keywords" />
          <StatPill label="Projects" value={projects.length || '0'} color="bg-amber-400" helper="Portfolio Depth" />
        </div>

        {/* TABS */}
        <div className="mb-10 flex justify-center print:hidden">
          <div className="hide-scrollbar inline-flex overflow-x-auto rounded-full border-2 border-zinc-950 bg-white p-1.5 shadow-[4px_4px_0px_#18181b]">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              const isCompanyFit = tab.id === 'compatibility'

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-6 py-3 text-sm font-black transition-all duration-300 ${
                    isActive 
                      ? 'bg-zinc-950 text-white shadow-sm' 
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
                >
                  {tab.label}
                  {isCompanyFit && (
                    <span className={`flex h-2 w-2 rounded-full border border-zinc-950 ${isActive ? 'bg-lime-300' : 'bg-indigo-300'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeTab === 'overview' && (
            <>
              {/* GRID 1 */}
              <div className="grid gap-8 items-stretch lg:grid-cols-2">
              <Section title="Project Your Score" subtitle="Select actions to see how they impact your readiness.">
                  <div className="flex h-full flex-col gap-4">
                    {simulatorActions.map(action => (
                      <div
                        key={action.id}
                        onClick={() => handleToggle(action.id, action.points)}
                        className={`group flex flex-1 cursor-pointer items-center justify-between rounded-2xl border-2 border-zinc-950 p-4 shadow-[4px_4px_0px_#18181b] transition-transform hover:-translate-x-1 ${
                          activeToggles[action.id]
                            ? 'bg-lime-200'
                            : 'bg-white hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 border-zinc-950 transition-colors ${
                            activeToggles[action.id] ? 'bg-zinc-950' : 'bg-white'
                          }`}>
                            {activeToggles[action.id] && <FaCheck className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm font-bold transition-colors ${activeToggles[action.id] ? 'text-zinc-950' : 'text-zinc-600 group-hover:text-zinc-950'}`}>{action.label}</span>
                        </div>
                        <span className={`text-xs font-black uppercase tracking-widest ${activeToggles[action.id] ? 'text-zinc-950' : 'text-zinc-400'}`}>
                          +{action.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Highest-ROI Actions" subtitle="Prioritized fixes perfectly tailored for your target role.">
                  <div className="flex h-full flex-col gap-4">
                    {recommendations.slice(0, 3).map((rec, i) => (
                      <div key={i} className="flex flex-1 items-start gap-4 rounded-2xl border-2 border-zinc-950 bg-white p-4 shadow-[4px_4px_0px_#18181b] transition-transform hover:-translate-x-1">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-zinc-950 bg-zinc-950 text-sm font-black text-lime-300 shadow-[2px_2px_0px_#a3e635]">{i + 1}</div>
                        <div>
                          <div className="mb-1 text-sm font-black text-zinc-950">{rec.title}</div>
                          <p className="text-xs font-bold leading-relaxed text-zinc-600">{rec.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>

              {/* GRID 2 (Radar Removed) */}
              <div className="grid gap-8 lg:grid-cols-1 lg:auto-rows-fr">
                <Section title="Factor Breakdown" subtitle="Signals driving your baseline score">
                  <ScoreBreakdown factors={scoreFactors} confidence={confidence} />
                </Section>
              </div>

              {/* GRID 3 */}
              <div className="grid gap-8 lg:grid-cols-2 lg:auto-rows-fr">
                <Section title="Profile Strengths" subtitle="Signals currently helping your score">
                  <SignalRow items={strengths} tone="positive" />
                </Section>
                <Section title="Critical Missing" subtitle="Role-specific gaps to close immediately">
                  <SignalRow items={weaknesses} tone="negative" />
                </Section>
              </div>

              {/* Benchmark */}
              <div>
                <BenchmarkCard benchmark={benchmark} score={baseScore} />
              </div>

              <Section title="Extracted Profile" subtitle="Core variables parsed directly from your PDF">
                <div className="rounded-2xl border-2 border-zinc-950 bg-white p-4 shadow-[4px_4px_0px_#18181b]">
                  <ResumeSignals
                    cgpa={cgpa || 'Not listed'}
                    internships={internships}
                    projectsCount={projects.length || 0}
                    skillsCount={skills.length}
                    certifications={certifications}
                    githubPresent={githubPresent}
                    linkedinPresent={linkedinPresent}
                  />
                </div>
              </Section>

              {skills.length > 0 && (
                <Section title="Technical Skills" subtitle="Extracted by the placement engine">
                  <div className="flex flex-wrap gap-3">
                    {skills.map((s, i) => (
                      <span key={i} className="rounded-xl border-2 border-zinc-950 bg-zinc-50 px-4 py-2 text-xs font-bold text-zinc-950 shadow-[2px_2px_0px_#18181b] transition-transform hover:-translate-y-1 hover:bg-white">
                        {s}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {projects.length > 0 && (
                <Section title={`Projects Extracted (${projects.length})`} subtitle="Portfolio detected from your resume">
                  <div className="grid gap-6 md:grid-cols-2 md:auto-rows-fr">
                    {projects.map((p, i) => {
                      const tech = typeof p !== 'string' ? p.tech_used || p.tech : null
                      return (
                        <div key={i} className="flex h-full flex-col justify-between rounded-2xl border-2 border-zinc-950 bg-white p-6 shadow-[4px_4px_0px_#18181b] transition-transform hover:-translate-y-1">
                          <div className="mb-4 text-lg font-black text-zinc-950">
                            {typeof p === 'string' ? p : p.name || p.title || `Project ${i + 1}`}
                          </div>
                          {typeof p !== 'string' && (p.description || tech) && (
                            <div>
                              {p.description && <p className="mb-4 line-clamp-3 text-xs font-medium leading-relaxed text-zinc-600">{p.description}</p>}
                              {tech && (
                                <div className="inline-flex rounded-lg border-2 border-zinc-950 bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-950">
                                  {Array.isArray(tech) ? tech.join(' • ') : tech}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Section>
              )}
            </>
          )}

          {activeTab === 'compatibility' && (
            <CompanyCompatibility
              skills={skills}
              projects={projects}
              cgpa={cgpa}
              internships={Number(internships) || 0}
              score={baseScore}
              role={role}
              hasGithub={githubPresent}
              hasDSA={!!result.skills?.dsa_signals?.length || false}
              isHighlighted={false}
            />
          )}

          {activeTab === 'gaps' && (
            <Section title="Deep Skill Analysis" subtitle={`Missing proficiencies mapped against ${targetRoleLabel}`}>
              <SkillGapCard gaps={gaps || []} role={role} />
            </Section>
          )}

          {activeTab === 'roadmap' && (
            <Section title="Structured Execution Plan" subtitle="Week-by-week timeline perfectly tailored to patch your gaps">
              <RoadmapTimeline roadmap={roadmap} />
            </Section>
          )}
        </div>

        {/* RATE THIS TOOL SECTION */}
        <div className="mt-16 rounded-3xl border-2 border-zinc-950 bg-white p-8 shadow-[8px_8px_0px_#18181b] text-center print:hidden">
          <h3 className={`${jakarta.className} text-2xl font-black text-zinc-950`}>Was this analysis helpful?</h3>
          <p className="mt-2 text-sm font-bold text-zinc-600">Your feedback helps us fine-tune the AI for better accuracy.</p>
          
          {!feedbackSubmitted ? (
            <div className="mt-6 flex flex-col items-center gap-6">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className={`text-4xl transition-transform hover:scale-110 ${feedbackRating && feedbackRating >= star ? 'text-amber-400' : 'text-zinc-200'}`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
              <button 
                disabled={!feedbackRating}
                onClick={handleFeedbackSubmit}
                className="rounded-full border-2 border-zinc-950 bg-zinc-950 px-8 py-3 text-sm font-black text-white shadow-[4px_4px_0px_#a3e635] disabled:opacity-50 disabled:cursor-not-allowed hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#a3e635] active:translate-y-[4px] active:shadow-none transition-all"
              >
                Submit Feedback
              </button>
            </div>
          ) : (
             <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border-2 border-zinc-950 bg-lime-300 px-6 py-4 text-sm font-black text-zinc-950 shadow-[4px_4px_0px_#18181b]">
               <FaCheck className="text-xl" /> Thank you! Your feedback has been recorded.
             </div>
          )}
        </div>

        {/* BOTTOM CTA */}
        <div className="relative mt-12 overflow-hidden rounded-[2.5rem] border-2 border-zinc-950 bg-lime-300 p-10 text-center shadow-[12px_12px_0px_#18181b] sm:p-16 print:hidden">
          <div className="relative z-10">
            <h3 className={`${jakarta.className} mb-3 text-3xl font-black tracking-tight text-zinc-950`}>Made updates to your resume?</h3>
            <p className="mb-8 text-base font-bold text-zinc-800">Upload your revised PDF to recalculate your placement score.</p>
            <Link href="/upload" className="inline-flex items-center gap-3 rounded-full border-2 border-zinc-950 bg-white px-8 py-5 text-lg font-black text-zinc-950 shadow-[6px_6px_0px_#18181b] transition-transform hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#18181b] active:translate-y-[6px] active:shadow-none">
              Re-Analyse Resume
              <FaArrowLeft className="rotate-180" />
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}