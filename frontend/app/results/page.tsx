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

const ROLE_LABELS: Record<string, string> = {
  faang_sde: 'FAANG / Top Tier',
  product_company: 'Product Companies',
  service_company: 'Service Companies',
  ml_data_role: 'Data / ML Roles',
  core_engineering: 'Core Engineering',
}

type Project = string | {
  name?: string
  title?: string
  description?: string
  tech?: string[] | string
  tech_used?: string[] | string
}

type GapItem = {
  skill: string
  importance: 'critical' | 'high' | 'medium' | 'low'
  reason?: string
}

type AnalysisResult = {
  placement_score?: {
    final_score?: number
    score?: number
    probability?: number
    band_label?: string
    confidence?: number
    factors?: ScoreFactor[]
    benchmark?: { role_average?: number; candidate_score?: number; percentile?: number; label?: string; explanation?: string }
    explanation?: string
  }
  extracted?: {
    skills?: string[]
    technical_skills?: string[]
    parsed_data?: { skills?: string[] }
    projects?: Project[]
    cgpa?: string | number
    gpa?: string | number
    internship_count?: number
    internships?: unknown[]
    leetcode_count?: number
    dsa_problems?: number
  }
  skills?: { technical?: string[]; dsa_signals?: string[] }
  profile?: { cgpa?: string | number; internship_count?: number; project_count?: number; github_present?: boolean; linkedin_present?: boolean }
  projects?: Project[]
  gap_analysis?: { gaps?: string[] | GapItem[]; missing_skills?: string[] | GapItem[]; strengths?: string[]; recommendations?: Recommendation[] }
  score_factors?: ScoreFactor[]
  confidence?: number
  benchmark?: { role_average?: number; candidate_score?: number; percentile?: number; label?: string; explanation?: string }
  strengths?: string[]
  weaknesses?: string[]
  recommendations?: Recommendation[]
  extractedData?: {
    certifications?: string[]
    github_present?: boolean
    linkedin_present?: boolean
  }
  roadmap?: unknown
  summary?: string
}

type Recommendation = {
  title: string
  action: string
  why?: string
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="group mb-5 rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] transition-all duration-200 hover:border-[var(--border2)] sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[0.95rem] font-semibold tracking-[-0.01em] text-[var(--text)]">{title}</h2>
          {subtitle && <p className="mt-1 text-[0.8rem] leading-5 text-[var(--text3)]">{subtitle}</p>}
        </div>
        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent3)] opacity-60 transition-opacity group-hover:opacity-100" />
      </div>
      {children}
    </section>
  )
}

function StatPill({ label, value, color, helper }: { label: string; value: string | number; color?: string; helper?: string }) {
  return (
    <div className="group relative min-w-[140px] flex-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.025)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border2)] hover:bg-[rgba(255,255,255,0.04)]">
      <div className="absolute inset-x-0 top-0 h-px opacity-80" style={{ background: color || 'var(--accent)' }} />
      <div className="text-[0.68rem] font-bold uppercase tracking-[0.11em] text-[var(--text3)]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold leading-none tracking-[-0.03em]" style={{ color: color || 'var(--text)' }}>
        {value}
      </div>
      {helper && <div className="mt-2 text-xs text-[var(--text3)]">{helper}</div>}
    </div>
  )
}

function SignalList({ items, tone, empty }: { items: string[]; tone: 'positive' | 'negative'; empty: string }) {
  if (!items.length) {
    return <p className="text-sm text-[var(--text3)]">{empty}</p>
  }

  const color = tone === 'positive' ? 'var(--green)' : 'var(--yellow)'

  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-black/15 p-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-bold" style={{ background: `${color}18`, color }}>
            {tone === 'positive' ? '+' : '!'}
          </div>
          <span className="text-sm leading-6 text-[var(--text2)]">{item}</span>
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
  const [activeTab, setActiveTab] = useState<'overview' | 'gaps' | 'roadmap'>('overview')

  useEffect(() => {
    const raw = sessionStorage.getItem('placewise_result')
    const r = sessionStorage.getItem('placewise_role')
    const fn = sessionStorage.getItem('placewise_filename')
    if (!raw) {
      router.push('/upload')
      return
    }
    setResult(JSON.parse(raw))
    setRole(r || '')
    setFilename(fn || 'resume.pdf')
  }, [router])

  if (!result) return null

  const { placement_score, extracted, gap_analysis, roadmap, summary, profile } = result
  const score = placement_score?.final_score ?? placement_score?.score ?? placement_score?.probability ?? 0
  const gaps = (gap_analysis?.gaps ?? gap_analysis?.missing_skills ?? []) as string[] | GapItem[]

  const skills: string[] =
    result.skills?.technical ||
    extracted?.skills ||
    extracted?.technical_skills ||
    extracted?.parsed_data?.skills ||
    []
  const projects = result.projects || extracted?.projects || []
  const cgpa = profile?.cgpa || extracted?.cgpa || extracted?.gpa || 'Not Listed'
  const internships = profile?.internship_count ?? extracted?.internship_count ?? extracted?.internships?.length ?? '—'
  const leetcode = extracted?.leetcode_count || extracted?.dsa_problems || result.skills?.dsa_signals?.length || null
  const scoreFactors = result.score_factors || placement_score?.factors || []
  const confidence = result.confidence ?? placement_score?.confidence
  const benchmark = result.benchmark || placement_score?.benchmark
  const strengths = result.strengths || gap_analysis?.strengths || scoreFactors.filter(f => f.impact > 0).map(f => f.name)
  const weaknesses = result.weaknesses || gaps.map(g => typeof g === 'string' ? g : g.skill)
  const recommendations: Recommendation[] = result.recommendations || gap_analysis?.recommendations || weaknesses.slice(0, 4).map(title => ({
    title,
    action: `Make this signal explicit for ${ROLE_LABELS[role] || 'the selected role'}.`,
  }))
  const certifications = result.extractedData?.certifications || []
  const githubPresent = result.extractedData?.github_present ?? profile?.github_present
  const linkedinPresent = result.extractedData?.linkedin_present ?? profile?.linkedin_present
  const scoreGlow =
    score >= 75 ? 'rgba(52,211,153,0.16)' : score >= 50 ? 'rgba(251,191,36,0.13)' : 'rgba(248,113,113,0.12)'
  const readinessItems = [
    { label: 'Skills', value: Math.min(skills.length * 9, 100), color: 'var(--green)' },
    { label: 'Projects', value: Math.min(Number(projects.length || 0) * 28, 100), color: 'var(--yellow)' },
    { label: 'Experience', value: Math.min(Number(internships || 0) * 45, 100), color: 'var(--accent3)' },
    { label: 'DSA signal', value: leetcode ? 70 : 20, color: 'var(--red)' },
    { label: 'Role fit', value: Math.max(20, Math.min(100 - weaknesses.length * 12, 100)), color: 'var(--accent2)' },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'gaps', label: 'Skill Gaps' },
    { id: 'roadmap', label: '4-Week Roadmap' },
  ] as const

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_-12%,rgba(108,99,255,0.16),transparent_34%),linear-gradient(180deg,#0a0a0f_0%,#0d0d14_48%,#09090d_100%)]">
      <nav className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-[var(--border)] bg-[rgba(10,10,15,0.82)] px-4 backdrop-blur-xl sm:px-8">
        <Link href="/" className="text-[1.05rem] font-extrabold tracking-[-0.03em] text-[var(--text)] no-underline">
          place<span className="gradient-text">wise</span>
        </Link>
        <Link href="/upload" className="rounded-lg border border-[var(--border2)] px-3 py-1.5 text-[0.82rem] font-medium text-[var(--text2)] no-underline transition-all duration-200 hover:border-[var(--accent3)] hover:bg-white/[0.03] hover:text-[var(--text)]">
          New Analysis
        </Link>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="fade-in-up fade-in-up-1 mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--text3)]">
              <span className="rounded-full border border-[var(--border)] bg-white/[0.025] px-2.5 py-1">{filename}</span>
              <span className="rounded-full border border-[var(--border)] bg-white/[0.025] px-2.5 py-1">{ROLE_LABELS[role] || role}</span>
            </div>
            <h1 className="text-[clamp(1.8rem,4vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.045em] text-[var(--text)]">
              Placement analysis
            </h1>
          </div>
          <div className="w-fit rounded-full border border-[var(--border)] bg-white/[0.025] px-3 py-1.5 text-xs font-medium text-[var(--text2)]">
            Live resume snapshot
          </div>
        </div>

        <div className="fade-in-up fade-in-up-2 relative mb-5 overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.34)] sm:p-8">
          <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[320px] w-[520px] -translate-x-1/2 rounded-full blur-3xl" style={{ background: scoreGlow }} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%)]" />
          <div className="relative grid items-center gap-8 md:grid-cols-[260px_1fr]">
            <div className="flex justify-center md:justify-start">
              <ScoreRing score={score} size={210} />
            </div>
            <div className="text-center md:text-left">
              <div className="mb-3 inline-flex rounded-full border border-[var(--border2)] bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text3)]">
                Placement score
              </div>
              <h2 className="text-2xl font-semibold leading-tight tracking-[-0.035em] text-[var(--text)] sm:text-3xl">
                {placement_score?.band_label || (score >= 75 ? 'Strong placement readiness' : score >= 50 ? 'Good foundation, clear gaps' : 'Focused improvement needed')}
              </h2>
              {summary && (
                <p className="mx-auto mt-4 max-w-xl text-[0.92rem] leading-7 text-[var(--text2)] md:mx-0">
                  {summary}
                </p>
              )}
              <div className="mt-5 rounded-xl border border-[var(--border)] bg-black/15 p-4 text-[0.82rem] leading-6 text-[var(--text3)]">
                <span className="font-semibold text-[var(--text2)]">Why this score: </span>
                {placement_score?.explanation || 'Estimated placement readiness based on extracted resume signals, role expectations, and historical placement patterns.'}
              </div>
            </div>
          </div>
        </div>

        <div className="fade-in-up fade-in-up-3 mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatPill label="CGPA" value={cgpa} color="var(--accent2)" helper="Academic signal" />
          <StatPill label="Internships" value={internships} color="var(--accent3)" helper="Work exposure" />
          <StatPill label="Skills" value={skills.length} color="var(--green)" helper="Detected tags" />
          <StatPill label="Projects" value={projects.length || '—'} color="var(--yellow)" helper="Portfolio depth" />
        </div>

        <div className="fade-in-up fade-in-up-4 mb-5 grid grid-cols-3 gap-1 rounded-xl border border-[var(--border)] bg-black/20 p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-2 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/[0.09] text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_28px_rgba(0,0,0,0.22)]'
                  : 'text-[var(--text3)] hover:bg-white/[0.035] hover:text-[var(--text2)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="fade-in-up fade-in-up-5">
          {activeTab === 'overview' && (
            <>
              <div className="mb-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <Section title="Why This Score?" subtitle="Positive and negative factors from the extracted resume signals">
                  <ScoreBreakdown factors={scoreFactors} confidence={confidence} />
                </Section>
                <Section title="Readiness Mix" subtitle="A compact view of resume signal coverage">
                  <RadarChart items={readinessItems} />
                </Section>
              </div>

              <Section title="Resume Signals" subtitle="Preview of the structured fields used for scoring">
                <ResumeSignals
                  cgpa={cgpa || 'Not listed'}
                  internships={internships}
                  projectsCount={projects.length || '—'}
                  skillsCount={skills.length}
                  certifications={certifications}
                  githubPresent={githubPresent}
                  linkedinPresent={linkedinPresent}
                />
              </Section>

              <BenchmarkCard benchmark={benchmark} score={score} />

              <div className="my-5 grid gap-5 lg:grid-cols-2">
                <Section title="Strengths" subtitle="Signals currently helping the score">
                  <SignalList items={strengths.slice(0, 5)} tone="positive" empty="No strong signals were extracted yet." />
                </Section>
                <Section title="Missing Signals" subtitle="Role-specific evidence to make clearer">
                  <SignalList items={weaknesses.slice(0, 5)} tone="negative" empty="No major missing signals detected." />
                </Section>
              </div>

              <Section title="Recommended Improvements" subtitle="Specific next actions grounded in the selected role">
                <div className="grid gap-3">
                  {recommendations.slice(0, 5).map((rec, index) => (
                    <div key={`${rec.title}-${index}`} className="rounded-xl border border-[var(--border)] bg-black/15 p-4">
                      <div className="text-sm font-semibold text-[var(--text)]">{rec.title}</div>
                      <p className="mt-1 text-[0.82rem] leading-6 text-[var(--text2)]">{rec.action}</p>
                      {rec.why && <p className="mt-2 text-[0.76rem] text-[var(--text3)]">{rec.why}</p>}
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Technical Skills" subtitle="Extracted from your resume by the parser">
                {skills.length > 0 ? (
                  <div>
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text3)]">Detected skill chips</div>
                    <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span key={`${s}-${i}`} className="skill-tag rounded-full border border-[var(--border)] bg-white/[0.035] px-3 py-1.5 text-[0.82rem] font-medium text-[var(--text2)]">
                        {s}
                      </span>
                    ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text3)]">No skills detected. Try improving your resume&apos;s Skills section.</p>
                )}
              </Section>

              {projects.length > 0 && (
                <Section title="Projects Found" subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''} detected`}>
                  <div className="grid gap-3">
                    {projects.map((p, i) => {
                      const tech = typeof p !== 'string' ? p.tech_used || p.tech : null
                      return (
                      <div key={i} className="rounded-xl border border-[var(--border)] bg-black/15 p-4 transition-all duration-200 hover:border-[var(--border2)] hover:bg-white/[0.025]">
                        <div className="text-sm font-semibold text-[var(--text)]">
                          {typeof p === 'string' ? p : p.name || p.title || `Project ${i + 1}`}
                        </div>
                        {typeof p !== 'string' && (p.description || tech) && (
                          <div className="mt-1 text-[0.8rem] leading-5 text-[var(--text3)]">
                            {p.description || ''}{tech ? ` · ${Array.isArray(tech) ? tech.join(', ') : tech}` : ''}
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                </Section>
              )}

              
            </>
          )}

          {activeTab === 'gaps' && (
            <Section title="Skill Gaps" subtitle={`What separates you from ${ROLE_LABELS[role] || 'your target role'}`}>
              <SkillGapCard gaps={gaps || []} role={role} />
            </Section>
          )}

          {activeTab === 'roadmap' && (
            <Section title="Your 4-Week Roadmap" subtitle="Personalised action plan to close your gaps">
              <RoadmapTimeline roadmap={roadmap} />
            </Section>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-white/[0.025] p-6 text-center">
          <p className="mb-4 text-[0.88rem] text-[var(--text2)]">
            Improved your resume? Re-analyse to track your progress.
          </p>
          <Link href="/upload" className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white no-underline shadow-[0_14px_34px_rgba(108,99,255,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#7b74ff]">
            Analyse Again
          </Link>
        </div>
      </main>
    </div>
  )
}
