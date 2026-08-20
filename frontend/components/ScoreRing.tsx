'use client'

import { useEffect, useState } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

interface ScoreRingProps {
  score: number
  size?: number
}

function getColor(score: number) {
  if (score >= 75) return '#a3e635' // lime-400
  if (score >= 50) return '#fcd34d' // amber-300
  return '#fda4af' // rose-300
}

function getLabel(score: number) {
  if (score >= 80) return 'Placement Ready'
  if (score >= 65) return 'Almost There'
  if (score >= 45) return 'Building Up'
  return 'Needs Work'
}

export default function ScoreRing({ score, size = 180 }: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(0)
  const strokeWidth = 16
  const radius = (size / 2) - strokeWidth
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
    <div className="flex flex-col items-center gap-5">
      {/* Brutalist Ring Container */}
      <div 
        className="relative flex items-center justify-center rounded-full border-4 border-zinc-950 bg-white shadow-[8px_8px_0px_#18181b]"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#f4f4f5" strokeWidth={strokeWidth}
          />
          {/* Progress Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.12s ease-out' }}
          />
        </svg>
        
        {/* Inner Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${jakarta.className} font-black text-zinc-950 tracking-tighter`} style={{ fontSize: size > 160 ? '4rem' : '3rem', lineHeight: 1 }}>
            {displayed}
          </span>
          <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">out of 100</span>
        </div>
      </div>

      {/* Brutalist Label Pill */}
      <div 
        className="rounded-full border-2 border-zinc-950 px-5 py-2 text-xs font-black uppercase tracking-widest text-zinc-950 shadow-[4px_4px_0px_#18181b]"
        style={{ backgroundColor: color }}
      >
        {getLabel(score)}
      </div>
    </div>
  )
}