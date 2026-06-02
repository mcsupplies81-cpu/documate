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
        flex items-center gap-2.5 px-3 h-8 text-[13px] rounded-[10px] transition-colors duration-150
        ${active
          ? 'bg-white text-[#171717] font-medium shadow-[0_1px_2px_rgba(17,17,17,0.04)] ring-1 ring-[#e7e5e1]'
          : 'text-[#737373] hover:text-[#171717] hover:bg-[#efede9]'
        }
      `}
    >
      <Icon className={`w-[15px] h-[15px] flex-shrink-0 ${active ? 'text-[#171717]' : 'text-[#a3a3a3]'}`} strokeWidth={1.8} />
      {label}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { toggle } = useCommandStore()

  return (
    <aside className="sticky top-0 h-screen w-[232px] shrink-0 bg-[#f7f7f4] border-r border-[#e7e5e1] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#111111] rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-[0_1px_2px_rgba(17,17,17,0.14)]">
            <Zap className="w-4 h-4 text-white" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#171717] tracking-tight">DocuMate</div>
            <div className="text-[10px] text-[#a3a3a3]">Pacific Office Solutions</div>
          </div>
        </Link>
      </div>

      {/* Search / CMD+K */}
      <div className="px-3 pb-4">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-2 px-3 h-8 rounded-[10px] bg-white border border-[#e7e5e1] text-[#a3a3a3] hover:text-[#737373] hover:border-[#d6d3ce] transition-colors text-xs shadow-[0_1px_2px_rgba(17,17,17,0.03)]"
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.8} />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-[10px] bg-[#f7f7f4] border border-[#eeecea] rounded-md px-1 py-0.5 font-mono text-[#a3a3a3]">⌘K</kbd>
        </button>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[10px] font-medium text-[#a3a3a3] tracking-wide">
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
      <div className="px-3 pb-4 pt-3 border-t border-[#e7e5e1] space-y-0.5">
        <NavItem
          href="/settings"
          icon={Settings}
          label="Settings"
          active={pathname === '/settings'}
        />
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-[10px] hover:bg-[#efede9] transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-white border border-[#e7e5e1] flex items-center justify-center text-[10px] text-[#171717] font-semibold flex-shrink-0">
            JM
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#171717] truncate">Jordan Martinez</div>
            <div className="text-[10px] text-[#a3a3a3]">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
