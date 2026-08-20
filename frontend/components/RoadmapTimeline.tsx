'use client'

import { useState } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { FaCheck, FaPlay, FaLink, FaGithub, FaGraduationCap } from 'react-icons/fa'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

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
  youtube:  { icon: <FaPlay />, colorClass: 'bg-rose-300' },
  website:  { icon: <FaLink />, colorClass: 'bg-cyan-300' },
  github:   { icon: <FaGithub />, colorClass: 'bg-zinc-300' },
  course:   { icon: <FaGraduationCap />, colorClass: 'bg-lime-300' },
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
      className={`group inline-flex items-center gap-3 rounded-xl border-2 border-zinc-950 p-2 pr-4 transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_#18181b] bg-white`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-zinc-950 text-xs shadow-[2px_2px_0px_#18181b] ${cfg.colorClass} text-zinc-950`}>
        {cfg.icon}
      </span>
      <span className="text-sm font-bold text-zinc-950">{r.name}</span>
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
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">

      {/* 1. Executive Intelligence */}
      {(meta.summary || meta.biggest_bottleneck || meta.honest_verdict) && (
        <div className="flex flex-col gap-4 rounded-3xl border-2 border-zinc-950 bg-indigo-50 p-6 shadow-[8px_8px_0px_#18181b] sm:p-8">
          {meta.honest_verdict && (
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-zinc-950 bg-indigo-300 text-sm shadow-[2px_2px_0px_#18181b]">⚡</span>
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-700">Recruiter Verdict</div>
                <p className={`${jakarta.className} text-lg font-black text-zinc-950`}>{meta.honest_verdict}</p>
              </div>
            </div>
          )}
          {meta.biggest_bottleneck && (
            <div className="mt-4 flex items-start gap-4 rounded-2xl border-2 border-zinc-950 bg-rose-200 p-5 shadow-[4px_4px_0px_#18181b]">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-zinc-950 bg-rose-400 text-sm shadow-[2px_2px_0px_#18181b]">⚠</span>
              <div>
                <div className="mb-1 text-xs font-black uppercase tracking-widest text-rose-800">Critical Bottleneck</div>
                <p className="text-sm font-bold text-zinc-950">{meta.biggest_bottleneck}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Benchmark */}
      {rb && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-zinc-950 bg-lime-100 p-6 shadow-[4px_4px_0px_#18181b]">
            <div className="mb-4 text-xs font-black uppercase tracking-widest text-lime-800">Top Candidates Have</div>
            <div className="flex flex-col gap-3">
              {rb.what_top_candidates_have.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm font-bold text-zinc-950">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-zinc-950 bg-lime-400 text-[10px] text-zinc-950">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border-2 border-zinc-950 bg-rose-100 p-6 shadow-[4px_4px_0px_#18181b]">
            <div className="mb-4 text-xs font-black uppercase tracking-widest text-rose-800">Missing From Yours</div>
            <div className="flex flex-col gap-3">
              {rb.missing_from_resume.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm font-bold text-zinc-950">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-zinc-950 bg-rose-400 text-[10px] text-zinc-950">✕</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. The Interactive Dashboard */}
      <div className="mt-4 overflow-hidden rounded-3xl border-2 border-zinc-950 bg-white shadow-[12px_12px_0px_#18181b]">
        
        {/* Progress Bar */}
        <div className="h-3 w-full border-b-2 border-zinc-950 bg-zinc-100">
          <div className="h-full border-r-2 border-zinc-950 bg-lime-400 transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Week Selector Tabs */}
        <div className="flex gap-3 overflow-x-auto border-b-2 border-zinc-950 bg-[#fbfbf7] p-5 hide-scrollbar">
          {weeks.map((w, i) => (
            <button
              key={i}
              onClick={() => { setActiveWeek(i); setActiveDay(0) }}
              className={`flex shrink-0 flex-col items-start justify-center rounded-xl border-2 px-5 py-3 transition-all duration-200 ${
                activeWeek === i
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-[4px_4px_0px_#a3e635] -translate-y-1'
                  : 'border-zinc-300 bg-white hover:border-zinc-950 hover:bg-zinc-50'
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeWeek === i ? 'text-lime-300' : 'text-zinc-500'}`}>Week {w.week}</span>
              <span className={`mt-1 max-w-[140px] truncate text-sm font-black ${activeWeek === i ? 'text-white' : 'text-zinc-950'}`}>
                {w.focus || w.theme || w.title || `Phase ${w.week}`}
              </span>
            </button>
          ))}
        </div>

        {currentWeek && (
          <div className="p-6 sm:p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b-2 border-zinc-100 pb-6">
              <div>
                <h3 className={`${jakarta.className} text-3xl font-black text-zinc-950`}>{currentWeek.focus || currentWeek.theme || currentWeek.title}</h3>
                {currentWeek.goal && <p className="mt-2 text-sm font-bold text-zinc-600">Goal: {currentWeek.goal}</p>}
              </div>
              
              <button 
                onClick={() => copyToNotion(currentWeek)}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-zinc-950 bg-white px-5 py-3 text-xs font-black text-zinc-950 shadow-[4px_4px_0px_#18181b] transition-all hover:-translate-y-1"
              >
                {copied ? <span className="text-lime-600">✓ Copied!</span> : <>📋 Export to Notion</>}
              </button>
            </div>

            {hasDays ? (
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex flex-row gap-3 overflow-x-auto md:min-w-[140px] md:flex-col md:overflow-visible hide-scrollbar">
                  {currentWeek.days!.map((d, di) => (
                    <button
                      key={di}
                      onClick={() => setActiveDay(di)}
                      className={`shrink-0 rounded-xl border-2 px-5 py-3 text-left text-sm font-black transition-all ${
                        activeDay === di 
                          ? 'border-zinc-950 bg-lime-300 shadow-[4px_4px_0px_#18181b] translate-x-2' 
                          : 'border-transparent bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      {DAY_SHORT[d.day] || d.day}
                    </button>
                  ))}
                </div>

                {/* INTERACTIVE TASKS */}
                <div className="flex-1">
                  <div className="flex flex-col gap-4">
                    {(currentWeek.days![activeDay]?.tasks || []).map((task, ti) => {
                      const taskId = `w${activeWeek}-d${activeDay}-t${ti}`
                      const isDone = completedTasks[taskId]
                      return (
                        <div 
                          key={taskId} 
                          onClick={() => toggleTask(taskId)}
                          className={`group flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-zinc-950 p-5 transition-all duration-200 ${
                            isDone ? 'bg-zinc-100 shadow-none' : 'bg-white shadow-[4px_4px_0px_#18181b] hover:-translate-y-1'
                          }`}
                        >
                          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-zinc-950 transition-colors ${
                            isDone ? 'bg-lime-400' : 'bg-white'
                          }`}>
                            {isDone && <FaCheck className="text-zinc-950 text-sm" />}
                          </div>
                          <span className={`text-sm font-bold leading-relaxed transition-colors ${
                            isDone ? 'text-zinc-400 line-through' : 'text-zinc-950'
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
              <div className="flex flex-col gap-4">
                {(currentWeek.tasks || []).map((task, ti) => {
                  const taskText = typeof task === 'string' ? task : (task as { task: string }).task
                  const taskId = `w${activeWeek}-t${ti}`
                  const isDone = completedTasks[taskId]
                  return (
                    <div 
                      key={taskId} 
                      onClick={() => toggleTask(taskId)}
                      className={`group flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-zinc-950 p-5 transition-all duration-200 ${
                        isDone ? 'bg-zinc-100 shadow-none' : 'bg-white shadow-[4px_4px_0px_#18181b] hover:-translate-y-1'
                      }`}
                    >
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-zinc-950 transition-colors ${
                        isDone ? 'bg-lime-400' : 'bg-white'
                      }`}>
                        {isDone && <FaCheck className="text-zinc-950 text-sm" />}
                      </div>
                      <span className={`text-sm font-bold leading-relaxed transition-colors ${
                        isDone ? 'text-zinc-400 line-through' : 'text-zinc-950'
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
      <div className="mt-4 rounded-3xl border-2 border-zinc-950 bg-white p-8 shadow-[8px_8px_0px_#18181b]">
        <div className="mb-6 flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-zinc-950 bg-rose-300 text-zinc-950 shadow-[2px_2px_0px_#18181b]">
            <FaPlay />
          </span>
          <h3 className={`${jakarta.className} text-2xl font-black text-zinc-950`}>Curated Video Masterclasses</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          {CURATED_VIDEOS.map((video, i) => <ResourceChip key={i} r={video} />)}
          {meta.top_resources?.map((r, i) => <ResourceChip key={`backend-${i}`} r={r} />)}
        </div>
      </div>

    </div>
  )
}