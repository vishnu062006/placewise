'use client'

type Benchmark = {
  role_average?: number
  candidate_score?: number
  percentile?: number
  label?: string
  explanation?: string
}

export default function BenchmarkCard({ benchmark, score }: { benchmark?: Benchmark; score: number }) {
  const roleAverage = benchmark?.role_average ?? 62
  const percentile = benchmark?.percentile ?? Math.max(10, Math.min(95, Math.round(50 + (score - roleAverage) * 1.2)))
  const label = benchmark?.label ?? (score >= roleAverage ? 'Above benchmark' : 'Below benchmark')

  return (
    <div className="rounded-xl border border-[var(--border)] bg-black/15 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-[var(--text)]">Industry Benchmark</div>
          <p className="mt-1 text-[0.8rem] leading-5 text-[var(--text3)]">
            {benchmark?.explanation || 'Compared against historical placement-readiness patterns for the selected role.'}
          </p>
        </div>
        <span className="rounded-full border border-[var(--border2)] bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-[var(--text2)]">
          {label}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Your score" value={score} color="var(--accent3)" />
        <Metric label="Role average" value={roleAverage} color="var(--yellow)" />
        <Metric label="Percentile" value={`${percentile}th`} color="var(--green)" />
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent3),var(--green))]" style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <div className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--text3)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-[-0.04em]" style={{ color }}>{value}</div>
    </div>
  )
}
