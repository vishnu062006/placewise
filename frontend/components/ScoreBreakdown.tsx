'use client'

export type ScoreFactor = {
  name: string
  impact: number
  type?: 'positive' | 'negative' | string
  evidence?: string
}

export default function ScoreBreakdown({ factors = [], confidence }: { factors?: ScoreFactor[]; confidence?: number }) {
  const visibleFactors = factors.slice(0, 7)

  if (!visibleFactors.length) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-black/15 p-4 text-sm text-[var(--text3)]">
        Score factors will appear when the backend returns explainability data.
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {typeof confidence === 'number' && (
        <div className="rounded-xl border border-[var(--border)] bg-black/15 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.11em] text-[var(--text3)]">
            <span>Confidence</span>
            <span>{confidence}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-[var(--accent3)] transition-all duration-700" style={{ width: `${Math.min(confidence, 100)}%` }} />
          </div>
          <p className="mt-3 text-[0.78rem] leading-5 text-[var(--text3)]">
            Confidence reflects how many resume signals were extractable and whether model scoring was available.
          </p>
        </div>
      )}

      {visibleFactors.map((factor, index) => {
        const positive = factor.impact >= 0 || factor.type === 'positive'
        const color = positive ? 'var(--green)' : 'var(--red)'
        const width = `${Math.min(Math.abs(factor.impact) * 5, 100)}%`

        return (
          <div key={`${factor.name}-${index}`} className="rounded-xl border border-[var(--border)] bg-white/[0.025] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-[var(--text)]">{factor.name}</div>
                {factor.evidence && <div className="mt-1 text-[0.78rem] leading-5 text-[var(--text3)]">{factor.evidence}</div>}
              </div>
              <div className="shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold" style={{ borderColor: `${color}55`, color }}>
                {factor.impact > 0 ? '+' : ''}{factor.impact}
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
              <div className="h-full rounded-full" style={{ width, background: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
