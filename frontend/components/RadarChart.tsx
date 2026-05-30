'use client'

type RadarChartProps = {
  items: { label: string; value: number; color?: string }[]
}

export default function RadarChart({ items }: RadarChartProps) {
  return (
    <div className="grid gap-3">
      {items.map(item => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-[var(--text2)]">{item.label}</span>
            <span className="text-[var(--text3)]">{item.value}/100</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(Math.max(item.value, 0), 100)}%`, background: item.color || 'var(--accent3)' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
