'use client'

import { Plus_Jakarta_Sans } from 'next/font/google'
import { useState, useEffect } from 'react'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

interface Benchmark {
  role_average?: number
  candidate_score?: number
  percentile?: number
  label?: string
  explanation?: string
}

export default function BenchmarkCard({ benchmark, score }: { benchmark?: Benchmark, score: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!benchmark) return null

  const roleAvg = benchmark.role_average || 68
  const pct = benchmark.percentile || 76
  const label = benchmark.label || 'Above benchmark'

  return (
    <div className="mb-10 overflow-hidden rounded-3xl border-2 border-zinc-950 bg-[#fbfbf7] p-6 shadow-[8px_8px_0px_#18181b] md:p-8">
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h3 className={`${jakarta.className} text-2xl font-black text-zinc-950`}>Industry Benchmark</h3>
          <p className="mt-1 text-sm font-bold text-zinc-600">Compared against historical placement-readiness patterns for this target role.</p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full border-2 border-zinc-950 bg-white px-4 py-1.5 text-xs font-black uppercase tracking-widest text-zinc-950 shadow-[2px_2px_0px_#18181b]">
          {label}
        </span>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Your Score</div>
          <div className={`${jakarta.className} text-3xl font-black text-indigo-500 md:text-5xl`}>{score}</div>
        </div>
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Role Average</div>
          <div className={`${jakarta.className} text-3xl font-black text-amber-500 md:text-5xl`}>{roleAvg}</div>
        </div>
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Percentile</div>
          <div className={`${jakarta.className} text-3xl font-black text-lime-500 md:text-5xl`}>{pct}th</div>
        </div>
      </div>

      <div className="relative h-4 w-full overflow-hidden rounded-full border-2 border-zinc-950 bg-zinc-200">
        <div
          className="absolute left-0 top-0 h-full border-r-2 border-zinc-950 bg-gradient-to-r from-indigo-400 via-amber-400 to-lime-400 transition-all duration-1000 ease-out"
          style={{ width: mounted ? `${pct}%` : '0%' }}
        />
      </div>
    </div>
  )
}