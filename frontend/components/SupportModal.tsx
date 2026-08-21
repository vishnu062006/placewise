"use client"

import { useState } from "react"
import { X, Coffee } from "lucide-react"


export default function SupportModal() {
  const [open, setOpen] = useState(false)

  const upiLink =
    `&pn=${encodeURIComponent("Trajekt")}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent("Support Trajekt")}`

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border-2 border-zinc-950 bg-white px-4 py-2 text-sm font-bold text-zinc-950 shadow-[2px_2px_0px_#18181b] transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_#18181b] active:translate-y-[2px] active:shadow-none"
      >
        <Coffee size={16} />
        Support Trajekt
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border-2 border-zinc-950 bg-white p-6 shadow-[12px_12px_0px_#18181b] sm:p-8"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-transparent bg-zinc-100 text-zinc-600 transition-colors hover:border-zinc-950 hover:bg-white hover:text-zinc-950"
              aria-label="Close support modal"
            >
              <X size={18} />
            </button>

            <div className="mb-6 text-center sm:text-left">
              <div className="mb-2 text-3xl">☕</div>

              <h2 className="text-2xl font-black text-zinc-950">
                Support the build.
              </h2>

              <p className="mt-2 text-sm font-bold leading-relaxed text-zinc-600">
                If Trajekt helped you fix your resume or prep for an interview,
                chip in to help keep the servers running and the tool free.
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl border-2 border-zinc-950 bg-[#fbfbf7] p-5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.02)]">
              <div className="rounded-xl border-2 border-zinc-950 bg-white p-3 shadow-[4px_4px_0px_#18181b]">
                <img
                  src="/assets/trajekt-upi-qr.jpg"
                  alt="Scan to support Trajekt via UPI"
                  className="h-48 w-48 object-contain"
                />
              </div>

              <p className="mt-4 text-sm font-black text-zinc-950">
                Scan with any UPI app
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                GPay • PhonePe • Paytm • BHIM • Other UPI apps 
              </p>
            </div>


            <a
              href={upiLink}
              className="mt-6 flex w-full items-center justify-center rounded-xl border-2 border-zinc-950 bg-zinc-950 px-4 py-4 text-sm font-black text-white shadow-[4px_4px_0px_#a3e635] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#a3e635] active:translate-y-[2px] active:shadow-none md:hidden"
            >
              Pay via UPI
            </a>

            <p className="mt-4 text-center text-[10px] font-bold text-zinc-400">
              Every bit helps keep Trajekt independent and running.
            </p>
          </div>
        </div>
      )}
    </>
  )
}