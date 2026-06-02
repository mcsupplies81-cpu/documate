import { type ReactNode, type ElementType } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#ebebeb] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>
}

export function StatCard({ label, value, sub, trend, color = 'default', icon: Icon }: {
  label: string
  value: string | number
  sub?: string
  trend?: { value: string; positive?: boolean }
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  icon?: ElementType
}) {
  const valueColors = {
    default: 'text-[#111827]',
    success: 'text-[#16a34a]',
    warning: 'text-[#d97706]',
    danger:  'text-[#dc2626]',
    info:    'text-[#5c5fef]',
  }
  const iconBgs = {
    default: 'bg-[#f3f4f6] text-[#6b7280]',
    success: 'bg-[#f0fdf4] text-[#16a34a]',
    warning: 'bg-[#fffbeb] text-[#d97706]',
    danger:  'bg-[#fef2f2] text-[#dc2626]',
    info:    'bg-[#eef2ff] text-[#5c5fef]',
  }
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between mb-4">
        <div className="text-[13px] text-[#6b7280] font-medium">{label}</div>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgs[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className={`text-[28px] font-semibold tracking-tight tabular-nums leading-none ${valueColors[color]}`}>{value}</div>
      {sub && <div className="text-xs text-[#9ca3af] mt-2">{sub}</div>}
      {trend && (
        <div className={`text-xs mt-2 font-medium ${trend.positive ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </div>
  )
}
