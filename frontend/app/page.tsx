'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { FaGithub as Github, FaLinkedin as Linkedin, FaArrowRight, FaCheck, FaTimes, FaBars } from 'react-icons/fa'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

const workflow = [
  {
    step: '01',
    title: 'Upload resume',
    copy: 'Start with your current PDF or resume file.',
    color: 'bg-lime-300'
  },
  {
    step: '02',
    title: 'Match a JD',
    copy: 'Compare your resume with the role you actually want.',
    color: 'bg-indigo-300'
  },
  {
    step: '03',
    title: 'Fix what matters',
    copy: 'Get resume edits and weekly learning actions.',
    color: 'bg-rose-300'
  }
]

const features = [
  {
    title: 'Resume Readiness',
    copy: 'See whether your resume has the proof, keywords, and impact recruiters expect before a screening round.',
    badge: 'Core'
  },
  {
    title: 'JD Matching',
    copy: 'Paste a job description on the JD Match page and compare your resume against the exact role requirements.',
    badge: 'Targeted'
  },
  {
    title: 'Internship Fit',
    copy: 'Check if your profile is strong enough for frontend, backend, data, AI, or general SWE internships.',
    badge: 'Students'
  },
  {
    title: 'Weekly Fix Plan',
    copy: 'Get focused course, project, and resume edits for this week instead of a generic list of advice.',
    badge: 'Actionable'
  }
]

const weeklyFixes = [
  'Add deployment proof to one project',
  'Rewrite project bullets with metrics',
  'Complete backend API course module'
]

const DID_YOU_KNOW = [
  { 
    title: "The 'T-Shaped' Profile", 
    content: "Companies don't want candidates who are average at everything. They look for a 'T-shaped' profile: broad knowledge across the stack, but deep, undeniable expertise in one specific area. Find your stem.",
    icon: "🎯",
    color: "bg-lime-300"
  },
  { 
    title: "Schlep Blindness", 
    content: "Most people unconsciously filter out ideas that sound like too much tedious work. The best projects to put on your resume to stand out are the exact ones other students were too lazy to build.",
    icon: "🧠",
    color: "bg-indigo-300"
  },
  { 
    title: "The ATS Myth", 
    content: "ATS systems don't reject you because of a 'low score' or bad formatting. They reject you because you literally don't have the explicit technical keywords the recruiter typed into the search bar.",
    icon: "🤖",
    color: "bg-rose-300"
  }
]

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [dailyFact, setDailyFact] = useState(DID_YOU_KNOW[0])

  useEffect(() => {
    // Calculates the current day of the year (1-365) to ensure the fact changes daily
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    const dayOfYear = Math.floor(diff / oneDay)
    
    setDailyFact(DID_YOU_KNOW[dayOfYear % DID_YOU_KNOW.length])
  }, [])

  return (
    <div className={`${inter.className} min-h-screen bg-[#fbfbf7] text-zinc-950 selection:bg-lime-300 selection:text-zinc-950 overflow-x-hidden`}>
      {/* Brutalist Grid Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#18181b1a_1px,transparent_1px),linear-gradient(to_bottom,#18181b1a_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* FLOATING GLASSMORPHISM NAVBAR */}
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:top-6">
        <nav className="relative flex w-full max-w-6xl items-center justify-between rounded-full border-2 border-zinc-950 bg-white/70 px-4 py-3 backdrop-blur-xl shadow-[4px_4px_0px_#18181b] transition-all md:px-8">
          <Link href="/" aria-label="Trajekt home" className="flex items-baseline gap-2 transition-transform hover:-translate-y-0.5">
            <span className={`${jakarta.className} text-2xl font-black tracking-tight`}>Trajekt</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-7 md:flex">
            <Link href="#features" className="text-sm font-bold text-zinc-600 transition-colors hover:text-zinc-950">
              Features
            </Link>
            <Link href="/jd-match" className="text-sm font-bold text-zinc-600 transition-colors hover:text-zinc-950">
              JD Match
            </Link>
            <Link href="#internships" className="text-sm font-bold text-zinc-600 transition-colors hover:text-zinc-950">
              Internships
            </Link>
            <Link href="#faq" className="text-sm font-bold text-zinc-600 transition-colors hover:text-zinc-950">
              FAQ
            </Link>
          </div>

          <div className="hidden md:block">
            <Link
              href="/upload"
              className="rounded-full border-2 border-zinc-950 bg-zinc-950 px-6 py-2.5 text-sm font-black text-white shadow-[4px_4px_0px_#a3e635] transition-all hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#a3e635] active:translate-y-[4px] active:shadow-none"
            >
              Analyze Resume
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border-2 border-zinc-950 bg-white shadow-[2px_2px_0px_#18181b] active:translate-y-[2px] active:shadow-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Mobile Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+12px)] rounded-3xl border-2 border-zinc-950 bg-white/95 p-6 backdrop-blur-xl shadow-[8px_8px_0px_#18181b] md:hidden">
              <div className="flex flex-col gap-6 text-center">
                <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black text-zinc-950">Features</Link>
                <Link href="/jd-match" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black text-zinc-950">JD Match</Link>
                <Link href="#internships" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black text-zinc-950">Internships</Link>
                <Link href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black text-zinc-950">FAQ</Link>
                <Link
                  href="/upload"
                  className="mt-4 rounded-full border-2 border-zinc-950 bg-lime-300 px-6 py-4 text-lg font-black text-zinc-950 shadow-[4px_4px_0px_#18181b] active:translate-y-[2px] active:shadow-none"
                >
                  Analyze My Resume
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      <main>
        {/* HERO SECTION */}
        <section className="mx-auto grid max-w-7xl gap-12 px-6 pt-32 pb-16 md:pt-40 md:pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          
          {/* LEFT COLUMN: Messaging & CTAs */}
          <div className="lg:mt-8">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-950 bg-zinc-100 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-950 shadow-[4px_4px_0px_#18181b]">
                Resume + JD + Internship Prep
              </div>
            </div>

            <h1 className={`${jakarta.className} max-w-3xl text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-[1.03] tracking-tight text-zinc-950`}>
              Know your shortlist chances <span className="inline-block bg-lime-300 px-2 leading-[1.1] border-2 border-zinc-950 -rotate-1 mt-2">before recruiters do.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg font-bold leading-relaxed text-zinc-700">
              Trajekt helps students analyze resumes, match them to job descriptions, find internship gaps, and get a practical weekly plan to improve.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-3 rounded-full border-2 border-zinc-950 bg-lime-300 px-8 py-5 text-lg font-black text-zinc-950 shadow-[6px_6px_0px_#18181b] transition-all hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#18181b] active:translate-y-[6px] active:shadow-none"
              >
                Analyze My Resume
                <FaArrowRight />
              </Link>
              <Link
                href="/jd-match"
                className="inline-flex items-center justify-center rounded-full border-2 border-zinc-950 bg-white px-8 py-5 text-lg font-black text-zinc-950 shadow-[6px_6px_0px_#18181b] transition-all hover:translate-y-[2px] hover:bg-zinc-50 hover:shadow-[4px_4px_0px_#18181b] active:translate-y-[6px] active:shadow-none"
              >
                Match a JD
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Workflow & Social Proof */}
          <div className="relative">
            <div className="absolute -right-4 -top-4 hidden rounded-full border-2 border-zinc-950 bg-indigo-300 px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] shadow-[4px_4px_0px_#18181b] md:block rotate-6 z-10">
              Upload → Fix → Apply
            </div>

            {/* The 3-Step Workflow Card */}
            <div className="rounded-3xl border-2 border-zinc-950 bg-white p-6 shadow-[12px_12px_0px_#18181b] md:p-8">
              <div className="mb-8 border-b-2 border-zinc-950 pb-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">The Workflow</p>
                <h2 className={`${jakarta.className} mt-2 text-2xl font-black tracking-tight text-zinc-950`}>
                  From PDF to an action plan.
                </h2>
              </div>

              <div className="space-y-4">
                {workflow.map((item) => (
                  <div key={item.step} className="grid grid-cols-[3.5rem_1fr] gap-4 rounded-2xl border-2 border-zinc-950 bg-[#fbfbf7] p-4 transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_#18181b]">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-zinc-950 ${item.color} text-sm font-black text-zinc-950 shadow-[2px_2px_0px_#18181b]`}>
                      {item.step}
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-lg font-black tracking-tight text-zinc-950">{item.title}</h3>
                      <p className="text-sm font-bold text-zinc-600 mt-0.5">{item.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ISOLATED SOCIAL PROOF PILL */}
            <div className="mt-12 flex justify-end">
              <div className="inline-flex items-center gap-4 rounded-full border-2 border-zinc-950 bg-white p-2 pr-6 shadow-[6px_6px_0px_#18181b] transition-transform hover:-translate-y-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-zinc-950 bg-indigo-300 text-lg shadow-[2px_2px_0px_#18181b]">
                  🌎
                </div>
                <span className="text-sm font-black text-zinc-600">
                  Trusted by <span className="text-zinc-950">1,500+ students</span> across <span className="text-zinc-950">35 countries</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* TARGET COMPANIES STRIP */}
        <section className="border-y-2 border-zinc-950 bg-zinc-950 py-6 overflow-hidden flex flex-col items-center">
           <span className="text-zinc-400 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Roles our users are actively preparing for:</span>
           <div className="flex whitespace-nowrap w-full">
             <div className="animate-marquee flex gap-12 text-2xl font-black uppercase tracking-widest text-zinc-500 md:gap-24">
                <span>Amazon</span>
                <span className="text-lime-300">•</span>
                <span>Microsoft</span>
                <span className="text-lime-300">•</span>
                <span>Goldman Sachs</span>
                <span className="text-lime-300">•</span>
                <span>Atlassian</span>
                <span className="text-lime-300">•</span>
                <span>Google</span>
                <span className="text-lime-300">•</span>
                <span>Amazon</span>
                <span className="text-lime-300">•</span>
                <span>Microsoft</span>
             </div>
           </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="bg-white px-6 py-24 border-b-2 border-zinc-950">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 max-w-3xl">
              <p className="mb-4 inline-block rounded-full border-2 border-zinc-950 bg-lime-300 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#18181b]">Under the hood</p>
              <h2 className={`${jakarta.className} text-4xl font-black tracking-tight text-zinc-950 md:text-5xl`}>
                One clear flow from upload to your next action.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <article key={feature.title} className="flex flex-col justify-between rounded-3xl border-2 border-zinc-950 bg-[#fbfbf7] p-8 shadow-[6px_6px_0px_#18181b] transition-transform hover:-translate-y-2 hover:shadow-[10px_10px_0px_#18181b]">
                  <div>
                    <span className="mb-6 inline-block rounded-md border-2 border-zinc-950 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                      {feature.badge}
                    </span>
                    <h3 className={`${jakarta.className} text-2xl font-black tracking-tight leading-tight`}>{feature.title}</h3>
                    <p className="mt-4 text-sm font-bold leading-relaxed text-zinc-600">{feature.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* STOP / START SECTION */}
        <section className="bg-indigo-300 px-6 py-24 border-b-2 border-zinc-950">
          <div className="mx-auto max-w-5xl">
            <h2 className={`${jakarta.className} mb-12 text-center text-4xl font-black tracking-tight text-zinc-950 md:text-5xl`}>
              The old way is broken.
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-3xl border-2 border-zinc-950 bg-white p-8 shadow-[8px_8px_0px_#18181b]">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-zinc-950 bg-rose-300 shadow-[4px_4px_0px_#18181b]">
                  <FaTimes className="text-2xl text-zinc-950" />
                </div>
                <h3 className={`${jakarta.className} mb-4 text-2xl font-black`}>Stop Guessing</h3>
                <ul className="space-y-4 font-bold text-zinc-600">
                  <li className="flex items-start gap-3"><FaTimes className="mt-1 text-rose-500 shrink-0" /> Using one generic resume for every role</li>
                  <li className="flex items-start gap-3"><FaTimes className="mt-1 text-rose-500 shrink-0" /> Wondering why the ATS rejected you</li>
                  <li className="flex items-start gap-3"><FaTimes className="mt-1 text-rose-500 shrink-0" /> Getting generic "make it pop" advice</li>
                </ul>
              </div>
              
              <div className="rounded-3xl border-2 border-zinc-950 bg-lime-300 p-8 shadow-[8px_8px_0px_#18181b]">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-zinc-950 bg-white shadow-[4px_4px_0px_#18181b]">
                  <FaCheck className="text-xl text-zinc-950" />
                </div>
                <h3 className={`${jakarta.className} mb-4 text-2xl font-black`}>Start Executing</h3>
                <ul className="space-y-4 font-bold text-zinc-900">
                  <li className="flex items-start gap-3"><FaCheck className="mt-1 text-zinc-950 shrink-0" /> Scoring against exact JD requirements</li>
                  <li className="flex items-start gap-3"><FaCheck className="mt-1 text-zinc-950 shrink-0" /> Seeing the exact missing signals</li>
                  <li className="flex items-start gap-3"><FaCheck className="mt-1 text-zinc-950 shrink-0" /> Following a step-by-step weekly plan</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* INTERNSHIPS SECTION */}
        <section id="internships" className="px-6 py-24 bg-[#fbfbf7] border-b-2 border-zinc-950">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="mb-4 inline-block rounded-full border-2 border-zinc-950 bg-rose-300 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_#18181b]">Internship Prep</p>
              <h2 className={`${jakarta.className} text-4xl font-black tracking-tight text-zinc-950 md:text-5xl leading-tight`}>
                Built for students who need fixes, not generic motivation.
              </h2>
              <p className="mt-6 max-w-xl text-lg font-bold leading-relaxed text-zinc-600">
                Trajekt highlights whether your resume has enough proof for internships and turns weak areas into a weekly execution plan.
              </p>
            </div>

            <div className="rounded-3xl border-2 border-zinc-950 bg-white p-8 shadow-[12px_12px_0px_#18181b]">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-zinc-950 pb-6">
                <div>
                  <h3 className={`${jakarta.className} text-2xl font-black`}>Action Items</h3>
                </div>
                <span className="rounded-full border-2 border-zinc-950 bg-lime-300 px-4 py-2 text-xs font-black shadow-[2px_2px_0px_#18181b]">
                  Example Output
                </span>
              </div>

              <div className="space-y-4">
                {weeklyFixes.map((fix, index) => (
                  <div key={fix} className="flex items-center gap-4 rounded-xl border-2 border-zinc-950 bg-[#fbfbf7] p-4 transition-transform hover:-translate-x-1 hover:shadow-[4px_4px_0px_#18181b]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-zinc-950 bg-zinc-950 text-sm font-black text-white shadow-[2px_2px_0px_#a3e635]">
                      {index + 1}
                    </span>
                    <p className="text-base font-bold text-zinc-950">{fix}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SINGLE DID YOU KNOW / DAILY FUEL SECTION */}
        <section id="did-you-know" className="bg-white px-6 py-24 border-b-2 border-zinc-950 scroll-mt-24">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col sm:flex-row gap-0 rounded-3xl border-2 border-zinc-950 bg-amber-300 shadow-[12px_12px_0px_#18181b] overflow-hidden">
              <div className="flex flex-col justify-center bg-zinc-950 p-8 text-white sm:w-1/3 md:p-12">
                <div className="mb-2 text-xs font-black uppercase tracking-widest text-amber-300">Daily Fuel</div>
                <h3 className={`${jakarta.className} text-3xl font-black leading-tight md:text-4xl`}>{dailyFact.title}</h3>
                <div className="mt-8 text-5xl opacity-20">{dailyFact.icon}</div>
              </div>
              <div className="p-8 sm:w-2/3 bg-[#fbfbf7] flex flex-col justify-center md:p-12">
                <p className="text-lg font-bold leading-relaxed text-zinc-700 md:text-xl">
                  {dailyFact.content}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-zinc-950 px-6 py-24 text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
            <div>
              <p className="mb-4 inline-block rounded-full border-2 border-white bg-lime-300 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-zinc-950 shadow-[2px_2px_0px_#ffffff]">Stop guessing</p>
              <h2 className={`${jakarta.className} max-w-2xl text-4xl font-black tracking-tight md:text-5xl lg:text-6xl`}>
                Analyze your resume or match a job description today.
              </h2>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-4 sm:w-auto sm:flex-row">
              <Link
                href="/upload"
                className="flex items-center justify-center rounded-full border-2 border-white bg-lime-300 px-8 py-5 text-lg font-black text-zinc-950 shadow-[6px_6px_0px_#ffffff] transition-all hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#ffffff] active:translate-y-[6px] active:shadow-none"
              >
                Analyze Resume
              </Link>
              <Link
                href="/jd-match"
                className="flex items-center justify-center rounded-full border-2 border-white bg-zinc-950 px-8 py-5 text-lg font-black text-white shadow-[6px_6px_0px_#ffffff] transition-all hover:translate-y-[2px] hover:bg-zinc-900 hover:shadow-[4px_4px_0px_#ffffff] active:translate-y-[6px] active:shadow-none"
              >
                JD Match
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="mx-auto max-w-4xl px-6 py-24">
          <h2 className={`${jakarta.className} mb-12 text-center text-4xl font-black tracking-tight text-zinc-950 md:text-5xl`}>FAQs</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Is my resume data kept private?',
                a: 'Strictly anonymous-first. Resumes are parsed entirely in memory. If you don\'t sign in, your PDF and extracted data are deleted the second your session ends. We only save data if you explicitly opt-in to track your progress.'
              },
              {
                q: 'What if my PDF is poorly formatted or unreadable?',
                a: 'Trajekt has robust fallback handling. If our primary parser can\'t read your complex multi-column layout, we\'ll tell you honestly and fall back to raw text extraction—because if we can\'t read it, an enterprise ATS definitely can\'t.'
              },
              {
                q: 'Where do I paste a job description?',
                a: 'Use the JD Match page. Resume-only analysis stays on /upload, while role-specific matching lives on /jd-match.'
              },
              {
                q: 'What happened to PlaceWise?',
                a: 'We rebranded to Trajekt. Same team, better engine. PlaceWise felt too much like a generic college placement cell—Trajekt reflects our actual focus on your career trajectory and velocity.'
              }
            ].map((faq) => (
              <article key={faq.q} className="rounded-3xl border-2 border-zinc-950 bg-white p-8 shadow-[8px_8px_0px_#18181b] transition-transform hover:-translate-y-1">
                <h3 className={`${jakarta.className} text-xl font-black`}>{faq.q}</h3>
                <p className="mt-3 text-base font-bold leading-relaxed text-zinc-600">{faq.a}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t-2 border-zinc-950 bg-white px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <span className={`${jakarta.className} text-3xl font-black tracking-tight`}>Trajekt</span>
            <p className="mt-4 text-sm font-bold leading-relaxed text-zinc-600">
              Built for students navigating placements, internships, and career decisions. (Formerly PlaceWise).
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Product</h4>
            <ul className="space-y-4 text-sm font-bold text-zinc-950">
              <li><Link href="/upload" className="hover:text-lime-500 transition-colors">Analyze Resume</Link></li>
              <li><Link href="/jd-match" className="hover:text-lime-500 transition-colors">JD Match</Link></li>
              <li><Link href="#features" className="hover:text-lime-500 transition-colors">Features</Link></li>
              <li><Link href="#internships" className="hover:text-lime-500 transition-colors">Internships</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-zinc-950">
              <li><Link href="#faq" className="hover:text-lime-500 transition-colors">FAQ</Link></li>
              <li><a href="mailto:vishnumashalkar@gmail.com" className="hover:text-lime-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Social</h4>
            <div className="flex items-center gap-5 text-zinc-950">
              <a href="https://github.com/vishnu062006" target="_blank" rel="noopener noreferrer" className="hover:text-lime-500 hover:-translate-y-1 transition-all" aria-label="GitHub">
                <Github size={26} />
              </a>
              <a href="https://linkedin.com/in/vishnumashalkar" target="_blank" rel="noopener noreferrer" className="hover:text-lime-500 hover:-translate-y-1 transition-all" aria-label="LinkedIn">
                <Linkedin size={26} />
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-7xl flex-col gap-4 border-t-2 border-zinc-950 pt-8 text-sm font-bold text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Trajekt. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-zinc-950">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-950">Terms</Link>
          </div>
        </div>
      </footer>

      {/* Marquee Animation for Social Proof strip */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}} />
    </div>
  )
}