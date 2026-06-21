'use client'

type RadarChartProps = {
  items: { label: string; value: number; color?: string }[]
}

export default function RadarChart({ items }: RadarChartProps) {
  if (!items || items.length < 3) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-white/30">
        Not enough data for radar chart
      </div>
    )
  }

  const size = 300
  const center = size / 2
  const radius = 100
  const angleStep = (Math.PI * 2) / items.length

  const getPoint = (value: number, index: number) => {
    const r = (value / 100) * radius
    const angle = index * angleStep - Math.PI / 2
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    }
  }

  const polygonPoints = items.map((item, i) => {
    const p = getPoint(item.value, i)
    return `${p.x},${p.y}`
  }).join(' ')

  const backgroundPolygons = [20, 40, 60, 80, 100].map(level => {
    return items.map((_, i) => {
      const r = (level / 100) * radius
      const angle = i * angleStep - Math.PI / 2
      const x = center + r * Math.cos(angle)
      const y = center + r * Math.sin(angle)
      return `${x},${y}`
    }).join(' ')
  })

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[340px] items-center justify-center py-4">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible drop-shadow-2xl">
        {/* Web rings */}
        {backgroundPolygons.map((points, i) => (
          <polygon key={i} points={points} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}
        {/* Axis Lines */}
        {items.map((_, i) => {
          const p = getPoint(100, i)
          return <line key={`axis-${i}`} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        })}
        {/* Data Area */}
        <polygon 
          points={polygonPoints} 
          fill="var(--accent)" 
          fillOpacity="0.15" 
          stroke="var(--accent)" 
          strokeWidth="2" 
          strokeLinejoin="round"
        />
        {/* Points & Labels */}
        {items.map((item, i) => {
          const p = getPoint(item.value, i)
          const labelP = getPoint(135, i) // Push label slightly further out
          return (
            <g key={`node-${i}`}>
              <circle cx={p.x} cy={p.y} r="4" fill={item.color || 'var(--accent)'} className="drop-shadow-md" />
              <text 
                x={labelP.x} 
                y={labelP.y} 
                fill="rgba(255,255,255,0.6)" 
                fontSize="11" 
                fontWeight="600" 
                textAnchor="middle" 
                dominantBaseline="middle"
                className="select-none"
              >
                {item.label}
              </text>
              <text 
                x={labelP.x} 
                y={labelP.y + 14} 
                fill="rgba(255,255,255,0.3)" 
                fontSize="10" 
                fontWeight="500" 
                textAnchor="middle" 
                dominantBaseline="middle"
                className="select-none"
              >
                {Math.round(item.value)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}