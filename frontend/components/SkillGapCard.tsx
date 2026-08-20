'use client'

import { Plus_Jakarta_Sans } from 'next/font/google'
import { FaExclamation, FaArrowUp, FaMinus } from 'react-icons/fa'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

interface Gap {
  skill: string
  importance: 'critical' | 'high' | 'medium' | 'low'
  reason?: string
}

interface SkillGapCardProps {
  gaps: Gap[] | string[]
  role: string
}

const importanceConfig = {
  critical: { bgClass: 'bg-rose-300', textClass: 'text-zinc-950', label: 'Critical', icon: <FaExclamation /> },
  high: { bgClass: 'bg-amber-300', textClass: 'text-zinc-950', label: 'High', icon: <FaArrowUp /> },
  medium: { bgClass: 'bg-indigo-300', textClass: 'text-zinc-950', label: 'Medium', icon: <FaMinus /> },
  low: { bgClass: 'bg-zinc-200', textClass: 'text-zinc-950', label: 'Low', icon: <FaMinus /> },
}

function normalizeGaps(gaps: Gap[] | string[]): Gap[] {
  if (!gaps || gaps.length === 0) return []
  if (typeof gaps[0] === 'string') {
    return (gaps as string[]).map((g, i) => ({
      skill: g,
      importance: i === 0 ? 'critical' : i < 3 ? 'high' : 'medium'
    }))
  }
  return gaps as Gap[]
}

export default function SkillGapCard({ gaps }: SkillGapCardProps) {
  const normalized = normalizeGaps(gaps)

  if (normalized.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-zinc-950 bg-lime-300 p-8 text-center shadow-[4px_4px_0px_#18181b]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-zinc-950 bg-white text-xl font-black text-zinc-950 shadow-[2px_2px_0px_#18181b]">
          ✓
        </div>
        <div className={`${jakarta.className} text-xl font-black text-zinc-950`}>No significant gaps found</div>
        <div className="mt-2 text-sm font-bold text-zinc-800">
          Your profile looks highly optimized for this role.
        </div>
      </div>
    )
  }

  const grouped = normalized.reduce((acc, gap) => {
    const imp = gap.importance || 'medium'
    if (!acc[imp]) acc[imp] = []
    acc[imp].push(gap)
    return acc
  }, {} as Record<string, Gap[]>)

  const order = ['critical', 'high', 'medium', 'low']

  return (
    <div className="grid gap-6">
      {order.map(level => {
        const items = grouped[level]
        if (!items?.length) return null
        const config = importanceConfig[level as keyof typeof importanceConfig]
        
        return (
          <div
            key={level}
            className={`rounded-2xl border-2 border-zinc-950 bg-white p-5 shadow-[4px_4px_0px_#18181b] transition-transform hover:-translate-y-1`}
          >
            <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-zinc-950 pb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 border-zinc-950 text-xs shadow-[2px_2px_0px_#18181b] ${config.bgClass} ${config.textClass}`}>
                  {config.icon}
                </div>
                <span className={`${jakarta.className} text-base font-black uppercase tracking-widest text-zinc-950`}>
                  {config.label} Priority
                </span>
              </div>
              <span className="rounded-full border-2 border-zinc-950 bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-950">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {items.map((gap, i) => (
                <div
                  key={i}
                  className={`inline-flex items-center rounded-xl border-2 border-zinc-950 px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#18181b] ${config.bgClass} ${config.textClass}`}
                  title={gap.reason || ''}
                >
                  {gap.skill}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}