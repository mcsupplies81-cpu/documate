'use client'
import { type ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'muted'

const dotColors: Record<BadgeVariant, string> = {
  default:  'bg-[#9ca3af]',
  success:  'bg-[#16a34a]',
  warning:  'bg-[#d97706]',
  danger:   'bg-[#dc2626]',
  info:     'bg-[#2563eb]',
  purple:   'bg-[#7c3aed]',
  muted:    'bg-[#d1d5db]',
}

const textColors: Record<BadgeVariant, string> = {
  default:  'text-[#6b7280]',
  success:  'text-[#16a34a]',
  warning:  'text-[#d97706]',
  danger:   'text-[#dc2626]',
  info:     'text-[#2563eb]',
  purple:   'text-[#7c3aed]',
  muted:    'text-[#9ca3af]',
}

export function Badge({ children, variant = 'default', className = '' }: {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${textColors[variant]} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />
      {children}
    </span>
  )
}
