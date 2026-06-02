'use client'
import { type ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'muted'

const styles: Record<BadgeVariant, string> = {
  default:  'bg-[#f7f7f4] text-[#737373] border-[#e7e5e1]',
  success:  'bg-[#eff8f1] text-[#15803d] border-[#d8eadb]',
  warning:  'bg-[#fff8eb] text-[#b45309] border-[#f4dfb8]',
  danger:   'bg-[#fff5f5] text-[#b91c1c] border-[#f1d3d3]',
  info:     'bg-[#eff6ff] text-[#2563eb] border-[#dbeafe]',
  purple:   'bg-[#f7f2ff] text-[#6d28d9] border-[#eadcff]',
  muted:    'bg-[#f7f7f4] text-[#a3a3a3] border-[#e7e5e1]',
}

const dotColors: Record<BadgeVariant, string> = {
  default:  'bg-[#a3a3a3]',
  success:  'bg-[#22c55e]',
  warning:  'bg-[#f59e0b]',
  danger:   'bg-[#ef4444]',
  info:     'bg-[#3b82f6]',
  purple:   'bg-[#8b5cf6]',
  muted:    'bg-[#d6d3ce]',
}

export function Badge({ children, variant = 'default', className = '' }: {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 ${styles[variant]} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />
      {children}
    </span>
  )
}
