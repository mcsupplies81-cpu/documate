import { type ReactNode, type ElementType } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#e7e5e1] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)] ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 border-b border-[#eeecea] flex items-center justify-between ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
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
    default: 'bg-[#f7f7f4] text-[#737373]',
    success: 'bg-[#eef7f1] text-[#15803d]',
    warning: 'bg-[#fff7ed] text-[#b45309]',
    danger:  'bg-[#fff1f2] text-[#be123c]',
    info:    'bg-[#eff6ff] text-[#2563eb]',
  }
  const trendBgs = {
    up: 'bg-[#eef7f1] text-[#15803d]',
    down: 'bg-[#f7f7f4] text-[#737373]',
    neutral: 'bg-[#fff1f2] text-[#be123c]',
  }
  return (
    <div className="bg-white border border-[#e7e5e1] rounded-2xl p-4 min-h-[116px] shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-[#737373] font-medium mb-2 truncate">{label}</div>
          <div className="text-[22px] font-semibold tracking-[-0.025em] tabular-nums leading-none text-[#171717]">{value}</div>
          {sub && <div className="text-xs text-[#737373] mt-3 truncate">{sub}</div>}
        </div>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgs[color]}`}>
            <Icon className="w-4 h-4" strokeWidth={1.8} />
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-4" style={{ color: trend.color }}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${trendBgs[trend.direction]}`}>
            {trend.direction === 'up' && <TrendingUp className="w-3 h-3" strokeWidth={1.8} />}
            {trend.direction === 'down' && <TrendingDown className="w-3 h-3" strokeWidth={1.8} />}
            {trend.direction === 'neutral' && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block"
                style={{ backgroundColor: trend.color }}
              />
            )}
          </span>
          <span className="text-[11px] font-medium truncate text-[#737373]">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
