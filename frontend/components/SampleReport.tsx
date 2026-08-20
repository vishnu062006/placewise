'use client'

import Link from 'next/link'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { FaArrowRight } from 'react-icons/fa'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

export default function SampleReport() {
  const stats = [
    { 
      label: 'Estimated readiness', 
      value: '74 / 100', 
      helper: 'Above product-company benchmark', 
      color: 'bg-lime-300' 
    },
    { 
      label: 'Positive factors', 
      value: '+18', 
      helper: 'Backend project, SQL, deployed app', 
      color: 'bg-indigo-300' 
    },
    { 
      label: 'Missing signals', 
      value: '3', 
      helper: 'DSA proof, impact metrics, internship evidence', 
      color: 'bg-rose-300' 
    },
  ]

  return (
    <div id="sample-report" className="mx-auto grid max-w-5xl gap-8 rounded-3xl border-2 border-zinc-950 bg-white p-6 shadow-[12px_12px_0px_#18181b] md:grid-cols-[1fr_1.1fr] md:p-10">
      
      {/* Left Column: Copy & CTA */}
      <div className="flex flex-col justify-center">
        <div>
          <span className="inline-block rounded-full border-2 border-zinc-950 bg-amber-300 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-950 shadow-[2px_2px_0px_#18181b]">
            Sample Report
          </span>
        </div>
        <h3 className={`${jakarta.className} mt-6 text-3xl font-black leading-tight tracking-tight text-zinc-950 md:text-4xl`}>
          See the kind of evidence Trajekt returns.
        </h3>
        <p className="mt-4 text-base font-bold leading-relaxed text-zinc-600">
          The report focuses on extracted signals, explainable score factors, missing role signals, and a short roadmap.
        </p>
        <div className="mt-8">
          <Link
            href="/upload"
            className="inline-flex items-center gap-3 rounded-full border-2 border-zinc-950 bg-lime-300 px-6 py-3 text-sm font-black text-zinc-950 shadow-[4px_4px_0px_#18181b] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#18181b] active:translate-y-[2px] active:shadow-none"
          >
            Analyse My Resume
            <FaArrowRight />
          </Link>
        </div>
      </div>
      
      {/* Right Column: Brutalist Stat Cards */}
      <div className="grid gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="flex flex-col justify-center rounded-2xl border-2 border-zinc-950 bg-[#fbfbf7] p-5 shadow-[4px_4px_0px_#18181b] transition-transform hover:-translate-x-1"
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {stat.label}
              </div>
              <div className={`h-3 w-3 rounded-full border-2 border-zinc-950 ${stat.color}`} />
            </div>
            <div className={`${jakarta.className} mt-3 text-2xl font-black tracking-tight text-zinc-950`}>
              {stat.value}
            </div>
            <div className="mt-1 text-xs font-bold text-zinc-600">
              {stat.helper}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}