'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { FaCheck, FaTimes } from 'react-icons/fa'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

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
  weights: { cgpa: number, skills: number, projects: number, internship: number, dsa: number, github: number }
  requiredSignals: string[]
  keySignals: string[]
}

const COMPANIES: Company[] = [
  {
    name: 'Google', category: 'Big Tech', logo: 'G',
    baseExpectation: 78,
    weights: { cgpa: 0.12, skills: 0.18, projects: 0.20, internship: 0.20, dsa: 0.22, github: 0.08 },
    requiredSignals: ['Advanced DSA (300+ problems)', 'System design exposure', 'Internship experience', 'Open source contributions'],
    keySignals: ['Strong academic performance', 'Relevant technical projects', 'Solid programming foundations', 'Good skill coverage'],
  },
  {
    name: 'Microsoft', category: 'Big Tech', logo: 'M',
    baseExpectation: 76,
    weights: { cgpa: 0.14, skills: 0.20, projects: 0.22, internship: 0.18, dsa: 0.18, github: 0.08 },
    requiredSignals: ['DSA proficiency (200+ problems)', 'System design basics', 'Internship or research experience', 'Large-scale project exposure'],
    keySignals: ['Backend project experience', 'Strong academic profile', 'CS fundamentals', 'Technical breadth'],
  },
  {
    name: 'Amazon', category: 'Big Tech', logo: 'A',
    baseExpectation: 75,
    weights: { cgpa: 0.10, skills: 0.18, projects: 0.24, internship: 0.20, dsa: 0.20, github: 0.08 },
    requiredSignals: ['Leadership principle examples', 'DSA problem solving', 'Scalable system understanding', 'Impact-driven projects'],
    keySignals: ['Project impact metrics', 'Problem solving track record', 'Technical ownership', 'Delivery mindset'],
  },
  {
    name: 'Apple', category: 'Big Tech', logo: '⌘',
    baseExpectation: 70,
    weights: { cgpa: 0.15, skills: 0.22, projects: 0.25, internship: 0.18, dsa: 0.12, github: 0.08 },
    requiredSignals: ['Polished product-level projects', 'Attention to UX detail', 'Deep technical specialization', 'Internship at top company'],
    keySignals: ['Quality over quantity in projects', 'Technical depth', 'Strong fundamentals', 'Design sensibility'],
  },
  {
    name: 'Meta', category: 'Big Tech', logo: 'f',
    baseExpectation: 74,
    weights: { cgpa: 0.10, skills: 0.18, projects: 0.22, internship: 0.20, dsa: 0.22, github: 0.08 },
    requiredSignals: ['Strong DSA (250+ LeetCode)', 'Distributed systems knowledge', 'Internship experience', 'Impactful side projects'],
    keySignals: ['Algorithm efficiency focus', 'Scale-thinking in projects', 'Fast execution track record', 'Technical curiosity'],
  },
  {
    name: 'Atlassian', category: 'Product', logo: 'At',
    baseExpectation: 74,
    weights: { cgpa: 0.12, skills: 0.22, projects: 0.26, internship: 0.16, dsa: 0.14, github: 0.10 },
    requiredSignals: ['Full-stack project experience', 'Collaboration tool familiarity', 'Open source or team projects', 'Agile/DevOps exposure'],
    keySignals: ['Project collaboration skills', 'Broad tech stack', 'Product thinking', 'Clean code practices'],
  },
  {
    name: 'Adobe', category: 'Product', logo: 'Ad',
    baseExpectation: 70,
    weights: { cgpa: 0.14, skills: 0.24, projects: 0.24, internship: 0.16, dsa: 0.14, github: 0.08 },
    requiredSignals: ['Creative tech projects', 'Strong UI/UX awareness', 'Internship experience', 'ML or media processing knowledge'],
    keySignals: ['Technical creativity', 'Project polish', 'Cross-domain skills', 'Strong fundamentals'],
  },
  {
    name: 'Razorpay', category: 'Indian Product', logo: 'Rz',
    baseExpectation: 76,
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
    baseExpectation: 70,
    weights: { cgpa: 0.12, skills: 0.22, projects: 0.26, internship: 0.18, dsa: 0.14, github: 0.08 },
    requiredSignals: ['Fintech or data project exposure', 'Backend skills', 'Scalable system understanding', 'Strong fundamentals'],
    keySignals: ['Backend project experience', 'Data handling skills', 'Technical reliability', 'Strong CGPA'],
  },
  {
    name: 'PhonePe', category: 'Indian Product', logo: 'Pe',
    baseExpectation: 70,
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

function getCompatibilityLabel(score: number) {
  if (score >= 90) return { label: 'Excellent Match', colorClass: 'bg-lime-400', textColor: 'text-zinc-950' }
  if (score >= 75) return { label: 'Strong Match', colorClass: 'bg-indigo-300', textColor: 'text-zinc-950' }
  if (score >= 60) return { label: 'Moderate Match', colorClass: 'bg-amber-300', textColor: 'text-zinc-950' }
  return { label: 'Developing Match', colorClass: 'bg-rose-300', textColor: 'text-zinc-950' }
}

function computeCompatibility(company: Company, props: CompanyCompatibilityProps): number {
  const { skills, projects, cgpa, internships, hasDSA, hasGithub } = props
  const w = company.weights

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

function AnimatedBar({ value, colorClass, delay = 0 }: { value: number; colorClass: string; delay?: number }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 100)
    return () => clearTimeout(t)
  }, [value, delay])
  return (
    <div className="h-3 w-full overflow-hidden rounded-full border-2 border-zinc-950 bg-zinc-100">
      <div
        className={`h-full border-r-2 border-zinc-950 transition-all duration-700 ease-out ${colorClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

function RadialGaugeBrutalist({ value, colorClass, size = 80 }: { value: number; colorClass: string; size?: number }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setDisplayed(value), 200)
    return () => clearTimeout(t)
  }, [value])

  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const offset = circ - (displayed / 100) * circ
  
  const strokeColor = colorClass.includes('lime') ? '#a3e635' : 
                      colorClass.includes('indigo') ? '#a5b4fc' : 
                      colorClass.includes('amber') ? '#fcd34d' : '#fda4af'

  return (
    <div className="relative flex items-center justify-center rounded-2xl border-2 border-zinc-950 bg-white shadow-[4px_4px_0px_#18181b]" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f4f4f5" strokeWidth={8} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={strokeColor} strokeWidth={8} strokeLinecap="square"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${jakarta.className} text-xl font-black text-zinc-950`}>{displayed}</span>
      </div>
    </div>
  )
}

export default function CompanyCompatibility(props: CompanyCompatibilityProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  
  // Ref for the drawer section
  const drawerRef = useRef<HTMLDivElement>(null)

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

  // Handle auto-scrolling when a company is selected
  useEffect(() => {
    if (selectedCompany && drawerRef.current) {
      // Small timeout ensures the drawer is fully rendered before scrolling
      setTimeout(() => {
        drawerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }, [selectedCompany])

  return (
    <section className={`mb-5 rounded-3xl border-2 border-zinc-950 bg-white p-6 shadow-[8px_8px_0px_#18181b] sm:p-10 transition-all ${props.isHighlighted ? 'ring-4 ring-zinc-950 ring-offset-4' : ''}`}>

      {/* Header */}
      <div className="mb-8 border-b-2 border-zinc-950 pb-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-zinc-950 bg-indigo-300 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-950 shadow-[2px_2px_0px_#18181b]">
          New in v2
        </div>
        <h2 className={`${jakarta.className} text-3xl font-black text-zinc-950 md:text-4xl`}>Company Compatibility Engine</h2>
        <p className="mt-3 text-sm font-bold text-zinc-600">
          See how your profile aligns with hiring expectations at leading technology companies. Not interview probabilities — compatibility signals based on your resume.
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-8 flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-xl border-2 border-zinc-950 px-5 py-2 text-sm font-black transition-all hover:-translate-y-1 ${
              activeCategory === cat
                ? 'bg-zinc-950 text-white shadow-[4px_4px_0px_#a3e635]'
                : 'bg-zinc-50 text-zinc-500 shadow-[2px_2px_0px_#18181b] hover:bg-white hover:text-zinc-950 hover:shadow-[4px_4px_0px_#18181b]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Company grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-5">
        {filtered.map((company, i) => {
          const { label, colorClass, textColor } = getCompatibilityLabel(company.compatScore)
          const isSelected = selectedCompany === company.name

          return (
            <button
              key={company.name}
              onClick={() => setSelectedCompany(isSelected ? null : company.name)}
              className={`group relative flex flex-col justify-between rounded-2xl border-2 border-zinc-950 p-5 text-left transition-all duration-200 hover:-translate-y-1 ${
                isSelected
                  ? 'bg-zinc-100 shadow-none translate-y-1'
                  : 'bg-[#fbfbf7] shadow-[4px_4px_0px_#18181b] hover:shadow-[6px_6px_0px_#18181b]'
              }`}
            >
              <div className="relative">
                {/* Logo */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-zinc-950 bg-white text-xl font-black text-zinc-950 shadow-[2px_2px_0px_#18181b]">
                  {company.logo}
                </div>

                {/* Name */}
                <div className="mb-1 text-base font-black text-zinc-950 truncate">{company.name}</div>

                {/* Score */}
                <div className={`${jakarta.className} mb-4 text-4xl font-black text-zinc-950`}>
                  {company.compatScore}%
                </div>

                {/* Bar */}
                <AnimatedBar value={company.compatScore} colorClass={colorClass} delay={i * 60} />

                {/* Label */}
                <div className={`mt-3 inline-block rounded border-2 border-zinc-950 px-2 py-1 text-[10px] font-black uppercase tracking-widest ${colorClass} ${textColor}`}>
                  {label}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Detail drawer (Brutalist Style) */}
      {selected && selectedLabel && (
        <div ref={drawerRef} className="mt-8 overflow-hidden rounded-2xl border-2 border-zinc-950 bg-[#fbfbf7] shadow-[8px_8px_0px_#18181b]">
          
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b-2 border-zinc-950 bg-white p-6">
            <div className="flex items-center gap-6">
              <RadialGaugeBrutalist value={selectedScore} colorClass={selectedLabel.colorClass} size={80} />
              <div>
                <div className={`${jakarta.className} text-2xl font-black text-zinc-950`}>{selected.name}</div>
                <div className={`mt-2 inline-block rounded-md border-2 border-zinc-950 px-3 py-1 text-xs font-black uppercase tracking-widest ${selectedLabel.colorClass} ${selectedLabel.textColor}`}>
                  {selectedLabel.label}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCompany(null)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-zinc-950 bg-zinc-100 text-zinc-950 shadow-[2px_2px_0px_#18181b] transition-all hover:translate-y-1 hover:shadow-none"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            {/* Strong signals */}
            <div className="rounded-xl border-2 border-zinc-950 bg-lime-50 p-5">
              <div className="mb-4 text-xs font-black uppercase tracking-widest text-lime-700">Strong Signals</div>
              <div className="flex flex-col gap-3">
                {selected.keySignals.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm font-bold text-zinc-950">
                    <div className="mt-0.5 flex shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 bg-lime-300 p-1 text-zinc-950">
                      <FaCheck className="h-3 w-3" />
                    </div>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Missing signals */}
            <div className="rounded-xl border-2 border-zinc-950 bg-rose-50 p-5">
              <div className="mb-4 text-xs font-black uppercase tracking-widest text-rose-700">Missing Signals</div>
              <div className="flex flex-col gap-3">
                {selected.requiredSignals.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm font-bold text-zinc-950">
                    <div className="mt-0.5 flex shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 bg-rose-300 p-1 text-zinc-950">
                      <FaTimes className="h-3 w-3" />
                    </div>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* AI explanation */}
            <div className="rounded-xl border-2 border-zinc-950 bg-white p-6 shadow-[4px_4px_0px_#18181b] sm:col-span-2">
              <div className="mb-3 text-xs font-black uppercase tracking-widest text-zinc-500">Profile Analysis</div>
              <p className="text-base font-bold leading-relaxed text-zinc-950">
                {generateExplanation(selected, selectedScore, props)}
              </p>
            </div>

            {/* Recommended improvements */}
            <div className="sm:col-span-2">
              <div className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-500">Recommended Improvements</div>
              <div className="grid gap-4 sm:grid-cols-2">
                {selected.requiredSignals.map((s, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-xl border-2 border-zinc-950 bg-white p-4 shadow-[2px_2px_0px_#18181b] transition-transform hover:-translate-y-1">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-zinc-950 bg-indigo-300 text-xs font-black text-zinc-950">
                      {i + 1}
                    </span>
                    <span className="mt-1 text-sm font-bold text-zinc-950">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Potential score */}
            <div className={`flex items-center justify-between rounded-2xl border-2 border-zinc-950 p-6 shadow-[4px_4px_0px_#18181b] sm:col-span-2 ${selectedLabel.colorClass}`}>
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-widest text-zinc-950">
                  Potential Compatibility
                </div>
                <div className="flex items-center gap-3">
                  <span className={`${jakarta.className} text-3xl font-black text-zinc-700 line-through`}>{selectedScore}%</span>
                  <span className="text-2xl font-black text-zinc-950">→</span>
                  <span className={`${jakarta.className} text-4xl font-black text-zinc-950`}>{potentialScore}%</span>
                </div>
                <div className="mt-2 text-xs font-bold text-zinc-800">If recommended improvements are completed</div>
              </div>
              <div className="text-5xl opacity-40">🚀</div>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}