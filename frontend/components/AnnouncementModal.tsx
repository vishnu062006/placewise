'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Zap, Map, Share2, Sparkles } from 'lucide-react'

interface AnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
}

const features = [
  {
    icon: Target,
    title: 'Company Compatibility Engine',
    desc: 'See exactly where you stand with FAANG and top tech giants.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Resume analysis is now 3x faster.',
  },
  {
    icon: Map,
    title: 'Smarter Roadmaps',
    desc: 'Precision-targeted skill gap analysis.',
  },
  {
    icon: Share2,
    title: 'Share Your Win',
    desc: 'Generate sleek, one-click share cards for LinkedIn.',
  },
]

export default function AnnouncementModal({ isOpen, onClose }: AnnouncementModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Glassmorphic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Premium Linear-Style Modal Card */}
          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/95 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8"
          >
            {/* Subtle top edge highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Header Area */}
            <div className="mb-8">
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                <Sparkles className="h-6 w-6 text-emerald-400" />
                <span className="bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                  PlaceWise 2.0 is live.
                </span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                Your placement intelligence just got a massive upgrade. Smarter analysis, deep company compatibility, and a whole new look.
              </p>
            </div>

            {/* Vertical Feature List */}
            <div className="mb-8 flex flex-col gap-6">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02]">
                    <feat.icon className="h-5 w-5 text-zinc-300" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white/90">{feat.title}</h4>
                    <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-[#0A0A0A] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98]"
            >
              Explore My Results
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
