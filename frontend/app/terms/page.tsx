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

export default function TermsPage() {
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
            <h1 className={`${jakarta.className} text-4xl font-black tracking-tight text-zinc-950 md:text-5xl`}>
              Terms of Service
            </h1>
            <p className="mt-4 text-lg font-bold text-zinc-600">
              By using Trajekt (formerly PlaceWise), you agree to these terms.
            </p>
          </div>

          <div className="space-y-10 text-zinc-800">
            <section>
              <h2 className={`${jakarta.className} mb-4 text-2xl font-black text-zinc-950`}>
                1. Educational Use
              </h2>
              <p className="font-bold leading-relaxed text-zinc-600">
                Trajekt is intended for educational and career guidance purposes only. Our engine analyzes resumes against expected market signals to help you improve your profile.
              </p>
            </section>

            <section>
              <h2 className={`${jakarta.className} mb-4 text-2xl font-black text-zinc-950`}>
                2. No Guarantees
              </h2>
              <p className="font-bold leading-relaxed text-zinc-600">
                Placement scores, interview probabilities, gap analyses, and company compatibility metrics are driven by algorithmic estimates. They should <span className="text-zinc-950 bg-rose-200 px-1">not be interpreted as guarantees</span> of internships, interviews, or job outcomes. Trajekt does not hire on behalf of any company listed on our platform.
              </p>
            </section>

            <section>
              <h2 className={`${jakarta.className} mb-4 text-2xl font-black text-zinc-950`}>
                3. User Content
              </h2>
              <p className="font-bold leading-relaxed text-zinc-600">
                You retain full ownership of any resume or content you upload. You are responsible for ensuring the information you provide is accurate and does not violate any third-party agreements.
              </p>
            </section>

            <section>
              <h2 className={`${jakarta.className} mb-4 text-2xl font-black text-zinc-950`}>
                4. Service Changes
              </h2>
              <p className="font-bold leading-relaxed text-zinc-600">
                We are actively building and improving. We may modify, add, or discontinue features of Trajekt at any time without prior notice.
              </p>
            </section>

            <section>
              <h2 className={`${jakarta.className} mb-4 text-2xl font-black text-zinc-950`}>
                5. Limitation of Liability
              </h2>
              <p className="font-bold leading-relaxed text-zinc-600">
                Trajekt is provided &quot;as is&quot; without warranties of any kind. We are not liable for any career outcomes, lost opportunities, or decisions made based on the analysis provided by our platform.
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