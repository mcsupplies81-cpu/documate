import { type ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[#111] border border-[#1e1e1e] rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-4 py-3 border-b border-[#1e1e1e] flex items-center justify-between ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>
}

export function StatCard({ label, value, sub, trend, color = 'default' }: {
  label: string
  value: string | number
  sub?: string
  trend?: { value: string; positive?: boolean }
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const colors = {
    default: 'text-[#e8e8e8]',
    success: 'text-[#22c55e]',
    warning: 'text-[#f59e0b]',
    danger: 'text-[#ef4444]',
    info: 'text-[#00d4ff]',
  }
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-4">
      <div className="text-xs text-[#555] uppercase tracking-wider font-medium mb-2">{label}</div>
      <div className={`text-2xl font-mono font-semibold tracking-tight ${colors[color]}`}>{value}</div>
      {sub && <div className="text-xs text-[#555] mt-1">{sub}</div>}
      {trend && (
        <div className={`text-xs mt-1 ${trend.positive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </div>
  )
}
