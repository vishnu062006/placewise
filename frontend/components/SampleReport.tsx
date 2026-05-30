'use client'

import Link from 'next/link'

export default function SampleReport() {
  return (
    <div id="sample-report" className="mx-auto grid max-w-5xl gap-4 rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] md:grid-cols-[1fr_1.1fr] md:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent3)]">Sample report</p>
        <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] text-[var(--text)]">
          See the kind of evidence PlaceWise returns.
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
          The report focuses on extracted signals, explainable score factors, missing role signals, and a short roadmap.
        </p>
        <Link href="/upload" className="mt-5 inline-flex rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white no-underline">
          Analyse My Resume
        </Link>
      </div>
      <div className="grid gap-3">
        {[
          ['Estimated readiness', '74 / 100', 'Above product-company benchmark'],
          ['Positive factors', '+18', 'Backend project, SQL, deployed app'],
          ['Missing signals', '3', 'DSA proof, impact metrics, internship evidence'],
        ].map(([label, value, helper]) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-black/20 p-4">
            <div className="text-[0.7rem] font-bold uppercase tracking-[0.11em] text-[var(--text3)]">{label}</div>
            <div className="mt-2 text-xl font-semibold text-[var(--text)]">{value}</div>
            <div className="mt-1 text-[0.78rem] text-[var(--text3)]">{helper}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
