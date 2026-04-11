'use client'

import { ReactNode } from 'react'

// ─── Inline SVG — Bowl Ramen line art ────────────────────────────────────────
function RamenIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 h-48 mx-auto opacity-90"
      aria-hidden="true"
    >
      {/* Bowl */}
      <path
        d="M40 95 Q40 155 100 155 Q160 155 160 95"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 95 H160"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M55 155 L45 168 Q100 178 155 168 L145 155"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Chopsticks */}
      <line x1="70" y1="55" x2="90" y2="92" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="80" y1="50" x2="100" y2="88" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

      {/* Noodles */}
      <path d="M60 90 Q70 82 80 90 Q90 98 100 90 Q110 82 120 90 Q130 98 140 90"
        stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M55 100 Q65 92 75 100 Q85 108 95 100 Q105 92 115 100 Q125 108 135 100"
        stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Egg */}
      <ellipse cx="115" cy="85" rx="14" ry="12" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="115" cy="85" r="5" fill="white" opacity="0.5" />

      {/* Steam */}
      <path d="M80 60 Q76 50 80 40 Q84 30 80 20" stroke="white" strokeWidth="2"
        strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M100 55 Q96 45 100 35 Q104 25 100 15" stroke="white" strokeWidth="2"
        strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M120 60 Q116 50 120 40 Q124 30 120 20" stroke="white" strokeWidth="2"
        strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  )
}

// ─── Left brand panel ─────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between p-12 text-white"
      style={{
        width: '40%',
        minHeight: '100vh',
        backgroundColor: 'var(--color-qf-primary)',
        background: 'linear-gradient(160deg, #E8521A 0%, #C94412 100%)',
      }}
    >
      {/* Logo */}
      <div>
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          QuickFood
        </h1>
        <p className="mt-3 text-lg opacity-90 leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
          Đặt nhanh. Giao nhanh. Ăn ngon.
        </p>
      </div>

      {/* Illustration */}
      <div className="flex flex-col items-center gap-6">
        <RamenIllustration />
        <p
          className="text-center text-sm opacity-75 leading-relaxed"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Món ngon từ những nhà hàng<br />uy tín nhất thành phố
        </p>
      </div>

      {/* Footer trust */}
      <p
        className="text-sm opacity-60"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        Trusted by 10,000+ customers in Vietnam
      </p>
    </div>
  )
}

// ─── Layout wrapper ───────────────────────────────────────────────────────────
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-qf-bg)' }}>
      <LeftPanel />

      {/* Right panel */}
      <div
        className="flex flex-col flex-1"
        style={{ backgroundColor: 'var(--color-qf-bg)' }}
      >
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-2 px-6 py-5 border-b border-qf-border">
          <span
            className="text-2xl font-bold text-qf-primary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            QuickFood
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}
