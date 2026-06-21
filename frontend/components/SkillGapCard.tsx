'use client'

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
  critical: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', label: 'Critical', icon: '!' },
  high: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', label: 'High', icon: '^' },
  medium: { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', label: 'Medium', icon: '-' },
  low: { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', label: 'Low', icon: '-' },
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
      <div className="rounded-xl border border-[rgba(52,211,153,0.22)] bg-[rgba(52,211,153,0.055)] p-6 text-center">
        <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(52,211,153,0.25)] bg-[rgba(52,211,153,0.08)] text-sm font-bold text-[#34d399]">✓</div>
        <div className="font-semibold text-[#34d399]">No significant gaps found</div>
        <div className="mt-1 text-[0.82rem] text-[var(--text3)]">
          Your profile looks strong for this role.
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
    <div className="grid gap-3">
      {order.map(level => {
        const items = grouped[level]
        if (!items?.length) return null
        const config = importanceConfig[level as keyof typeof importanceConfig]
        return (
          <div
            key={level}
            className="rounded-xl border bg-black/10 p-4 transition-all duration-200 hover:bg-white/[0.025]"
            style={{ borderColor: `${config.color}32` }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-bold"
                  style={{ background: config.bg, border: `1px solid ${config.color}40`, color: config.color }}
                >
                  {config.icon}
                </div>
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em]" style={{ color: config.color }}>
                  {config.label}
                </span>
              </div>
              <span className="rounded-full border border-[var(--border)] bg-white/[0.025] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--text3)]">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((gap, i) => (
                <div
                  key={i}
                  className="rounded-full px-3 py-1.5 text-[0.82rem] font-medium leading-5"
                  style={{
                    background: config.bg,
                    border: `1px solid ${config.color}30`,
                    color: config.color,
                  }}
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
