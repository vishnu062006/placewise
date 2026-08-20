import Link from 'next/link'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
})

export default function NotFound() {
  return (
    <main
      className={`${inter.className} min-h-screen bg-[#fbfbf7] text-zinc-950`}
    >
      {/* Brutalist Grid Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#18181b1a_1px,transparent_1px),linear-gradient(to_bottom,#18181b1a_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-2xl rounded-3xl border-2 border-zinc-950 bg-white p-10 shadow-[12px_12px_0px_#18181b] md:p-16">
          
          <div className="mb-6 inline-block rounded-full border-2 border-zinc-950 bg-lime-300 px-4 py-2 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_#18181b]">
            Error 404
          </div>

          <h1
            className={`${jakarta.className} text-6xl font-black tracking-tighter md:text-8xl`}
          >
            Lost your
            <br />
            <span className="text-indigo-500">trajectory?</span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-base font-bold leading-relaxed text-zinc-600 md:text-lg">
            This page doesn't exist. Let's get you back on the right path.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-xl border-2 border-zinc-950 bg-zinc-950 px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0px_#a3e635] transition-transform hover:-translate-y-0.5 hover:translate-x-0.5"
          >
            ← Back to Trajekt
          </Link>
        </div>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
          Trajekt
        </p>
      </div>
    </main>
  )
}