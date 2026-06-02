import { type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-1 mb-4 text-xs text-[#9ca3af]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3 text-[#d1d5db]" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-[#6b7280] transition-colors">{item.label}</Link>
          ) : (
            <span className="text-[#374151] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function PageHeader({ title, subtitle, actions, children, breadcrumb }: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children?: ReactNode
  breadcrumb?: { label: string; href?: string }[]
}) {
  return (
    <div className="mb-8">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-[#9ca3af] mt-1">{subtitle}</p>}
          {children}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0 ml-4 mt-1">{actions}</div>}
      </div>
    </div>
  )
}
