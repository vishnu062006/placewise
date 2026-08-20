import { FaCheck, FaSpinner } from 'react-icons/fa'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
})

export default function AnalysisLoading({ steps, activeStep }: { steps: string[], activeStep: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      
      {/* Brutalist Loader */}
      <div className="mb-10 flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-zinc-950 bg-lime-300 shadow-[6px_6px_0px_#18181b]">
        <FaSpinner className="animate-spin text-4xl text-zinc-950" />
      </div>

      <div className="w-full max-w-sm space-y-5 text-left">
        {steps.map((step, index) => {
          const isPast = index < activeStep
          const isActive = index === activeStep

          return (
            <div key={index} className="flex items-center gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                isPast ? 'border-zinc-950 bg-lime-300 text-zinc-950 shadow-[2px_2px_0px_#18181b]' :
                isActive ? 'border-zinc-950 bg-zinc-950 text-white shadow-[2px_2px_0px_#18181b] scale-110' :
                'border-zinc-200 bg-zinc-50 text-transparent'
              }`}>
                {isPast ? <FaCheck className="w-4 h-4" /> : isActive ? <FaSpinner className="w-4 h-4 animate-spin" /> : null}
              </div>
              <span className={`text-sm md:text-base font-bold transition-colors duration-300 ${
                isPast ? 'text-zinc-950' :
                isActive ? 'text-zinc-950 font-black' :
                'text-zinc-400'
              }`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-12 inline-flex items-center gap-3 rounded-full border-2 border-zinc-950 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-zinc-950 shadow-[4px_4px_0px_#18181b]">
        <span className="flex h-2 w-2 animate-pulse rounded-full bg-rose-500"></span>
        Please do not close this window
      </div>
    </div>
  )
}