'use client'

import React from 'react'

interface AnalysisLoadingProps {
  steps: string[]
  activeStep: number
}

export default function AnalysisLoading({ steps, activeStep }: AnalysisLoadingProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center py-12">
      
      {/* Premium AI Engine Core Animation */}
      <div className="relative mb-12 flex h-32 w-32 items-center justify-center">
        {/* Ambient breathing glow */}
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-[#10B981]/30 to-[#22D3EE]/30 blur-2xl" />
        
        {/* Outer spinning ring */}
        <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-y-[3px] border-[#10B981]/60" />
        
        {/* Inner counter-spinning ring */}
        <div className="absolute inset-3 animate-[spin_2s_linear_infinite_reverse] rounded-full border-x-[3px] border-[#22D3EE]/60" />
        
        {/* Solid energy core */}
        <div className="absolute inset-8 animate-pulse rounded-full bg-gradient-to-tr from-[#10B981] to-[#22D3EE] shadow-[0_0_30px_rgba(16,185,129,0.5)]" />
      </div>

      <h2 className="mb-10 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
        Evaluating Candidate Profile
      </h2>

      {/* Dynamic Checklist */}
      <div className="flex w-full max-w-sm flex-col gap-5">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeStep
          const isActive = idx === activeStep
          const isPending = idx > activeStep

          return (
            <div 
              key={idx} 
              className={`flex items-center gap-4 transition-all duration-500 ${
                isActive ? 'scale-105 transform opacity-100' : 
                isCompleted ? 'opacity-60' : 
                'opacity-30'
              }`}
            >
              {/* Status Icon */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                {isCompleted ? (
                  <svg className="h-5 w-5 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isActive ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-[3px] border-[#10B981] border-t-transparent" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-zinc-600" />
                )}
              </div>

              {/* Status Text */}
              <span className={`text-base font-medium transition-colors duration-300 ${
                isActive ? 'text-white text-lg font-bold' : 
                isCompleted ? 'text-zinc-300' : 
                'text-zinc-500'
              }`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
      
      <p className="mt-12 text-xs font-bold uppercase tracking-widest text-zinc-500 animate-pulse">
        Please do not close this window
      </p>
    </div>
  )
}