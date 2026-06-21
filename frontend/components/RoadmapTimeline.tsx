'use client'

import { useState } from 'react'

interface Resource {
  name: string
  url: string
  type: 'youtube' | 'website' | 'github' | 'course'
  why?: string
}

interface DayPlan {
  day: string
  tasks: string[]
}

interface Week {
  week: number
  focus?: string
  theme?: string
  title?: string
  days?: DayPlan[]
  tasks?: string[]
  goal?: string
  resources?: Resource[]
}

interface PlacementProbability {
  current: number
  after_roadmap: number
  estimated_readiness_weeks: number
}

interface ResumeBenchmark {
  what_top_candidates_have: string[]
  missing_from_resume: string[]
}

interface RoadmapData {
  summary?: string
  honest_verdict?: string
  score_explanation?: string
  biggest_bottleneck?: string
  placement_probability?: PlacementProbability
  resume_benchmark?: ResumeBenchmark
  resume_fixes?: string[]
  weeks?: Week[]
  top_resources?: Resource[]
}

interface RoadmapTimelineProps {
  roadmap?: unknown
}

const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun'
}

const resourceTypeConfig = {
  youtube:  { icon: '▶', color: '#ff4444' },
  website:  { icon: '🔗', color: '#6c63ff' },
  github:   { icon: '◈', color: '#e8e8f0' },
  course:   { icon: '🎓', color: '#34d399' },
}

function ResourceChip({ r }: { r: Resource }) {
  const cfg = resourceTypeConfig[r.type] || resourceTypeConfig.website
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      title={r.why}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/55 transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white no-underline"
    >
      <span style={{ color: cfg.color, fontSize: '10px' }}>{cfg.icon}</span>
      <span>{r.name}</span>
      <span className="text-white/20">↗</span>
    </a>
  )
}

function normalizeRoadmap(raw: unknown): { weeks: Week[]; meta: RoadmapData } {
  if (!raw || typeof raw !== 'object') return { weeks: [], meta: {} }
  const r = raw as RoadmapData
  if (Array.isArray(raw)) return { weeks: raw as Week[], meta: {} }
  if ('weeks' in r && Array.isArray(r.weeks)) return { weeks: r.weeks, meta: r }
  if ('roadmap' in r && Array.isArray((r as Record<string, unknown>).roadmap))
    return { weeks: (r as Record<string, unknown>).roadmap as Week[], meta: r }
  return { weeks: [], meta: r }
}

export default function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  const { weeks, meta } = normalizeRoadmap(roadmap)
  const [activeWeek, setActiveWeek] = useState(0)
  const [activeDay, setActiveDay] = useState(0)

  if (!weeks.length) {
    return <div className="flex justify-center p-8 text-sm text-white/30">No roadmap data available.</div>
  }

  const pp = meta.placement_probability
  const rb = meta.resume_benchmark
  const currentWeek = weeks[activeWeek]
  const hasDays = currentWeek?.days && currentWeek.days.length > 0

  return (
    <div className="flex flex-col gap-5">

      

      {/* Summary + bottleneck */}
      {(meta.summary || meta.biggest_bottleneck || meta.honest_verdict) && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-3">
          {meta.summary && (
            <p className="text-sm leading-relaxed text-white/65">{meta.summary}</p>
          )}
          {meta.biggest_bottleneck && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/8 p-3">
              <span className="shrink-0 text-red-400 text-sm">⚠</span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-1">Biggest Bottleneck</div>
                <p className="text-sm text-red-300/80 leading-relaxed">{meta.biggest_bottleneck}</p>
              </div>
            </div>
          )}
          {meta.honest_verdict && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/8 p-3">
              <span className="shrink-0 text-base">⚡</span>
              <p className="text-sm font-medium text-amber-300/90 leading-relaxed">{meta.honest_verdict}</p>
            </div>
          )}
        </div>
      )}

      {/* Resume benchmark */}
      {rb && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-3">Top Candidates Have</div>
            <div className="flex flex-col gap-2">
              {rb.what_top_candidates_have.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                  <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-3">Missing From Yours</div>
            <div className="flex flex-col gap-2">
              {rb.missing_from_resume.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                  <span className="text-red-400 shrink-0 mt-0.5">✗</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Week selector */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {weeks.map((w, i) => (
          <button
            key={i}
            onClick={() => { setActiveWeek(i); setActiveDay(0) }}
            className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
              activeWeek === i
                ? 'border-[var(--accent)]/50 bg-[var(--accent)]/15 text-[var(--accent)]'
                : 'border-white/[0.07] bg-white/[0.02] text-white/40 hover:border-white/15 hover:text-white/70'
            }`}
          >
            <div className="text-xs opacity-70">Week {w.week}</div>
            <div className="mt-0.5 truncate max-w-[120px]">{w.focus || w.theme || w.title || `Week ${w.week}`}</div>
          </button>
        ))}
      </div>

      {/* Week content */}
      {currentWeek && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          {/* Week header */}
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <div className="text-base font-bold text-white">{currentWeek.focus || currentWeek.theme || currentWeek.title}</div>
            {currentWeek.goal && (
              <div className="mt-1 text-xs text-white/35">Goal: {currentWeek.goal}</div>
            )}
          </div>

          {hasDays ? (
            <>
              {/* Day tabs */}
              <div className="flex overflow-x-auto border-b border-white/[0.06]" style={{ scrollbarWidth: 'none' }}>
                {currentWeek.days!.map((d, di) => (
                  <button
                    key={di}
                    onClick={() => setActiveDay(di)}
                    className={`shrink-0 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 ${
                      activeDay === di
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5'
                        : 'border-transparent text-white/35 hover:text-white/60'
                    }`}
                  >
                    {DAY_SHORT[d.day] || d.day}
                  </button>
                ))}
              </div>

              {/* Day tasks */}
              <div className="p-4">
                <div className="mb-3 text-xs font-bold text-white/30 uppercase tracking-widest">
                  {currentWeek.days![activeDay]?.day}
                </div>
                <div className="flex flex-col gap-2">
                  {(currentWeek.days![activeDay]?.tasks || []).map((task, ti) => (
                    <div key={ti} className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5 transition-all hover:border-white/[0.1]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                        {ti + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-white/70">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Fallback: weekly tasks without days */
            <div className="p-4 flex flex-col gap-2">
              {(currentWeek.tasks || []).map((task, ti) => (
                <div key={ti} className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold">
                    {ti + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-white/70">{typeof task === 'string' ? task : (task as { task: string }).task}</span>
                </div>
              ))}
            </div>
          )}

          {/* Week resources */}
          {currentWeek.resources && currentWeek.resources.length > 0 && (
            <div className="px-4 pb-4 flex flex-wrap gap-2 border-t border-white/[0.05] pt-3">
              {currentWeek.resources.map((r, ri) => <ResourceChip key={ri} r={r} />)}
            </div>
          )}
        </div>
      )}

      {/* Resume fixes */}
      {meta.resume_fixes && meta.resume_fixes.length > 0 && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/30">Resume Fixes</div>
          <div className="flex flex-col gap-2">
            {meta.resume_fixes.map((fix, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-white/60">
                <span className="mt-0.5 shrink-0 text-[var(--accent)] opacity-50">✦</span>
                {fix}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All resources */}
      {meta.top_resources && meta.top_resources.length > 0 && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/30">Resources</div>
          <div className="flex flex-wrap gap-2">
            {meta.top_resources.map((r, i) => <ResourceChip key={i} r={r} />)}
          </div>
        </div>
      )}

    </div>
  )
}