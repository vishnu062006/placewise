'use client'

import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

interface ResumeSignalsProps {
  cgpa: string | number
  internships: number
  projectsCount: number
  skillsCount: number
  certifications: string[]
  githubPresent?: boolean
  linkedinPresent?: boolean
}

function SignalCard({ label, value, status, isOptional = false }: { label: string, value: string | number, status: 'Detected' | 'Missing' | 'Optional', isOptional?: boolean }) {
  const isDetected = status === 'Detected'
  const isMissing = status === 'Missing'
  
  const statusColor = isDetected ? 'text-lime-600' : isMissing ? 'text-rose-600' : 'text-amber-500'

  return (
    <div className="flex flex-col justify-between rounded-2xl border-2 border-zinc-950 bg-white p-5 shadow-[4px_4px_0px_#18181b] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#18181b]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-950">{label}</span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
          {status}
        </span>
      </div>
      <div className={`${jakarta.className} truncate text-2xl font-black text-zinc-950 md:text-3xl`}>
        {value}
      </div>
    </div>
  )
}

export default function ResumeSignals({
  cgpa,
  internships,
  projectsCount,
  skillsCount,
  certifications,
  githubPresent,
  linkedinPresent,
}: ResumeSignalsProps) {
  
  const profiles = []
  if (githubPresent) profiles.push('GitHub')
  if (linkedinPresent) profiles.push('LinkedIn')
  const profilesText = profiles.length > 0 ? profiles.join(', ') : 'None'

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <SignalCard 
        label="CGPA" 
        value={cgpa} 
        status={cgpa !== 'Not listed' && cgpa !== '—' ? 'Detected' : 'Missing'} 
      />
      <SignalCard 
        label="Projects" 
        value={projectsCount} 
        status={projectsCount > 0 ? 'Detected' : 'Missing'} 
      />
      <SignalCard 
        label="Internships" 
        value={internships} 
        status={internships > 0 ? 'Detected' : 'Missing'} 
      />
      <SignalCard 
        label="Skills" 
        value={skillsCount} 
        status={skillsCount > 0 ? 'Detected' : 'Missing'} 
      />
      <SignalCard 
        label="Certifications" 
        value={certifications.length} 
        status={certifications.length > 0 ? 'Detected' : 'Optional'} 
        isOptional
      />
      <SignalCard 
        label="Profiles" 
        value={profilesText} 
        status={profiles.length > 0 ? 'Detected' : 'Missing'} 
      />
    </div>
  )
}