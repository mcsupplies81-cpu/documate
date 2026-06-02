'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Printer, FileText, Gauge,
  Wrench, Receipt, Settings, Zap, Search,
  BarChart2, Package, ShoppingCart, CalendarDays,
  CreditCard, Store
} from 'lucide-react'
import { useCommandStore } from '@/lib/store'

const navGroups = [
  {
    label: 'Operations',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/customers', icon: Users, label: 'Customers' },
      { href: '/equipment', icon: Printer, label: 'Equipment' },
      { href: '/contracts', icon: FileText, label: 'Contracts' },
    ],
  },
  {
    label: 'Service',
    items: [
      { href: '/meters', icon: Gauge, label: 'Meters' },
      { href: '/dispatch', icon: CalendarDays, label: 'Dispatch' },
      { href: '/service', icon: Wrench, label: 'Service Calls' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/invoices', icon: Receipt, label: 'Invoices' },
      { href: '/ar', icon: CreditCard, label: 'AR Aging' },
      { href: '/reports', icon: BarChart2, label: 'Reports' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { href: '/parts', icon: Package, label: 'Parts' },
      { href: '/vendors', icon: Store, label: 'Vendors' },
      { href: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
    ],
  },
]

function NavItem({ href, icon: Icon, label, active }: {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2.5 px-3 h-8 text-[13px] rounded-lg transition-all duration-100
        ${active
          ? 'bg-[#eef2ff] text-[#5c5fef] font-medium'
          : 'text-[#6b7280] hover:text-[#111827] hover:bg-[#f5f5f5]'
        }
      `}
    >
      <Icon className={`w-[15px] h-[15px] flex-shrink-0 ${active ? 'text-[#5c5fef]' : 'text-[#9ca3af]'}`} />
      {label}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { toggle } = useCommandStore()

  return (
    <aside className="sticky top-0 h-screen w-[220px] shrink-0 bg-white border-r border-[#f0f0f0] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#5c5fef] rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(92,95,239,0.3)]">
            <Zap className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#111827] tracking-tight">DealerOS</div>
            <div className="text-[10px] text-[#b0b7c3]">Pacific Office Solutions</div>
          </div>
        </Link>
      </div>

      {/* Search / CMD+K */}
      <div className="px-3 pb-3">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-2 px-3 h-8 rounded-lg bg-[#f5f5f5] text-[#9ca3af] hover:bg-[#efefef] hover:text-[#6b7280] transition-all text-xs"
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-[10px] bg-white rounded px-1 py-0.5 font-mono text-[#b0b7c3] shadow-[0_1px_2px_rgba(0,0,0,0.08)]">⌘K</kbd>
        </button>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold text-[#c0c6d4] uppercase tracking-widest">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={active}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 border-t border-[#f0f0f0] space-y-0.5">
        <NavItem
          href="/settings"
          icon={Settings}
          label="Settings"
          active={pathname === '/settings'}
        />
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg hover:bg-[#f5f5f5] transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-[#eef2ff] flex items-center justify-center text-[10px] text-[#5c5fef] font-bold flex-shrink-0">
            JM
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#111827] truncate">Jordan Martinez</div>
            <div className="text-[10px] text-[#9ca3af]">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
