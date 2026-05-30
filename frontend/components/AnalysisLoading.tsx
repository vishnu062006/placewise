'use client'

export default function AnalysisLoading({ steps, activeStep }: { steps: string[]; activeStep: number }) {
  return (
    <div className="mx-auto w-full max-w-md text-center">
      <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--accent)] bg-white/[0.035] shadow-[0_0_45px_rgba(108,99,255,0.24)]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border2)] border-t-[var(--accent3)]" />
      </div>
      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">Analysing your resume</h2>
      <p className="mt-2 text-sm text-[var(--text3)]">Usually takes around 45 seconds. Your resume is processed securely.</p>
      <div className="mt-8 grid gap-3 text-left">
        {steps.map((step, index) => {
          const done = index < activeStep
          const active = index === activeStep
          return (
            <div key={step} className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 ${
              active ? 'border-[var(--accent)] bg-white/[0.04]' : 'border-[var(--border)] bg-black/15'
            } ${index <= activeStep ? 'opacity-100' : 'opacity-45'}`}>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold" style={{
                background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--surface2)',
                color: done || active ? '#fff' : 'var(--text3)',
              }}>
                {done ? '✓' : active ? '…' : ''}
              </div>
              <span className="text-sm text-[var(--text2)]">{step}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
