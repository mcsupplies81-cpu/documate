'use client'
import { type ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'muted'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[#1a1a1a] text-[#888] border border-[#2a2a2a]',
  success: 'bg-[#22c55e1a] text-[#22c55e] border border-[#22c55e33]',
  warning: 'bg-[#f59e0b1a] text-[#f59e0b] border border-[#f59e0b33]',
  danger: 'bg-[#ef44441a] text-[#ef4444] border border-[#ef444433]',
  info: 'bg-[#00d4ff1a] text-[#00d4ff] border border-[#00d4ff33]',
  purple: 'bg-[#a855f71a] text-[#a855f7] border border-[#a855f733]',
  muted: 'bg-[#1a1a1a] text-[#555] border border-[#222]',
}

export function Badge({ children, variant = 'default', className = '' }: {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
