'use client'

import { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number
  size?: number
}

function getColor(score: number) {
  if (score >= 75) return '#34d399'
  if (score >= 50) return '#fbbf24'
  return '#f87171'
}

function getLabel(score: number) {
  if (score >= 80) return 'Placement Ready'
  if (score >= 65) return 'Almost There'
  if (score >= 45) return 'Building Up'
  return 'Needs Work'
}

export default function ScoreRing({ score, size = 160 }: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(0)
  const radius = (size / 2) - 14
  const circumference = 2 * Math.PI * radius
  const color = getColor(score)

  useEffect(() => {
    const target = Math.min(Math.max(Math.round(score || 0), 0), 100)
    let frame: number
    const start = performance.now()
    const duration = 1100
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(target * eased))
      if (progress >= 1) {
        setDisplayed(target)
        return
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [score])

  const offset = circumference - (displayed / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color}14 0%, transparent 58%)`,
          boxShadow: `0 0 60px ${color}18`,
        }}
      >
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={12}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.12s ease-out', filter: `drop-shadow(0 0 10px ${color}70)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontWeight: 800, fontSize: size > 180 ? '3rem' : size > 120 ? '2.25rem' : '1.6rem', color, lineHeight: 1, letterSpacing: '-0.06em' }}>
            {displayed}
          </span>
          <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--text3)]">out of 100</span>
        </div>
      </div>
      <div
        className="rounded-full px-3 py-1 text-[0.78rem] font-semibold"
        style={{
          background: `${color}16`,
          border: `1px solid ${color}38`,
          color,
        }}
      >
        {getLabel(score)}
      </div>
    </div>
  )
}
