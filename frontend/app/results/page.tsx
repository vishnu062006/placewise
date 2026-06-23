'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ScoreRing from '@/components/ScoreRing'
import SkillGapCard from '@/components/SkillGapCard'
import RoadmapTimeline from '@/components/RoadmapTimeline'
import ScoreBreakdown, { type ScoreFactor } from '@/components/ScoreBreakdown'
import ResumeSignals from '@/components/ResumeSignals'
import BenchmarkCard from '@/components/BenchmarkCard'
import RadarChart from '@/components/RadarChart'
import ShareCard from '@/components/ShareCard'
import CompanyCompatibility from '@/components/CompanyCompatibility'
import AnnouncementModal from '@/components/AnnouncementModal' // NEW IMPORT

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

// PREMIUM THEMED SECTION WRAPPER
function Section({ title, subtitle, children, action }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="group mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827]/40 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:bg-[#111827]/60 hover:border-white/15 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
          {subtitle && <p className="mt-1.5 text-sm text-zinc-400">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="relative">{children}</div>
    </section>
  )
}

function StatPill({ label, value, color = '#10B981', helper }: { label: string; value: string | number; color?: string; helper?: string }) {
  return (
    <div className="group relative flex flex-col justify-center overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 transition-all duration-500 hover:scale-[1.02] hover:bg-white/10">
      <div className="absolute inset-x-0 top-0 h-[2px] opacity-50 transition-opacity duration-500 group-hover:opacity-100" style={{ background: color }} />
      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-black tracking-tighter text-white">{value}</div>
      {helper && <div className="mt-1.5 text-xs font-medium text-zinc-500">{helper}</div>}
    </div>
  )
}

function SignalRow({ items, tone }: { items: string[]; tone: 'positive' | 'negative' }) {
  if (!items.length) return null
  const isPositive = tone === 'positive'
  const color = isPositive ? '#10B981' : '#F43F5E'
  const symbol = isPositive ? '✓' : '⚠'
  
  return (
    <div className="grid gap-3">
      {items.slice(0, 5).map((item, i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: `${color}15`, color }}>
            {symbol}
          </div>
          <span className="text-sm font-medium leading-relaxed text-zinc-300">{item}</span>
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
  const [scrolled, setScrolled] = useState(false)

  // NEW: State for Announcement Modal and Contextual Highlight
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [highlightCompat, setHighlightCompat] = useState(false)

  useEffect(() => {
    // Only show the announcement once per session
    const hasSeenAnnouncement = sessionStorage.getItem('seen_v2_announcement')
    if (!hasSeenAnnouncement) {
      setShowAnnouncement(true)
    }
  }, [])

  const handleModalClose = () => {
    setShowAnnouncement(false)
    sessionStorage.setItem('seen_v2_announcement', 'true')
    
    // Smoothly handoff attention to the Company Fit section
    setTimeout(() => {
      setActiveTab('compatibility')
      // Slight delay to ensure the component is mounted in DOM before glowing
      setTimeout(() => setHighlightCompat(true), 100)
    }, 300)
  }

  // Floating Nav Logic
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  if (!result) return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/10 border-t-[#10B981]" />
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
  const leetcode = extracted?.leetcode_count || extracted?.dsa_problems || result.skills?.dsa_signals?.length || null
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
  
  const recruiterTake = baseScore >= 80
    ? `"Strong foundation. Great trajectory for ${targetRoleLabel}. Just polish up on ${topGap} before the technical loop."`
    : `"Solid potential, but the lack of explicit ${topGap} signals makes this a tough sell for the initial ATS screen. Let's fix that."`
    
  const probability = baseScore >= 80 ? 'High' : baseScore >= 60 ? 'Medium' : 'Low'
  const probabilityColor = probability === 'High' ? '#10B981' : probability === 'Medium' ? '#FBBF24' : '#F43F5E'
  const scoreAccentColor = displayedScore >= 75 ? '#10B981' : displayedScore >= 50 ? '#FBBF24' : '#F43F5E'

  const readinessItems = [
    { label: 'Skills', value: Math.min(skills.length * 9, 100), color: '#10B981' },
    { label: 'Projects', value: Math.min(Number(projects.length || 0) * 28, 100), color: '#22D3EE' },
    { label: 'Experience', value: Math.min(Number(internships || 0) * 45, 100), color: '#8B5CF6' },
    { label: 'DSA Signal', value: leetcode ? 70 : 20, color: '#F43F5E' },
    { label: 'Role Fit', value: Math.max(20, Math.min(100 - weaknesses.length * 12, 100)), color: '#FBBF24' },
  ]

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
    <div className="min-h-screen bg-[#09090B] font-sans text-zinc-300 selection:bg-[#10B981] selection:text-white">

      {/* Cinematic Ambient Background Glows */}
      <div className="pointer-events-none fixed left-[10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[#10B981] opacity-[0.05] blur-[120px]" />
      <div className="pointer-events-none fixed right-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-[#22D3EE] opacity-[0.04] blur-[120px]" />

      {/* Cmd+K Modal */}
      {isCmdKOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#09090B]/80 pt-32 backdrop-blur-md px-4" onClick={() => setIsCmdKOpen(false)}>
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#111827] p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <input type="text" placeholder="Type a command or search..." className="w-full bg-transparent px-4 py-3 text-lg text-white outline-none placeholder:text-zinc-500" autoFocus />
            <div className="mt-4 border-t border-white/5 pt-4 flex flex-col gap-1">
              <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Quick Actions</div>
              <button onClick={() => { setIsCmdKOpen(false); router.push('/upload') }} className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white">📄 Upload New Resume Version</button>
              <button onClick={() => { setIsCmdKOpen(false); window.print() }} className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white">⬇️ Export Report as PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill Navigation */}
      <div className="sticky top-6 z-50 flex justify-center px-4 transition-all duration-500">
        <nav className={`flex items-center justify-between rounded-full px-6 py-3 transition-all duration-500 ${
          scrolled 
            ? 'w-full max-w-4xl border border-white/10 bg-[#111827]/80 shadow-2xl backdrop-blur-2xl' 
            : 'w-full max-w-5xl border border-transparent bg-transparent'
        }`}>
          <Link href="/" className="text-xl font-bold tracking-tighter text-white">
            place<span className="text-[#10B981]">wise</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-white md:flex" onClick={() => setIsCmdKOpen(true)}>
              <span>Search</span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </div>
            <Link href="/upload" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[#09090B] transition-transform hover:scale-105 hover:bg-zinc-200">
              New Analysis
            </Link>
          </div>
        </nav>
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header */}
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#111827]/50 px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md">
              <svg className="h-3.5 w-3.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM12 18H8v-2h4v2zm4-4H8v-2h8v2zm0-4H8V8h8v2z"/></svg>
              <span className="max-w-[150px] truncate sm:max-w-xs">{filename}</span>
            </div>
            <span className="text-zinc-600">•</span>
            <span className="rounded-full bg-[#10B981]/10 px-3 py-1.5 text-xs font-bold text-[#10B981] border border-[#10B981]/20">
              {targetRoleLabel}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-sans font-extrabold tracking-tight text-white">
            Placement Analysis
          </h1>
        </header>

        {/* Premium Recruiter Readout Hero Card */}
        <div className="relative mb-10 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#111827]/60 p-8 shadow-2xl backdrop-blur-2xl md:p-12">
          {/* Internal Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#10B981]/10 to-[#22D3EE]/10 opacity-50 blur-3xl transition-opacity duration-500 hover:opacity-70" />
          
          <div className="grid md:grid-cols-[240px_1fr] gap-8 md:gap-16 items-center relative z-10">
            
            {/* Left: Score Ring */}
            <div className="flex flex-col items-center justify-center">
              <ScoreRing score={displayedScore} size={200} />
              {simulatedBoost > 0 && (
                <div className="mt-5 animate-in slide-in-from-bottom-2 rounded-full border border-[#10B981]/20 bg-[#10B981]/10 px-4 py-1.5 text-xs font-bold text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  +{simulatedBoost} Projected Points
                </div>
              )}
            </div>

            {/* Right: The Readout */}
            <div className="flex flex-col text-center md:text-left">
              <div className="mb-6 flex items-center justify-center gap-3 md:justify-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#10B981] to-[#22D3EE] shadow-lg">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4zM6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">AI Recruiter Readout</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Target: {targetRoleLabel}</div>
                </div>
              </div>

              <blockquote className="mb-8 border-l-2 border-[#10B981]/50 pl-5 text-xl font-medium leading-relaxed tracking-tight text-white sm:text-2xl">
                {recruiterTake}
              </blockquote>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-zinc-500">Interview Probability</span>
                    <span style={{ color: probabilityColor }}>{probability}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_currentColor]" style={{ width: `${displayedScore}%`, backgroundColor: scoreAccentColor }} />
                  </div>
                </div>
                
                {baseScore >= 60 && (
                  <div className="shrink-0 mt-4 sm:mt-0">
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

        {/* Above the Fold Quick Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatPill label="CGPA" value={cgpa} color="#10B981" helper="Academic Benchmark" />
          <StatPill label="Internships" value={internships} color="#22D3EE" helper="Professional Exposure" />
          <StatPill label="Skills" value={skills.length} color="#8B5CF6" helper="Detected Keywords" />
          <StatPill label="Projects" value={projects.length || '0'} color="#FBBF24" helper="Portfolio Depth" />
        </div>

        {/* Centered Tab Navigation (Upgraded) */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex overflow-x-auto rounded-full border border-white/10 bg-[#111827]/60 p-1.5 backdrop-blur-xl hide-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              const isCompanyFit = tab.id === 'compatibility'

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-8 py-3 text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? 'text-[#09090B] bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                      : isCompanyFit
                        ? 'text-[#22D3EE] hover:bg-white/5'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.label}
                  
                  {/* Premium Animated Indicator for Company Fit */}
                  {isCompanyFit && (
                    <span className="relative flex h-2 w-2">
                      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                        isActive ? 'bg-[#10B981]' : 'bg-[#22D3EE]'
                      }`} />
                      <span className={`relative inline-flex h-2 w-2 rounded-full ${
                        isActive ? 'bg-[#10B981]' : 'bg-[#22D3EE]'
                      }`} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* --- Dynamic Tab Segment Content Routing --- */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeTab === 'overview' && (
            <>
              {/* Simulator + ROI Actions */}
              <div className="mb-6 grid gap-6 lg:grid-cols-2">
                <Section title="Project Your Score" subtitle="Select actions to see how they impact your readiness.">
                  <div className="grid gap-3">
                    {simulatorActions.map(action => (
                      <div
                        key={action.id}
                        onClick={() => handleToggle(action.id, action.points)}
                        className={`group flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-300 ${
                          activeToggles[action.id]
                            ? 'border-[#10B981] bg-[#10B981]/10'
                            : 'border-white/5 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                            activeToggles[action.id] ? 'border-[#10B981] bg-[#10B981]' : 'border-zinc-600'
                          }`}>
                            {activeToggles[action.id] && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#09090B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                          </div>
                          <span className={`text-sm font-medium transition-colors ${activeToggles[action.id] ? 'text-white' : 'text-zinc-300'}`}>{action.label}</span>
                        </div>
                        <span className={`text-xs font-bold ${activeToggles[action.id] ? 'text-[#10B981]' : 'text-zinc-500'}`}>
                          +{action.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Highest-ROI Actions" subtitle="Prioritized fixes perfectly tailored for your target role.">
                  <div className="grid gap-3">
                    {recommendations.slice(0, 3).map((rec, i) => (
                      <div key={i} className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-zinc-400">{i + 1}</div>
                        <div>
                          <div className="mb-1 text-sm font-bold text-white">{rec.title}</div>
                          <p className="text-xs leading-relaxed text-zinc-400">{rec.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>

              {/* Factor Breakdown + Radar */}
              <div className="mb-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <Section title="Factor Breakdown" subtitle="Signals driving your baseline score">
                  <ScoreBreakdown factors={scoreFactors} confidence={confidence} />
                </Section>
                <Section title="Readiness Radar" subtitle="Visual alignment against role requirements">
                  <div className="flex min-h-[350px] h-full w-full items-center justify-center py-4">
                    <RadarChart items={readinessItems} />
                  </div>
                </Section>
              </div>

              {/* Strengths + Weaknesses */}
              <div className="mb-6 grid gap-6 lg:grid-cols-2">
                <Section title="Profile Strengths" subtitle="Signals currently helping your score">
                  <SignalRow items={strengths} tone="positive" />
                </Section>
                <Section title="Critical Missing" subtitle="Role-specific gaps to close immediately">
                  <SignalRow items={weaknesses} tone="negative" />
                </Section>
              </div>

              {/* Benchmark */}
              <div className="mb-6">
                <BenchmarkCard benchmark={benchmark} score={baseScore} />
              </div>

              {/* Extracted metadata */}
              <Section title="Extracted Profile" subtitle="Core variables parsed directly from your PDF">
                <ResumeSignals
                  cgpa={cgpa || 'Not listed'}
                  internships={internships}
                  projectsCount={projects.length || 0}
                  skillsCount={skills.length}
                  certifications={certifications}
                  githubPresent={githubPresent}
                  linkedinPresent={linkedinPresent}
                />
              </Section>

              {/* Skills */}
              {skills.length > 0 && (
                <Section title="Technical Skills" subtitle="Extracted by the placement engine">
                  <div className="flex flex-wrap gap-2.5">
                    {skills.map((s, i) => (
                      <span key={i} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white">
                        {s}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <Section title={`Projects Extracted (${projects.length})`} subtitle="Portfolio detected from your resume">
                  <div className="grid gap-4 md:grid-cols-2">
                    {projects.map((p, i) => {
                      const tech = typeof p !== 'string' ? p.tech_used || p.tech : null
                      return (
                        <div key={i} className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10">
                          <div className="mb-3 text-base font-bold text-white">
                            {typeof p === 'string' ? p : p.name || p.title || `Project ${i + 1}`}
                          </div>
                          {typeof p !== 'string' && (p.description || tech) && (
                            <div>
                              {p.description && <p className="mb-3 text-xs leading-relaxed text-zinc-400 line-clamp-3">{p.description}</p>}
                              {tech && (
                                <div className="inline-flex rounded-md bg-[#22D3EE]/10 px-2 py-1 text-[10px] font-bold tracking-widest text-[#22D3EE]">
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

          {/* Company Fit Tab */}
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
              isHighlighted={highlightCompat}
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

        {/* Premium Footer CTA */}
        <div className="mt-12 overflow-hidden rounded-[2.5rem] border border-[#10B981]/20 bg-gradient-to-r from-[#10B981]/10 to-transparent p-10 text-center relative backdrop-blur-xl sm:p-16">
          <div className="absolute top-0 right-0 h-[300px] w-[300px] bg-[#22D3EE]/10 rounded-full blur-[80px]" />
          
          <div className="relative z-10">
            <h3 className="mb-3 text-2xl font-bold tracking-tight text-white">Made updates to your resume?</h3>
            <p className="mb-8 text-base text-zinc-400">Upload your revised PDF to recalculate your placement score.</p>
            <Link href="/upload" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-[#09090B] shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-transform hover:scale-105 hover:bg-zinc-200">
              Re-Analyse Resume
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

      </main>

      {/* The V2 Announcement Modal */}
      <AnnouncementModal 
        isOpen={showAnnouncement} 
        onClose={handleModalClose} 
      />

    </div>
  )
}
