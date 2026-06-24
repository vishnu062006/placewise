'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaGithub as Github, FaLinkedin as Linkedin } from 'react-icons/fa'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  // Floating Nav logic
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#09090B] font-sans text-zinc-300 selection:bg-[#10B981] selection:text-white">
      
      {/* Cinematic Ambient Background Glows */}
      <div className="pointer-events-none absolute left-[10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[#10B981] opacity-[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-[#22D3EE] opacity-[0.05] blur-[120px]" />

      {/* Arc-Style Floating Pill Navigation */}
      <div className="fixed inset-x-0 top-6 z-50 flex justify-center px-4 transition-all duration-500 opacity-0 animate-fade-in-up">
        <nav className={`flex items-center justify-between rounded-full px-6 py-3 transition-all duration-500 ${
          scrolled 
            ? 'w-full max-w-3xl border border-white/10 bg-[#111827]/80 shadow-2xl backdrop-blur-2xl' 
            : 'w-full max-w-6xl border border-transparent bg-transparent'
        }`}>
          <Link href="/" className="text-xl font-bold tracking-tighter text-white">
            place<span className="text-[#10B981]">wise</span>
          </Link>
          
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Capabilities</Link>
            <Link href="#benchmark" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Distribution</Link>
            <Link href="#faq" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">FAQ</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/upload" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[#09090B] transition-all hover:scale-105 hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Analyze Resume
            </Link>
          </div>
        </nav>
      </div>

      <main className="relative z-10 overflow-hidden pt-32 md:pt-48">
        
        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-6 pb-24 lg:pb-32">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            
            {/* Left: High-Impact Typography & CTAs */}
            <div className="flex flex-col items-start">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#10B981]/20 bg-[#10B981]/5 px-3 py-1.5 text-xs font-semibold text-[#10B981] backdrop-blur-md opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]"></span>
                </span>
                Trained on 150+ verified placement records
              </div>

              <h1 className="mb-6 text-[clamp(2.75rem,5vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-white opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Know your placement readiness <br />
                <span className="text-emerald-500">before recruiters do.</span>
              </h1>
              
              <p className="mb-10 max-w-2xl text-lg leading-8 text-zinc-300 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                Upload your resume. Instantly see your interview probability, brutally honest recruiter feedback, and the exact missing signals keeping you from an offer.
              </p>

              <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <Link href="/upload" className="flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-[#09090B] shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all hover:scale-105 hover:bg-zinc-200 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]">
                  Analyze My Resume
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="#features" className="flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white transition-colors hover:bg-white/5">
                  View Sample Output
                </Link>
              </div>
            </div>

            {/* Right: The Premium "Tangible" Hero Card */}
            <div className="relative mx-auto w-full max-w-md perspective-1000 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-[#10B981] to-[#22D3EE] opacity-15 blur-3xl transition-opacity duration-500 hover:opacity-25" />
              
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827]/90 p-8 shadow-2xl backdrop-blur-3xl transition-transform duration-700 hover:rotate-1 hover:scale-[1.02]">
                
                {/* Simulated Scanning Line */}
                <div className="absolute inset-x-0 top-0 h-[2px] w-full animate-[scan_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-50" />

                <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Candidate Target</p>
                    <p className="font-medium text-white">FAANG Software Engineer</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-xs font-bold text-[#10B981]">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    SHORTLIST
                  </div>
                </div>

                <div className="mb-8 flex items-end gap-4">
                  <div className="flex flex-col">
                    <span className="text-6xl font-black tracking-tighter text-white">82<span className="text-2xl text-zinc-600">/100</span></span>
                  </div>
                  <div className="mb-2">
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-bold text-zinc-400">Top 29%</span>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Micro-Interface: Strengths */}
                  <div>
                    <h4 className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Detected Signals</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#10B981]/20 bg-[#10B981]/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300">
                        <svg className="h-3 w-3 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                        Strong CGPA
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#10B981]/20 bg-[#10B981]/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300">
                        <svg className="h-3 w-3 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                        DSA Evidence
                      </span>
                    </div>
                  </div>

                  {/* Micro-Interface: Weaknesses */}
                  <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-4 transition-colors hover:bg-rose-500/10">
                    <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-rose-400/80">Critical Missing</h4>
                    <div className="flex items-start gap-2 text-sm font-medium text-zinc-300">
                      <span className="mt-0.5 text-rose-400">⚠</span>
                      <p>Resume lacks <span className="text-white border-b border-rose-500/50">System Design</span> keywords and quantifiable business impact metrics.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Projected Max Score</p>
                  <p className="font-mono text-xl font-bold text-[#22D3EE]">92.0</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="border-y border-white/5 bg-white/[0.02] py-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="mb-8 text-sm font-bold uppercase tracking-widest text-zinc-500">Built for students targeting</p>
            <div className="flex flex-wrap justify-center gap-10 opacity-60 grayscale transition-opacity duration-500 hover:opacity-100 hover:grayscale-0 md:gap-20">
              <span className="text-xl font-extrabold tracking-tight text-white transition-all hover:scale-105">Amazon</span>
              <span className="text-xl font-extrabold tracking-tight text-white transition-all hover:scale-105">Microsoft</span>
              <span className="text-xl font-extrabold tracking-tight text-white transition-all hover:scale-105">Atlassian</span>
              <span className="text-xl font-extrabold tracking-tight text-white transition-all hover:scale-105">Goldman Sachs</span>
            </div>
          </div>
        </section>

        {/* FEATURES (Micro-Interface Bento Box) */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-32">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              See what the ATS sees.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400">
              Stop guessing. We extract your resume data exactly like enterprise hiring software, then evaluate it through the lens of a senior technical recruiter.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Feature 1: Readout */}
            <div className="group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827]/50 p-8 transition-colors hover:bg-[#111827]">
              <div className="mb-8">
                <h3 className="mb-2 text-xl font-bold text-white">Recruiter Readout</h3>
                <p className="text-sm text-zinc-400">A brutally honest, 3-sentence evaluation exactly as a human recruiter would summarize your profile.</p>
              </div>
              {/* Tangible UI Snippet */}
              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-inner transition-transform duration-500 group-hover:scale-[1.02]">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                  <span className="text-xs font-bold text-zinc-300">Senior Tech Recruiter</span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">
                  "The candidate has a solid foundation. Great academic trajectory. However, the lack of explicit cloud deployment tags makes this a tough sell for the initial ATS screen."
                </p>
              </div>
            </div>

            {/* Feature 2: Missing Signals */}
            <div className="group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827]/50 p-8 transition-colors hover:bg-[#111827]">
              <div className="mb-8">
                <h3 className="mb-2 text-xl font-bold text-white">Missing Signal Detection</h3>
                <p className="text-sm text-zinc-400">We cross-reference your resume against the exact stack requirements expected for your target role.</p>
              </div>
              {/* Tangible UI Snippet */}
              <div className="rounded-2xl border border-white/5 bg-[#09090B] p-5 font-mono text-xs shadow-inner transition-transform duration-500 group-hover:scale-[1.02]">
                <div className="mb-2 text-zinc-500">{'['}</div>
                <div className="pl-4 text-zinc-300">"JavaScript",</div>
                <div className="pl-4 text-zinc-300">"React",</div>
                <div className="pl-4 text-rose-400 bg-rose-500/10 border border-rose-500/20 py-1 px-2 rounded -ml-2 w-fit relative">
                  <span className="line-through opacity-50">"AWS / Docker"</span>
                  <span className="ml-2 text-[10px] uppercase tracking-widest font-sans font-bold">⚠ Missing</span>
                </div>
                <div className="mt-2 text-zinc-500">{']'}</div>
              </div>
            </div>

            {/* Feature 3: Projection */}
            <div className="group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827]/50 p-8 transition-colors hover:bg-[#111827]">
              <div className="mb-8">
                <h3 className="mb-2 text-xl font-bold text-white">Interactive Projection</h3>
                <p className="text-sm text-zinc-400">See exactly how adding a specific project or metric mathematically alters your placement probability.</p>
              </div>
              {/* Tangible UI Snippet */}
              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-inner transition-transform duration-500 group-hover:scale-[1.02]">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">Add: CI/CD Pipeline Evidence</span>
                  <span className="text-xs font-bold text-[#10B981]">+4 pts</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[82%] rounded-full bg-zinc-500 transition-all duration-700 ease-out group-hover:w-[86%] group-hover:bg-[#10B981] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            </div>

            {/* Feature 4: Roadmap */}
            <div className="group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827]/50 p-8 transition-colors hover:bg-[#111827]">
              <div className="mb-8">
                <h3 className="mb-2 text-xl font-bold text-white">4-Week Execution Plan</h3>
                <p className="text-sm text-zinc-400">Convert your skill gaps into a structured, week-by-week roadmap perfectly tailored to bridge your exact delta.</p>
              </div>
              {/* Tangible UI Snippet */}
              <div className="flex flex-col gap-3 transition-transform duration-500 group-hover:scale-[1.02]">
                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 shadow-inner">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-zinc-400">W1</div>
                  <span className="text-sm font-medium text-zinc-300">Deploy existing project to AWS EC2</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 opacity-50 shadow-inner transition-opacity duration-300 group-hover:opacity-80">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-zinc-400">W2</div>
                  <span className="text-sm font-medium text-zinc-300">Integrate PostgreSQL database</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* DATA VISUALIZATION: The Distribution Curve */}
        <section id="benchmark" className="border-y border-white/5 bg-white/[0.02] py-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Benchmark against reality.
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-zinc-400">
                We evaluate your profile against an XGBoost model trained on 150+ actual campus placement records. See exactly where you stand in the market distribution.
              </p>
            </div>

            {/* Pure Tailwind Bell Curve Abstraction */}
            <div className="relative mx-auto mt-12 h-64 w-full max-w-3xl border-b border-white/10 flex items-end justify-between gap-1 pb-4 group">
              {/* Simulated Distribution Bars */}
              {[10, 15, 25, 40, 60, 85, 100, 90, 70, 45, 25, 15, 8].map((height, i) => (
                <div 
                  key={i} 
                  className={`w-full rounded-t-sm transition-all duration-500 ${i === 8 ? 'bg-[#10B981] opacity-100 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-zinc-700 opacity-20 group-hover:opacity-30'}`}
                  style={{ height: `${height}%` }}
                ></div>
              ))}
              
              {/* FAANG Cutoff Line */}
              <div className="absolute bottom-4 left-[65%] top-0 w-px border-l border-dashed border-zinc-500 transition-colors group-hover:border-zinc-400">
                <div className="absolute -top-6 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition-colors group-hover:text-zinc-300">FAANG Cutoff (85)</div>
              </div>

              {/* User Position Indicator */}
              <div className="absolute bottom-4 left-[75%] top-0 w-px bg-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <div className="absolute -top-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#10B981] px-3 py-1.5 text-xs font-bold text-[#09090B] shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform hover:scale-110 cursor-default">
                  You (82)
                </div>
              </div>
            </div>
            <div className="mx-auto mt-6 flex max-w-3xl justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <span>Bottom 10%</span>
              <span>Median</span>
              <span>Top 10%</span>
            </div>
          </div>
        </section>

        {/* ELEGANT FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-6 py-32">
          <h2 className="mb-12 text-center text-3xl font-extrabold tracking-tight text-white">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'How is this different from ChatGPT?', a: 'ChatGPT is a text predictor; it gives generic resume writing advice. PlaceWise is an analytical engine. It extracts your data into structured JSON exactly like an ATS system, then scores it against an ML model trained on historical placement data.' },
              { q: 'Is my resume data kept private?', a: 'Strictly. Resumes are parsed entirely in memory. We do not store your PDF, phone numbers, or email addresses after the analysis session ends.' },
              { q: 'How long does the analysis take?', a: 'Your comprehensive placement score, gap analysis, and week-by-week roadmap are generated in approximately 45 to 60 seconds.' }
            ].map((faq, i) => (
              <div key={i} className="border-b border-white/5 pb-6">
                <h4 className="text-lg font-bold text-white">{faq.q}</h4>
                <p className="mt-2 text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMPELLING FINAL CTA */}
        <section className="relative border-t border-white/10 px-6 py-32 text-center overflow-hidden bg-[#09090B]">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#10B981] opacity-[0.08] blur-[100px]" />
          
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="mb-6 text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-tight text-white leading-tight">
              Stop submitting blindly.
            </h2>
            <p className="mb-10 text-xl text-zinc-400">
              Discover exactly what's holding your resume back in under 60 seconds. Free forever for students.
            </p>
            <Link href="/upload" className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 text-lg font-bold text-[#09090B] shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all hover:scale-105 hover:bg-zinc-200 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]">
              Analyze My Resume
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </section>

      </main>

      {/* COMPREHENSIVE PREMIUM FOOTER */}
      <footer className="border-t border-white/10 bg-[#09090B] px-6 py-16">
        <div className="mx-auto max-w-7xl grid gap-12 md:grid-cols-4">
          
          {/* Brand Col */}
          <div className="md:col-span-1">
             <span className="text-2xl font-black tracking-tighter text-white">place<span className="text-[#10B981]">wise</span></span>
             <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-xs">
                Built for students navigating placements, internships and career decisions.
             </p>
          </div>

          {/* Product Col */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-4 text-sm font-medium text-zinc-400">
              <li><Link href="/upload" className="hover:text-white transition-colors">Analyze Resume</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Capabilities</Link></li>
              <li><Link href="#benchmark" className="hover:text-white transition-colors">Data Distribution</Link></li>
            </ul>
          </div>

          {/* Company Col */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-zinc-400">
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><a href="mailto:vishnumashalkar@gmail.com" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-4 text-sm font-medium text-zinc-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mx-auto max-w-7xl mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-sm font-medium text-zinc-500">© {new Date().getFullYear()} placewise. All rights reserved.</p>
           <div className="flex items-center gap-6 text-zinc-500">
             {/* Abstract Social Icons */}
             <a
  href="https://github.com/vishnu062006"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:text-white transition-colors"
>
  <Github size={20} />
</a>

<a
  href="https://linkedin.com/in/vishnumashalkar"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:text-white transition-colors"
>
  <Linkedin size={20} />
</a>
           </div>
        </div>
      </footer>

      {/* Global Styles for Keyframe Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translateY(300px); opacity: 0.5; }
          90% { opacity: 0; }
          100% { transform: translateY(300px); opacity: 0; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  )
}
