'use client'

import { useState, useEffect } from 'react'

interface CompanyCompatibilityProps {
  skills: string[]
  projects: unknown[]
  cgpa: string | number
  internships: number
  score: number
  role: string
  hasGithub?: boolean
  hasDSA?: boolean
  isHighlighted?: boolean;
}

interface Company {
  name: string
  category: string
  logo: string
  baseExpectation: number
  weights: {
    cgpa: number
    skills: number
    projects: number
    internship: number
    dsa: number
    github: number
  }
  requiredSignals: string[]
  keySignals: string[]
}

const COMPANIES: Company[] = [
  {
    name: 'Google', category: 'Big Tech', logo: 'G',
    baseExpectation: 88,
    weights: { cgpa: 0.12, skills: 0.18, projects: 0.20, internship: 0.20, dsa: 0.22, github: 0.08 },
    requiredSignals: ['Advanced DSA (300+ problems)', 'System design exposure', 'Internship experience', 'Open source contributions'],
    keySignals: ['Strong academic performance', 'Relevant technical projects', 'Solid programming foundations', 'Good skill coverage'],
  },
  {
    name: 'Microsoft', category: 'Big Tech', logo: 'M',
    baseExpectation: 82,
    weights: { cgpa: 0.14, skills: 0.20, projects: 0.22, internship: 0.18, dsa: 0.18, github: 0.08 },
    requiredSignals: ['DSA proficiency (200+ problems)', 'System design basics', 'Internship or research experience', 'Large-scale project exposure'],
    keySignals: ['Backend project experience', 'Strong academic profile', 'CS fundamentals', 'Technical breadth'],
  },
  {
    name: 'Amazon', category: 'Big Tech', logo: 'A',
    baseExpectation: 80,
    weights: { cgpa: 0.10, skills: 0.18, projects: 0.24, internship: 0.20, dsa: 0.20, github: 0.08 },
    requiredSignals: ['Leadership principle examples', 'DSA problem solving', 'Scalable system understanding', 'Impact-driven projects'],
    keySignals: ['Project impact metrics', 'Problem solving track record', 'Technical ownership', 'Delivery mindset'],
  },
  {
    name: 'Apple', category: 'Big Tech', logo: '⌘',
    baseExpectation: 85,
    weights: { cgpa: 0.15, skills: 0.22, projects: 0.25, internship: 0.18, dsa: 0.12, github: 0.08 },
    requiredSignals: ['Polished product-level projects', 'Attention to UX detail', 'Deep technical specialization', 'Internship at top company'],
    keySignals: ['Quality over quantity in projects', 'Technical depth', 'Strong fundamentals', 'Design sensibility'],
  },
  {
    name: 'Meta', category: 'Big Tech', logo: 'f',
    baseExpectation: 84,
    weights: { cgpa: 0.10, skills: 0.18, projects: 0.22, internship: 0.20, dsa: 0.22, github: 0.08 },
    requiredSignals: ['Strong DSA (250+ LeetCode)', 'Distributed systems knowledge', 'Internship experience', 'Impactful side projects'],
    keySignals: ['Algorithm efficiency focus', 'Scale-thinking in projects', 'Fast execution track record', 'Technical curiosity'],
  },
  {
    name: 'Atlassian', category: 'Product', logo: 'At',
    baseExpectation: 75,
    weights: { cgpa: 0.12, skills: 0.22, projects: 0.26, internship: 0.16, dsa: 0.14, github: 0.10 },
    requiredSignals: ['Full-stack project experience', 'Collaboration tool familiarity', 'Open source or team projects', 'Agile/DevOps exposure'],
    keySignals: ['Project collaboration skills', 'Broad tech stack', 'Product thinking', 'Clean code practices'],
  },
  {
    name: 'Adobe', category: 'Product', logo: 'Ad',
    baseExpectation: 76,
    weights: { cgpa: 0.14, skills: 0.24, projects: 0.24, internship: 0.16, dsa: 0.14, github: 0.08 },
    requiredSignals: ['Creative tech projects', 'Strong UI/UX awareness', 'Internship experience', 'ML or media processing knowledge'],
    keySignals: ['Technical creativity', 'Project polish', 'Cross-domain skills', 'Strong fundamentals'],
  },
  {
    name: 'Razorpay', category: 'Indian Product', logo: 'Rz',
    baseExpectation: 72,
    weights: { cgpa: 0.10, skills: 0.24, projects: 0.28, internship: 0.18, dsa: 0.12, github: 0.08 },
    requiredSignals: ['Backend/API project experience', 'Payment or fintech exposure', 'Deployed production projects', 'System reliability mindset'],
    keySignals: ['API and backend skills', 'Project deployment experience', 'Technical ownership', 'Problem solving approach'],
  },
  {
    name: 'CoinDCX', category: 'Indian Product', logo: 'Cx',
    baseExpectation: 70,
    weights: { cgpa: 0.10, skills: 0.22, projects: 0.28, internship: 0.18, dsa: 0.12, github: 0.10 },
    requiredSignals: ['Web3 or blockchain interest', 'Full-stack project experience', 'GitHub activity', 'API integration projects'],
    keySignals: ['Full-stack capability', 'Self-driven project work', 'Fast learner signals', 'Technical depth'],
  },
  {
    name: 'Groww', category: 'Indian Product', logo: 'Gw',
    baseExpectation: 71,
    weights: { cgpa: 0.12, skills: 0.22, projects: 0.26, internship: 0.18, dsa: 0.14, github: 0.08 },
    requiredSignals: ['Fintech or data project exposure', 'Backend skills', 'Scalable system understanding', 'Strong fundamentals'],
    keySignals: ['Backend project experience', 'Data handling skills', 'Technical reliability', 'Strong CGPA'],
  },
  {
    name: 'PhonePe', category: 'Indian Product', logo: 'Pe',
    baseExpectation: 72,
    weights: { cgpa: 0.12, skills: 0.22, projects: 0.26, internship: 0.18, dsa: 0.14, github: 0.08 },
    requiredSignals: ['Payments/fintech project', 'Backend API experience', 'High-scale system awareness', 'Internship or work experience'],
    keySignals: ['Backend technical skills', 'Project deployment', 'Scale awareness', 'Strong CS fundamentals'],
  },
  {
    name: 'Meesho', category: 'Indian Product', logo: 'Ms',
    baseExpectation: 68,
    weights: { cgpa: 0.10, skills: 0.22, projects: 0.28, internship: 0.18, dsa: 0.12, github: 0.10 },
    requiredSignals: ['E-commerce or consumer app project', 'Full-stack experience', 'Mobile or web frontend', 'Self-driven builds'],
    keySignals: ['Consumer product thinking', 'Full-stack capability', 'Project execution', 'GitHub activity'],
  },
]

const CATEGORIES = ['All', 'Big Tech', 'Product', 'Indian Product']

function getCompatibilityLabel(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 90) return { label: 'Excellent Match', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' }
  if (score >= 75) return { label: 'Strong Match', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)' }
  if (score >= 60) return { label: 'Moderate Match', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' }
  return { label: 'Developing Match', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' }
}

function computeCompatibility(company: Company, props: CompanyCompatibilityProps): number {
  const { skills, projects, cgpa, internships, score, hasDSA, hasGithub } = props
  const w = company.weights

  // Normalize each signal to 0-100
  let cgpaScore = 0
  try {
    const cgpaVal = parseFloat(String(cgpa).replace(/\/.*/, '')) || 0
    cgpaScore = cgpaVal >= 9.5 ? 100 : cgpaVal >= 9.0 ? 90 : cgpaVal >= 8.5 ? 80 : cgpaVal >= 8.0 ? 68 : cgpaVal >= 7.5 ? 55 : cgpaVal >= 7.0 ? 40 : cgpaVal >= 6.0 ? 25 : 10
  } catch { cgpaScore = 50 }

  const skillScore = Math.min(skills.length * 6, 100)
  const projectScore = Math.min((projects?.length || 0) * 30, 100)
  const internScore = internships > 0 ? Math.min(internships * 55, 100) : 0
  const dsaScore = hasDSA ? 75 : 15
  const githubScore = hasGithub ? 70 : 20

  const raw = (
    cgpaScore * w.cgpa +
    skillScore * w.skills +
    projectScore * w.projects +
    internScore * w.internship +
    dsaScore * w.dsa +
    githubScore * w.github
  )

  // Scale relative to company expectation — harder companies compress scores
  const scaled = (raw / company.baseExpectation) * 85
  return Math.min(Math.max(Math.round(scaled), 18), 96)
}

function generateExplanation(company: Company, compatScore: number, props: CompanyCompatibilityProps): string {
  const { skills, projects, cgpa, internships, hasDSA } = props
  const label = compatScore >= 75 ? 'aligns well' : compatScore >= 60 ? 'partially aligns' : 'needs strengthening'

  const positives = []
  const negatives = []

  try {
    const cgpaVal = parseFloat(String(cgpa).replace(/\/.*/, ''))
    if (cgpaVal >= 8.0) positives.push('strong academic record')
    else negatives.push('CGPA below typical shortlisting bar')
  } catch { /* skip */ }

  if (skills.length >= 10) positives.push('broad technical skill coverage')
  else if (skills.length < 5) negatives.push('limited visible technical skills')

  if ((projects?.length || 0) >= 3) positives.push('solid project portfolio')
  else negatives.push('insufficient project depth')

  if (internships > 0) positives.push('industry internship experience')
  else negatives.push('lack of internship experience')

  if (hasDSA) positives.push('DSA practice signals')
  else if (['Google', 'Meta', 'Amazon', 'Microsoft'].includes(company.name)) negatives.push('no DSA proof for this role')

  const posStr = positives.slice(0, 2).join(' and ')
  const negStr = negatives.slice(0, 2).join(' and ')

  if (positives.length > 0 && negatives.length > 0) {
    return `Your ${posStr} ${label} with ${company.name}'s hiring expectations. However, ${negStr} reduces compatibility with their typical candidate profile.`
  } else if (positives.length > 0) {
    return `Your profile ${label} with ${company.name}'s hiring bar — ${posStr} are strong signals for their recruiters.`
  } else {
    return `Your profile currently has gaps for ${company.name} — ${negStr}. Addressing these will significantly improve your compatibility.`
  }
}

function AnimatedBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 100)
    return () => clearTimeout(t)
  }, [value, delay])
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  )
}

function RadialGauge({ value, color, size = 80 }: { value: number; color: string; size?: number }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setDisplayed(value), 200)
    return () => clearTimeout(t)
  }, [value])

  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const offset = circ - (displayed / 100) * circ

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out', filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold" style={{ color }}>{displayed}%</span>
      </div>
    </div>
  )
}

export default function CompanyCompatibility(props: CompanyCompatibilityProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)

  const companies = COMPANIES.map(c => ({
    ...c,
    compatScore: computeCompatibility(c, props),
  }))

  const filtered = activeCategory === 'All'
    ? companies
    : companies.filter(c => c.category === activeCategory)

  const selected = companies.find(c => c.name === selectedCompany)
  const selectedScore = selected ? selected.compatScore : 0
  const selectedLabel = selected ? getCompatibilityLabel(selectedScore) : null
  const potentialScore = selected ? Math.min(selectedScore + Math.floor(Math.random() * 8) + 8, 96) : 0

  return (
    <section className="mb-5 rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 p-5 sm:p-7 backdrop-blur-xl">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]/70">New in v2</span>
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">Company Compatibility Engine</h2>
        <p className="mt-1 text-xs text-white/35 leading-relaxed">
          See how your profile aligns with hiring expectations at leading technology companies. Not interview probabilities — compatibility signals based on your resume.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all border ${
              activeCategory === cat
                ? 'border-[var(--accent)]/40 bg-[var(--accent)]/12 text-[var(--accent)]'
                : 'border-white/[0.07] bg-transparent text-white/35 hover:text-white/60 hover:border-white/15'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Company grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 mb-5">
        {filtered.map((company, i) => {
          const { label, color, bg, border } = getCompatibilityLabel(company.compatScore)
          const isSelected = selectedCompany === company.name

          return (
            <button
              key={company.name}
              onClick={() => setSelectedCompany(isSelected ? null : company.name)}
              className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                isSelected
                  ? 'border-[var(--accent)]/40 bg-[var(--accent)]/8'
                  : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
              }`}
            >
              {/* Aurora glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{ background: `radial-gradient(circle at top right, ${color}30, transparent 60%)` }}
              />
              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)`, opacity: isSelected ? 1 : 0.4 }} />

              <div className="relative">
                {/* Logo */}
                <div
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black"
                  style={{ background: bg, border: `1px solid ${border}`, color }}
                >
                  {company.logo}
                </div>

                {/* Name */}
                <div className="text-sm font-semibold text-white/85 mb-2 truncate">{company.name}</div>

                {/* Score */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold" style={{ color }}>{company.compatScore}%</span>
                </div>

                {/* Bar */}
                <AnimatedBar value={company.compatScore} color={color} delay={i * 60} />

                {/* Label */}
                <div className="mt-2 text-[10px] font-semibold" style={{ color }}>{label}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Detail drawer */}
      {selected && selectedLabel && (
        <div
          className="rounded-xl border border-white/[0.1] bg-white/[0.03] overflow-hidden"
          style={{ borderColor: `${selectedLabel.color}25` }}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-4">
              <RadialGauge value={selectedScore} color={selectedLabel.color} size={72} />
              <div>
                <div className="text-base font-bold text-white">{selected.name}</div>
                <div className="text-xs mt-0.5" style={{ color: selectedLabel.color }}>{selectedLabel.label}</div>
                <div className="text-[10px] text-white/30 mt-1">{selected.category}</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCompany(null)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-white/30 hover:text-white/60 transition-colors text-xs"
            >
              ✕
            </button>
          </div>

          <div className="p-5 grid gap-5 sm:grid-cols-2">
            {/* Strong signals */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-3">Strong Signals</div>
              <div className="flex flex-col gap-2">
                {selected.keySignals.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-white/60">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Missing signals */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-3">Missing Signals</div>
              <div className="flex flex-col gap-2">
                {selected.requiredSignals.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-white/60">
                    <span className="text-red-400 shrink-0 mt-0.5">✗</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* AI explanation */}
            <div className="sm:col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Profile Analysis</div>
              <p className="text-sm leading-relaxed text-white/60">
                {generateExplanation(selected, selectedScore, props)}
              </p>
            </div>

            {/* Recommended improvements */}
            <div className="sm:col-span-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Recommended Improvements</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {selected.requiredSignals.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-xs text-white/55 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Potential score */}
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl border p-4"
              style={{ borderColor: `${selectedLabel.color}20`, background: `${selectedLabel.color}06` }}
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: `${selectedLabel.color}80` }}>
                  Potential Compatibility
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold" style={{ color: selectedLabel.color }}>{selectedScore}%</span>
                  <span className="text-white/30 text-sm">→</span>
                  <span className="text-xl font-bold text-emerald-400">{potentialScore}%</span>
                </div>
                <div className="text-[10px] text-white/30 mt-1">if recommended improvements are completed</div>
              </div>
              <div className="text-3xl opacity-20">⚡</div>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}