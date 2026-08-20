'use client'

import Link from 'next/link'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { FaArrowLeft } from 'react-icons/fa'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

export default function PrivacyPage() {
  return (
    <div className={`${inter.className} min-h-screen bg-[#fbfbf7] text-zinc-950 selection:bg-lime-300 selection:text-zinc-950`}>
      {/* Brutalist Grid Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#18181b1a_1px,transparent_1px),linear-gradient(to_bottom,#18181b1a_1px,transparent_1px)] bg-[size:32px_32px]" />

      <nav className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 md:top-6">
        <div className="flex w-full max-w-4xl items-center justify-between rounded-full border-2 border-zinc-950 bg-white/80 px-6 py-3 backdrop-blur-xl shadow-[4px_4px_0px_#18181b]">
          <Link href="/" className={`${jakarta.className} text-xl font-black tracking-tight`}>
            Trajekt
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-950 transition-colors">
            <FaArrowLeft /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24 md:pt-40">
        <div className="rounded-3xl border-2 border-zinc-950 bg-white p-8 shadow-[12px_12px_0px_#18181b] md:p-12">
          
          <div className="mb-10 border-b-2 border-zinc-950 pb-8">
            <div className="mb-4 inline-block rounded-full border-2 border-zinc-950 bg-lime-300 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-zinc-950 shadow-[2px_2px_0px_#18181b]">
              Anonymous-First
            </div>
            <h1 className={`${jakarta.className} text-4xl font-black tracking-tight text-zinc-950 md:text-5xl`}>
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg font-bold text-zinc-600">
              Trajekt (formerly PlaceWise) respects your privacy. This policy explains our anonymous-first approach to handling the information submitted through our platform.
            </p>
          </div>

          <div className="space-y-10 text-zinc-800">
            <section>
              <h2 className={`${jakarta.className} mb-4 text-2xl font-black text-zinc-950`}>
                1. Information We Process
              </h2>
              <p className="font-bold leading-relaxed text-zinc-600">
                When you upload a resume, we process its contents to generate placement readiness scores, recruiter feedback, and personalized roadmaps. We extract text strictly for analysis purposes.
              </p>
            </section>

            <section>
              <h2 className={`${jakarta.className} mb-4 text-2xl font-black text-zinc-950`}>
                2. Anonymous-First Resume Data
              </h2>
              <p className="font-bold leading-relaxed text-zinc-600">
                If you use Trajekt without signing in, your resume is parsed entirely in memory. Your PDF, phone numbers, and email addresses are <span className="text-zinc-950 bg-lime-200 px-1">deleted immediately</span> after the analysis session ends. We only store your data if you explicitly sign in and opt-in to track your progress. We do not sell your personal information.
              </p>
            </section>

            <section>
              <h2 className={`${jakarta.className} mb-4 text-2xl font-black text-zinc-950`}>
                3. Third-Party Services
              </h2>
              <p className="font-bold leading-relaxed text-zinc-600">
                Trajekt uses third-party AI and cloud infrastructure to process resume data securely and generate analysis results. These providers are bound by strict data processing agreements and do not use your resume to train their base models.
              </p>
            </section>

            <section>
              <h2 className={`${jakarta.className} mb-4 text-2xl font-black text-zinc-950`}>
                4. Contact
              </h2>
              <p className="font-bold leading-relaxed text-zinc-600">
                Questions about this policy can be directed to <a href="mailto:vishnumashalkar@gmail.com" className="text-indigo-600 underline underline-offset-4 hover:text-indigo-800">vishnumashalkar@gmail.com</a>.
              </p>
            </section>
          </div>

          <div className="mt-12 border-t-2 border-zinc-100 pt-6">
            <p className="text-sm font-black uppercase tracking-widest text-zinc-400">
              Last updated: August 2026
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}