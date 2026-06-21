'use client'

import { useState, useEffect } from 'react'

// ... [Keep all your existing Interfaces: Resource, DayPlan, Week, etc.] ...
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

interface RoadmapData {
  summary?: string
  honest_verdict?: string
  biggest_bottleneck?: string
  resume_benchmark?: { what_top_candidates_have: string[]; missing_from_resume: string[] }
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
  youtube:  { icon: '▶', color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
  website:  { icon: '🔗', color: '#22D3EE', bg: 'rgba(34,211,238,0.1)' },
  github:   { icon: '◈', color: '#E4E4E7', bg: 'rgba(228,228,231,0.1)' },
  course:   { icon: '🎓', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
}

const CURATED_VIDEOS: Resource[] = [
  { name: 'NeetCode DSA Roadmap (150 Questions)', url: 'https://neetcode.io/roadmap', type: 'youtube', why: 'The absolute best resource for clearing technical coding rounds.' },
  { name: 'ByteByteGo System Design Crash Course', url: 'https://youtu.be/i53Gi_Y3Ocg', type: 'youtube', why: 'Crucial for SDE-1 and SDE-2 product company interviews.' },
  { name: 'React & Frontend Masterclass', url: 'https://youtu.be/SqcY0GlETPk', type: 'youtube', why: 'Build the practical skills needed for machine coding rounds.' },
  { name: 'REST API & Backend Concepts', url: 'https://youtu.be/-MTSQjw5DrM', type: 'youtube', why: 'Core fundamentals expected in every backend interview.' },
  { name: 'The Google Resume XYZ Formula', url: 'https://youtu.be/BYUy1yvjH0k', type: 'youtube', why: 'How to write bullet points that actually pass the ATS screen.' },
]

function ResourceChip({ r }: { r: Resource }) {
  const cfg = resourceTypeConfig[r.type] || resourceTypeConfig.website
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      title={r.why}
      className="group inline-flex items-center gap-2 rounded-xl border border-white/5 pr-4 pl-3 py-2 text-xs font-semibold transition-all hover:scale-105 shadow-sm"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-black/20 text-[10px]">{cfg.icon}</span>
      <span className="text-white/90 group-hover:text-white">{r.name}</span>
      <span className="ml-1 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
    </a>
  )
}

function normalizeRoadmap(raw: unknown): { weeks: Week[]; meta: RoadmapData } {
  if (!raw || typeof raw !== 'object') return { weeks: [], meta: {} }
  const r = raw as RoadmapData
  if (Array.isArray(raw)) return { weeks: raw as Week[], meta: {} }
  if ('weeks' in r && Array.isArray(r.weeks)) return { weeks: r.weeks, meta: r }
  if ('roadmap' in r && Array.isArray((r as Record<string, unknown>).roadmap)) return { weeks: (r as Record<string, unknown>).roadmap as Week[], meta: r }
  return { weeks: [], meta: r }
}

export default function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  const { weeks, meta } = normalizeRoadmap(roadmap)
  const [activeWeek, setActiveWeek] = useState(0)
  const [activeDay, setActiveDay] = useState(0)
  const [copied, setCopied] = useState(false)
  
  // Interactive Task Tracking State
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const copyToNotion = (week: Week) => {
    let markdown = `# 🎯 ${week.title || week.focus || `Week ${week.week} Plan`}\n\n`
    if (week.goal) markdown += `**Goal:** ${week.goal}\n\n`
    
    if (week.days && week.days.length > 0) {
      week.days.forEach(d => {
        markdown += `### ${d.day}\n`
        d.tasks.forEach(t => { markdown += `- [ ] ${t}\n` })
        markdown += '\n'
      })
    } else if (week.tasks) {
      week.tasks.forEach(t => { markdown += `- [ ] ${typeof t === 'string' ? t : (t as any).task}\n` })
    }

    navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!weeks.length) return null

  const rb = meta.resume_benchmark
  const currentWeek = weeks[activeWeek]
  const hasDays = currentWeek?.days && currentWeek.days.length > 0
  const progressPercent = Math.round(((activeWeek + 1) / weeks.length) * 100)

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* 1. Executive Intelligence */}
      {(meta.summary || meta.biggest_bottleneck || meta.honest_verdict) && (
        <div className="flex flex-col gap-4 rounded-[2rem] border border-[#10B981]/10 bg-[#10B981]/5 p-6 backdrop-blur-xl sm:p-8">
          {meta.honest_verdict && (
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20 text-xs text-[#10B981]">⚡</span>
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#10B981]">Recruiter Verdict</div>
                <p className="text-base font-medium leading-relaxed text-white/90">{meta.honest_verdict}</p>
              </div>
            </div>
          )}
          {meta.biggest_bottleneck && (
            <div className="mt-2 flex items-start gap-3 rounded-2xl border border-rose-500/10 bg-rose-500/5 p-4">
              <span className="mt-0.5 text-rose-400">⚠</span>
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-rose-400">Critical Bottleneck</div>
                <p className="text-sm leading-relaxed text-zinc-300">{meta.biggest_bottleneck}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Benchmark */}
      {rb && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[2rem] border border-[#10B981]/10 bg-[#111827]/40 p-6 backdrop-blur-xl">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#10B981]">Top Candidates Have</div>
            <div className="flex flex-col gap-3">
              {rb.what_top_candidates_have.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20 text-[8px] text-[#10B981]">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-rose-500/10 bg-[#111827]/40 p-6 backdrop-blur-xl">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-rose-400">Missing From Yours</div>
            <div className="flex flex-col gap-3">
              {rb.missing_from_resume.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-[8px] text-rose-400">✕</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. The Interactive Dashboard */}
      <div className="relative mt-4 overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#111827]/60 shadow-2xl backdrop-blur-3xl">
        
        {/* Glowing Progress Bar */}
        <div className="absolute left-0 top-0 h-1 w-full bg-white/5">
          <div className="h-full bg-gradient-to-r from-[#22D3EE] to-[#10B981] transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Week Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-white/5 p-4 pt-6 sm:p-6 sm:pt-8 hide-scrollbar">
          {weeks.map((w, i) => (
            <button
              key={i}
              onClick={() => { setActiveWeek(i); setActiveDay(0) }}
              className={`flex shrink-0 flex-col items-start justify-center rounded-2xl border px-5 py-3 transition-all duration-300 ${
                activeWeek === i
                  ? 'border-[#10B981] bg-[#10B981]/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-widest ${activeWeek === i ? 'text-[#10B981]' : 'text-zinc-500'}`}>Week {w.week}</span>
              <span className={`mt-1 max-w-[140px] truncate text-sm font-bold ${activeWeek === i ? 'text-white' : 'text-zinc-300'}`}>
                {w.focus || w.theme || w.title || `Phase ${w.week}`}
              </span>
            </button>
          ))}
        </div>

        {currentWeek && (
          <div className="p-6 sm:p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-extrabold text-white">{currentWeek.focus || currentWeek.theme || currentWeek.title}</h3>
                {currentWeek.goal && <p className="mt-2 text-sm font-medium text-zinc-400">Goal: {currentWeek.goal}</p>}
              </div>
              
              {/* Export to Notion Feature */}
              <button 
                onClick={() => copyToNotion(currentWeek)}
                className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
              >
                {copied ? <span className="text-[#10B981]">✓ Copied to Clipboard</span> : <><span>📋</span> Export to Notion</>}
              </button>
            </div>

            {hasDays ? (
              <div className="flex flex-col gap-6 md:flex-row md:gap-10">
                <div className="flex flex-row gap-2 overflow-x-auto md:min-w-[120px] md:flex-col md:overflow-visible hide-scrollbar">
                  {currentWeek.days!.map((d, di) => (
                    <button
                      key={di}
                      onClick={() => setActiveDay(di)}
                      className={`shrink-0 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
                        activeDay === di ? 'bg-white text-[#09090B] shadow-md' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {DAY_SHORT[d.day] || d.day}
                    </button>
                  ))}
                </div>

                {/* INTERACTIVE TASKS */}
                <div className="flex-1">
                  <div className="flex flex-col gap-3">
                    {(currentWeek.days![activeDay]?.tasks || []).map((task, ti) => {
                      const taskId = `w${activeWeek}-d${activeDay}-t${ti}`
                      const isDone = completedTasks[taskId]
                      return (
                        <div 
                          key={taskId} 
                          onClick={() => toggleTask(taskId)}
                          className={`group flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all duration-300 ${
                            isDone ? 'border-[#10B981]/30 bg-[#10B981]/5' : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isDone ? 'border-[#10B981] bg-[#10B981] text-[#09090B]' : 'border-zinc-600 bg-transparent'
                          }`}>
                            {isDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <span className={`text-sm font-medium leading-relaxed transition-colors ${
                            isDone ? 'text-zinc-500 line-through' : 'text-zinc-200'
                          }`}>
                            {task}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
               /* INTERACTIVE TASKS (No Days structure) */
              <div className="flex flex-col gap-3">
                {(currentWeek.tasks || []).map((task, ti) => {
                  const taskText = typeof task === 'string' ? task : (task as { task: string }).task
                  const taskId = `w${activeWeek}-t${ti}`
                  const isDone = completedTasks[taskId]
                  return (
                    <div 
                      key={taskId} 
                      onClick={() => toggleTask(taskId)}
                      className={`group flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all duration-300 ${
                        isDone ? 'border-[#10B981]/30 bg-[#10B981]/5' : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isDone ? 'border-[#10B981] bg-[#10B981] text-[#09090B]' : 'border-zinc-600 bg-transparent'
                      }`}>
                        {isDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span className={`text-sm font-medium leading-relaxed transition-colors ${
                        isDone ? 'text-zinc-500 line-through' : 'text-zinc-200'
                      }`}>
                        {taskText}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Curated Masterclass Videos */}
      <div className="mt-4 rounded-[2.5rem] border border-white/5 bg-[#111827]/40 p-8 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F43F5E]/20 text-[#F43F5E]">▶</span>
          <h3 className="text-lg font-bold text-white">Curated Video Masterclasses</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {CURATED_VIDEOS.map((video, i) => <ResourceChip key={i} r={video} />)}
          {meta.top_resources?.map((r, i) => <ResourceChip key={`backend-${i}`} r={r} />)}
        </div>
      </div>

    </div>
  )
}
