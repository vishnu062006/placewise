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
  if (score >= 75) return '#a3e635' // lime-400
  if (score >= 50) return '#fcd34d' // amber-300
  return '#fda4af' // rose-300
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

    // ── 1. Brutalist Background & Grid ──
    ctx.fillStyle = '#fbfbf7' // Off-white cream
    ctx.fillRect(0, 0, W, H)

    // Dot Grid Pattern
    ctx.fillStyle = '#e4e4e7' // zinc-200
    for (let x = 16; x < W; x += 32) {
      for (let y = 16; y < H; y += 32) {
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Outer Thick Border
    ctx.lineWidth = 12
    ctx.strokeStyle = '#18181b' // zinc-950
    ctx.strokeRect(0, 0, W, H)

    // ── 2. Header: Logo & Target Role ──
    // Logo (Left)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.font = '900 42px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = '#18181b'
    ctx.fillText('Trajekt', 80, 60)

    // Target Role Pill (Right)
    ctx.font = '900 16px system-ui, -apple-system, sans-serif'
    const roleText = `TARGET: ${roleLabel.toUpperCase()}`
    const roleW = ctx.measureText(roleText).width + 40
    const roleX = W - roleW - 80
    
    // Pill Shadow
    ctx.fillStyle = '#18181b'
    ctx.beginPath()
    ctx.roundRect(roleX + 6, 52 + 6, roleW, 44, 22)
    ctx.fill()
    
    // Pill Body
    ctx.fillStyle = '#a5b4fc' // indigo-300
    ctx.beginPath()
    ctx.roundRect(roleX, 52, roleW, 44, 22)
    ctx.fill()
    ctx.strokeStyle = '#18181b'
    ctx.lineWidth = 4
    ctx.stroke()
    
    ctx.fillStyle = '#18181b'
    ctx.fillText(roleText, roleX + 20, 65)

    // ── 3. Left Side: The Hero Score ──
    const cx = 340
    const cy = 320
    const radius = 130
    const strokeW = 24

    // Title
    ctx.fillStyle = '#18181b'
    ctx.font = '900 36px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Placement Readiness', cx, 110)

    // Background ring
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = '#f4f4f5' // zinc-100
    ctx.lineWidth = strokeW
    ctx.stroke()

    // Active Score Ring
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (score / 100) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.strokeStyle = scoreColor
    ctx.lineWidth = strokeW
    ctx.lineCap = 'square'
    ctx.stroke()

    // Score Number
    ctx.fillStyle = '#18181b'
    ctx.font = '900 110px system-ui, -apple-system, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(Math.round(score)), cx, cy - 5)

    // Out of 100
    ctx.fillStyle = '#71717A' // zinc-500
    ctx.font = '900 18px system-ui, -apple-system, sans-serif'
    ctx.fillText('OUT OF 100', cx, cy + 65)

    // Percentile Badge Shadow
    ctx.fillStyle = '#18181b'
    ctx.beginPath()
    ctx.roundRect(cx - 100 + 6, cy + 170 + 6, 200, 44, 22)
    ctx.fill()

    // Percentile Badge Body
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(cx - 100, cy + 170, 200, 44, 22)
    ctx.fill()
    ctx.strokeStyle = '#18181b'
    ctx.lineWidth = 4
    ctx.stroke()
    
    ctx.fillStyle = '#18181b'
    ctx.font = '900 16px system-ui, -apple-system, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(`TOP ${percentile}% RANK`, cx, cy + 192)

    // ── 4. Right Side: Clean Insights Grid ──
    const rx = 660 // Safe distance from the circle
    
    // Strengths Card Shadow
    ctx.fillStyle = '#18181b'
    ctx.beginPath()
    ctx.roundRect(rx + 10, 160 + 10, 460, 140, 24)
    ctx.fill()

    // Strengths Card Body
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(rx, 160, 460, 140, 24)
    ctx.fill()
    ctx.stroke()

    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#18181b'
    ctx.font = '900 14px system-ui, -apple-system, sans-serif'
    ctx.fillText('TOP STRENGTHS', rx + 30, 190)

    ctx.font = '800 20px system-ui, -apple-system, sans-serif'
    strengths.slice(0, 2).forEach((s, i) => {
      // Checkmark box
      ctx.fillStyle = '#a3e635' // lime-400
      ctx.beginPath()
      ctx.roundRect(rx + 30, 225 + (i * 40), 24, 24, 6)
      ctx.fill()
      ctx.stroke()
      
      ctx.fillStyle = '#18181b'
      ctx.font = '900 14px system-ui, -apple-system, sans-serif'
      ctx.fillText('✓', rx + 36, 230 + (i * 40))

      ctx.font = '800 20px system-ui, -apple-system, sans-serif'
      ctx.fillText(s, rx + 66, 225 + (i * 40))
    })

    // Weaknesses Card Shadow
    ctx.fillStyle = '#18181b'
    ctx.beginPath()
    ctx.roundRect(rx + 10, 340 + 10, 460, 140, 24)
    ctx.fill()

    // Weaknesses Card Body
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(rx, 340, 460, 140, 24)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#18181b'
    ctx.font = '900 14px system-ui, -apple-system, sans-serif'
    ctx.fillText('CRITICAL MISSING', rx + 30, 370)

    ctx.font = '800 20px system-ui, -apple-system, sans-serif'
    weaknesses.slice(0, 2).forEach((w, i) => {
      // X box
      ctx.fillStyle = '#fda4af' // rose-300
      ctx.beginPath()
      ctx.roundRect(rx + 30, 405 + (i * 40), 24, 24, 6)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#18181b'
      ctx.font = '900 14px system-ui, -apple-system, sans-serif'
      ctx.fillText('✕', rx + 37, 410 + (i * 40))

      ctx.font = '800 20px system-ui, -apple-system, sans-serif'
      ctx.fillText(w, rx + 66, 405 + (i * 40))
    })

    // ── 5. Footer Viral CTA ──
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    ctx.fillStyle = '#18181b'
    ctx.font = '900 26px system-ui, -apple-system, sans-serif'
    ctx.fillText('Can you beat this score?', W / 2, 550)

    ctx.fillStyle = '#71717A'
    ctx.font = '800 18px system-ui, -apple-system, sans-serif'
    ctx.fillText('Analyze your resume at ', W / 2 - 50, 585)
    ctx.fillStyle = '#18181b'
    ctx.fillText('          trajekt.in', W / 2 + 75, 585)

    // ── Download Trigger ──
    const link = document.createElement('a')
    link.download = `trajekt-score-${Math.round(score)}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <button
        onClick={generateAndDownload}
        className="flex items-center gap-3 rounded-xl border-2 border-zinc-950 bg-[#0A66C2] px-6 py-4 text-sm font-black text-white shadow-[4px_4px_0px_#18181b] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#18181b] active:translate-y-[2px] active:shadow-none"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        Share to LinkedIn
      </button>
    </>
  )
}