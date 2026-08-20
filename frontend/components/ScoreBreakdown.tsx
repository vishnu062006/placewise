'use client'

import { Plus_Jakarta_Sans } from 'next/font/google'
import { useState, useEffect } from 'react'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

export interface ScoreFactor {
  name: string
  impact: number
  description?: string
}

export default function ScoreBreakdown({ factors, confidence }: { factors: ScoreFactor[], confidence?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="flex flex-col gap-4">
      {/* Confidence Card */}
      {confidence !== undefined && (
        <div className="rounded-2xl border-2 border-zinc-950 bg-zinc-100 p-5 shadow-[4px_4px_0px_#18181b]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Confidence</span>
            <span className={`${jakarta.className} text-xl font-black text-zinc-950`}>{confidence}%</span>
          </div>
          <div className="mb-3 h-3 w-full overflow-hidden rounded-full border-2 border-zinc-950 bg-white">
            <div
              className="h-full border-r-2 border-zinc-950 bg-indigo-400 transition-all duration-1000 ease-out"
              style={{ width: mounted ? `${confidence}%` : '0%' }}
            />
          </div>
          <p className="text-xs font-bold text-zinc-500">
            Confidence reflects how many resume signals were extractable and whether model scoring was available.
          </p>
        </div>
      )}

      {/* Individual Factor Cards */}
      {factors.map((factor, idx) => {
        const isPositive = factor.impact >= 0
        const barColor = isPositive ? 'bg-lime-400' : 'bg-rose-400'
        const badgeColor = isPositive ? 'bg-lime-300 text-zinc-950' : 'bg-rose-300 text-zinc-950'
        const sign = isPositive ? '+' : ''
        
        // Calculate an arbitrary fill width based on impact for visual weight
        const fillPercentage = Math.min(Math.abs(factor.impact) * 5, 100)

        return (
          <div key={idx} className="group rounded-2xl border-2 border-zinc-950 bg-white p-5 shadow-[4px_4px_0px_#18181b] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#18181b]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h4 className={`${jakarta.className} mb-1 text-base font-bold tracking-tight text-zinc-950`}>
                  {factor.name}
                </h4>
                {factor.description && (
                  <p className="text-xs font-bold text-zinc-600">{factor.description}</p>
                )}
              </div>
              <span className={`shrink-0 rounded-full border-2 border-zinc-950 px-3 py-1 text-xs font-black shadow-[2px_2px_0px_#18181b] ${badgeColor}`}>
                {sign}{factor.impact}
              </span>
            </div>
            
            <div className="h-2.5 w-full overflow-hidden rounded-full border-2 border-zinc-950 bg-zinc-100">
              <div
                className={`h-full border-r-2 border-zinc-950 transition-all duration-1000 ease-out ${barColor}`}
                style={{ width: mounted ? `${fillPercentage}%` : '0%' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}