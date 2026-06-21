'use client'

import { useRef } from 'react'

interface ShareCardProps {
  score: number
  role: string
  bandLabel?: string
  cgpa?: string | number
  skillsCount?: number
  internships?: number
  percentile?: number
  strengths?: string[]
  weaknesses?: string[]
}

const ROLE_LABELS: Record<string, string> = {
  faang_sde: 'FAANG / Top Tier',
  product_company: 'Product Companies',
  service_company: 'Service Companies',
  ml_data_role: 'Data / ML Roles',
  core_engineering: 'Core Engineering',
}

function getScoreColor(score: number) {
  if (score >= 75) return '#10B981' // Emerald
  if (score >= 50) return '#FBBF24' // Amber
  return '#F43F5E' // Rose
}

export default function ShareCard({ 
  score, 
  role, 
  percentile = score >= 80 ? 15 : score >= 60 ? 42 : 78,
  strengths = ["Strong Academic Foundation", "High DSA Problem Solving"],
  weaknesses = ["Missing System Design", "Lacks Impact Metrics"]
}: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateAndDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Base dimensions — LinkedIn optimal (1200x630)
    const W = 1200
    const H = 630
    
    // --- HIGH-DPI FIX FOR PERFECT SHARPNESS ---
    const scale = 2 
    canvas.width = W * scale
    canvas.height = H * scale
    ctx.scale(scale, scale)

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    // -----------------------------------------

    const scoreColor = getScoreColor(score)
    const roleLabel = ROLE_LABELS[role] || role

    // ── 1. Background & Aurora Gradients ──
    ctx.fillStyle = '#09090B' // zinc-950
    ctx.fillRect(0, 0, W, H)

    // Top Left Emerald Glow
    const glow1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 800)
    glow1.addColorStop(0, 'rgba(16, 185, 129, 0.15)')
    glow1.addColorStop(1, 'transparent')
    ctx.fillStyle = glow1
    ctx.fillRect(0, 0, W, H)

    // Bottom Right Cyan Glow
    const glow2 = ctx.createRadialGradient(W, H, 0, W, H, 800)
    glow2.addColorStop(0, 'rgba(34, 211, 238, 0.12)')
    glow2.addColorStop(1, 'transparent')
    ctx.fillStyle = glow2
    ctx.fillRect(0, 0, W, H)

    // ── 2. Header: Logo & Target Role ──
    // Logo (Left)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.font = '900 36px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText('place', 80, 60)
    const pWidth = ctx.measureText('place').width
    ctx.fillStyle = '#10B981'
    ctx.fillText('wise', 80 + pWidth, 60)

    // Target Role Pill (Right)
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
    const roleText = `TARGET: ${roleLabel.toUpperCase()}`
    const roleW = ctx.measureText(roleText).width + 40
    const roleX = W - roleW - 80
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.beginPath()
    ctx.roundRect(roleX, 52, roleW, 44, 22)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.stroke()
    
    ctx.fillStyle = '#E4E4E7'
    ctx.fillText(roleText, roleX + 20, 65)

    // ── 3. Left Side: The Hero Score ──
    const cx = 340
    const cy = 320
    const radius = 130
    const strokeW = 18

    // Title
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Placement Readiness', cx, 110)

    // Background ring
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = strokeW
    ctx.stroke()

    // Active Score Ring
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (score / 100) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.strokeStyle = scoreColor
    ctx.lineWidth = strokeW
    ctx.lineCap = 'round'
    ctx.shadowColor = scoreColor
    ctx.shadowBlur = 30
    ctx.stroke()
    ctx.shadowBlur = 0 

    // Score Number
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 100px system-ui, -apple-system, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(Math.round(score)), cx, cy - 10)

    // Out of 100
    ctx.fillStyle = '#71717A' // zinc-500
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
    ctx.fillText('OUT OF 100', cx, cy + 60)

    // Percentile Badge
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)'
    ctx.beginPath()
    ctx.roundRect(cx - 100, cy + 170, 200, 40, 20)
    ctx.fill()
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)'
    ctx.stroke()
    
    ctx.fillStyle = '#10B981'
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(`TOP ${percentile}% RANK`, cx, cy + 190)

    // ── 4. Right Side: Clean Insights Grid ──
    const rx = 660 // Safe distance from the circle
    
    // Strengths Card
    ctx.fillStyle = 'rgba(16, 185, 129, 0.03)'
    ctx.beginPath()
    ctx.roundRect(rx, 160, 460, 140, 24)
    ctx.fill()
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)'
    ctx.stroke()

    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#10B981'
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif'
    ctx.fillText('TOP STRENGTHS', rx + 30, 190)

    ctx.font = '600 18px system-ui, -apple-system, sans-serif'
    strengths.slice(0, 2).forEach((s, i) => {
      ctx.fillStyle = '#10B981'
      ctx.fillText('✓', rx + 30, 230 + (i * 35))
      ctx.fillStyle = '#E4E4E7'
      ctx.fillText(s, rx + 56, 230 + (i * 35))
    })

    // Weaknesses Card
    ctx.fillStyle = 'rgba(244, 63, 94, 0.03)'
    ctx.beginPath()
    ctx.roundRect(rx, 340, 460, 140, 24)
    ctx.fill()
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.15)'
    ctx.stroke()

    ctx.fillStyle = '#F43F5E'
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif'
    ctx.fillText('CRITICAL MISSING', rx + 30, 370)

    ctx.font = '600 18px system-ui, -apple-system, sans-serif'
    weaknesses.slice(0, 2).forEach((w, i) => {
      ctx.fillStyle = '#F43F5E'
      ctx.fillText('⚠', rx + 30, 410 + (i * 35))
      ctx.fillStyle = '#E4E4E7'
      ctx.fillText(w, rx + 56, 410 + (i * 35))
    })

    // ── 5. Footer Viral CTA ──
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 24px system-ui, -apple-system, sans-serif'
    ctx.fillText('Can you beat this score?', W / 2, 550)

    ctx.fillStyle = '#71717A'
    ctx.font = '600 18px system-ui, -apple-system, sans-serif'
    ctx.fillText('Analyze your resume at ', W / 2 - 75, 585)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText('                            placewise-eta.vercel.app', W / 2 + 75, 585)

    // ── Download Trigger ──
    const link = document.createElement('a')
    link.download = `placewise-score-${Math.round(score)}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <button
        onClick={generateAndDownload}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0077b5]/10 px-6 py-3 text-sm font-bold text-[#0077b5] transition-all hover:scale-105 hover:bg-[#0077b5]/20 shadow-[0_0_20px_rgba(0,119,181,0.1)]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        Share to LinkedIn
      </button>
    </>
  )
}