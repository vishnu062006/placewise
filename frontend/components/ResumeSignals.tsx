'use client'

type ResumeSignalsProps = {
  cgpa: string | number
  internships: string | number
  projectsCount: string | number
  skillsCount: number
  certifications?: string[]
  githubPresent?: boolean
  linkedinPresent?: boolean
}

export default function ResumeSignals({
  cgpa,
  internships,
  projectsCount,
  skillsCount,
  certifications = [],
  githubPresent,
  linkedinPresent,
}: ResumeSignalsProps) {
  const signals = [
    { label: 'CGPA', value: cgpa, status: cgpa === '—' ? 'Missing' : 'Detected' },
    { label: 'Projects', value: projectsCount, status: Number(projectsCount) > 0 ? 'Detected' : 'Weak' },
    { label: 'Internships', value: internships, status: Number(internships) > 0 ? 'Detected' : 'Missing' },
    { label: 'Skills', value: skillsCount, status: skillsCount > 0 ? 'Detected' : 'Missing' },
    { label: 'Certifications', value: certifications.length, status: certifications.length > 0 ? 'Detected' : 'Optional' },
    { label: 'Profiles', value: [githubPresent && 'GitHub', linkedinPresent && 'LinkedIn'].filter(Boolean).join(', ') || '—', status: githubPresent || linkedinPresent ? 'Detected' : 'Missing' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {signals.map(signal => {
        const positive = signal.status === 'Detected'
        return (
          <div key={signal.label} className="rounded-xl border border-[var(--border)] bg-black/15 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text3)]">{signal.label}</div>
              <span className="rounded-full px-2 py-0.5 text-[0.68rem] font-semibold" style={{
                color: positive ? 'var(--green)' : 'var(--yellow)',
                background: positive ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
              }}>
                {signal.status}
              </span>
            </div>
            <div className="truncate text-lg font-semibold text-[var(--text)]">{signal.value}</div>
          </div>
        )
      })}
    </div>
  )
}
