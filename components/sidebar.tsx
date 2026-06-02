'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Printer, FileText, Gauge,
  Wrench, Receipt, Settings, ChevronRight, Zap
} from 'lucide-react'

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/equipment', icon: Printer, label: 'Equipment' },
  { href: '/contracts', icon: FileText, label: 'Contracts' },
  { href: '/meters', icon: Gauge, label: 'Meters' },
  { href: '/service', icon: Wrench, label: 'Service' },
  { href: '/invoices', icon: Receipt, label: 'Invoices' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#00d4ff] rounded-md flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-[#0a0a0a]" fill="currentColor" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight font-mono">DealerOS</div>
            <div className="text-[10px] text-[#444]">Pacific Office Solutions</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-100
                ${active
                  ? 'bg-[#00d4ff15] text-[#00d4ff] font-medium'
                  : 'text-[#666] hover:text-[#bbb] hover:bg-[#111]'
                }
              `}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#00d4ff]' : ''}`} />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto text-[#00d4ff44]" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-[#1a1a1a]">
        <Link
          href="/settings"
          className={`
            flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-100
            ${pathname === '/settings' ? 'bg-[#00d4ff15] text-[#00d4ff]' : 'text-[#666] hover:text-[#bbb] hover:bg-[#111]'}
          `}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-2 mt-1">
          <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[10px] text-[#888] font-mono">
            JM
          </div>
          <div>
            <div className="text-xs text-[#888]">Jordan Martinez</div>
            <div className="text-[10px] text-[#444]">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
