import { type ReactNode, type ElementType } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

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
  trend?: { label: string; direction: 'up' | 'down' | 'neutral'; color?: string }
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  icon?: ElementType
}) {
  const iconBgs = {
    default: 'bg-[#f3f4f6] text-[#6b7280]',
    success: 'bg-[#dcfce7] text-[#16a34a]',
    warning: 'bg-[#ffedd5] text-[#d97706]',
    danger:  'bg-[#fee2e2] text-[#dc2626]',
    info:    'bg-[#dbeafe] text-[#2563eb]',
  }
  const trendBgs = {
    up: 'bg-[#dcfce7]',
    down: 'bg-[#f3f4f6]',
    neutral: 'bg-[#fee2e2]',
  }
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl p-4 min-h-[128px] shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgs[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs text-[#111827] font-semibold mb-2 truncate">{label}</div>
          <div className="text-2xl font-semibold tracking-tight tabular-nums leading-none text-[#111827]">{value}</div>
          {sub && <div className="text-xs text-[#6b7280] mt-3 truncate">{sub}</div>}
          {trend && (
            <div className="flex items-center gap-1.5 mt-4" style={{ color: trend.color }}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${trendBgs[trend.direction]}`}>
                {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                {trend.direction === 'neutral' && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block"
                    style={{ backgroundColor: trend.color }}
                  />
                )}
              </span>
              <span className="text-xs font-medium truncate">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
