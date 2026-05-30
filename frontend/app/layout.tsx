import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PlaceWise — Know Your Placement Readiness',
  description: 'Upload your resume. Get your placement score, skill gaps, and a personalized roadmap. Built for engineering students.',
  keywords: 'placement, resume analysis, FAANG, engineering, career readiness',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}