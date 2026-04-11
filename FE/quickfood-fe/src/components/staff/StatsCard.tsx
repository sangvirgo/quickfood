'use client'

import { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: number | string
  icon: ReactNode
  colorClass: string
  iconBgColor: string
}

export default function StatsCard({ label, value, icon, colorClass, iconBgColor }: StatsCardProps) {
  return (
    <div className="bg-white border border-qf-border rounded-xl p-5 shadow-sm flex items-center gap-4">
      <div 
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0`}
        style={{ backgroundColor: iconBgColor, color: colorClass }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-qf-secondary leading-tight">{value}</p>
        <p className="text-sm font-medium text-qf-muted">{label}</p>
      </div>
    </div>
  )
}
