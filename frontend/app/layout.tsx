import type { Metadata, Viewport } from 'next'
import React from 'react'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Providers from './providers'
import { LenisProvider } from '@/components/LenisProvider'

export const metadata: Metadata = {
  metadataBase: new URL('https://trajekt.in'),
  title: 'Trajekt | AI Resume Analyzer & JD Matcher for All',
  description: 'Upload your resume. Score it against exact job descriptions, identify critical skill gaps, and execute a personalized 4-week placement roadmap.',
  keywords: [
    'software engineer resume', 
    'ATS resume checker', 
    'JD matcher', 
    'placement prep', 
    'FAANG resume', 
    'tech resume review',
  ],
  authors: [{ name: 'Trajekt' }],
  creator: 'Trajekt',
  publisher: 'Trajekt',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://trajekt.in',
    title: 'Trajekt | Know your shortlist chances before recruiters do.',
    description: 'Score your tech resume against actual JD requirements and get a step-by-step weekly execution plan.',
    siteName: 'Trajekt',
    // Add this image to your public folder later for link previews
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Trajekt Preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trajekt | AI Resume Analyzer',
    description: 'Stop getting filtered by the ATS. Match your resume against exact job descriptions.',
    images: ['/opengraph-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  alternates: {
    canonical: 'https://trajekt.in',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbfbf7', // Matches your brutalist background
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Changed bg-black to your new brutalist light background
    <html lang="en" className="bg-[#fbfbf7] selection:bg-lime-300 selection:text-zinc-950">
      <body>
        <LenisProvider>
          <Providers>
            {children}
          </Providers>
        </LenisProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}