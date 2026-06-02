import { type ReactNode } from 'react'

export function PageHeader({ title, subtitle, actions, children }: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-lg font-semibold text-[#e8e8e8] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#555] mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}
