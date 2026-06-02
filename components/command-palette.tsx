'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, Printer, FileText, Gauge, Wrench, Receipt, Plus, ArrowRight, Hash } from 'lucide-react'
import { useCommandStore } from '@/lib/store'
import { MOCK_CUSTOMERS, MOCK_EQUIPMENT, MOCK_CONTRACTS, MOCK_SERVICE_CALLS } from '@/lib/mock-data'

interface CommandItem {
  id: string
  label: string
  sub?: string
  icon: React.ReactNode
  href?: string
  action?: () => void
  category: string
  keywords?: string
}

function buildCommands(query: string): CommandItem[] {
  const q = query.toLowerCase().trim()

  const staticCommands: CommandItem[] = [
    { id: 'nav-dashboard', label: 'Dashboard', icon: <Hash className="w-4 h-4 text-[#2563eb]" />, href: '/dashboard', category: 'Navigation', keywords: 'home overview metrics' },
    { id: 'nav-customers', label: 'Customers', icon: <Users className="w-4 h-4 text-[#a3a3a3]" />, href: '/customers', category: 'Navigation' },
    { id: 'nav-equipment', label: 'Equipment', icon: <Printer className="w-4 h-4 text-[#a3a3a3]" />, href: '/equipment', category: 'Navigation' },
    { id: 'nav-contracts', label: 'Contracts', icon: <FileText className="w-4 h-4 text-[#a3a3a3]" />, href: '/contracts', category: 'Navigation' },
    { id: 'nav-meters', label: 'Meter Collection', icon: <Gauge className="w-4 h-4 text-[#a3a3a3]" />, href: '/meters', category: 'Navigation' },
    { id: 'nav-service', label: 'Service Calls', icon: <Wrench className="w-4 h-4 text-[#a3a3a3]" />, href: '/service', category: 'Navigation' },
    { id: 'nav-invoices', label: 'Invoices', icon: <Receipt className="w-4 h-4 text-[#a3a3a3]" />, href: '/invoices', category: 'Navigation' },
    { id: 'new-customer', label: 'New Customer', icon: <Plus className="w-4 h-4 text-[#16a34a]" />, href: '/customers/new', category: 'Actions' },
    { id: 'new-equipment', label: 'Add Equipment', icon: <Plus className="w-4 h-4 text-[#16a34a]" />, href: '/equipment/new', category: 'Actions' },
    { id: 'new-contract', label: 'New Contract', icon: <Plus className="w-4 h-4 text-[#16a34a]" />, href: '/contracts/new', category: 'Actions' },
    { id: 'new-service-call', label: 'New Service Call', icon: <Plus className="w-4 h-4 text-[#16a34a]" />, href: '/service/new', category: 'Actions' },
    { id: 'run-billing', label: 'Run Billing', sub: 'Generate invoices for current period', icon: <Receipt className="w-4 h-4 text-[#2563eb]" />, href: '/invoices/run', category: 'Actions' },
    { id: 'enter-meters', label: 'Enter Meter Readings', icon: <Gauge className="w-4 h-4 text-[#d97706]" />, href: '/meters', category: 'Actions' },
  ]

  if (!q) return staticCommands.slice(0, 8)

  const results: CommandItem[] = []

  // Filter static commands
  staticCommands.forEach(cmd => {
    if (
      cmd.label.toLowerCase().includes(q) ||
      cmd.sub?.toLowerCase().includes(q) ||
      cmd.keywords?.includes(q)
    ) results.push(cmd)
  })

  // Search customers
  MOCK_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
  ).slice(0, 4).forEach(c => {
    results.push({
      id: `customer-${c.id}`,
      label: c.name,
      sub: c.email || c.phone || '',
      icon: <Users className="w-4 h-4 text-[#a3a3a3]" />,
      href: `/customers/${c.id}`,
      category: 'Customers',
    })
  })

  // Search equipment
  MOCK_EQUIPMENT.filter(e =>
    e.make.toLowerCase().includes(q) ||
    e.model.toLowerCase().includes(q) ||
    e.serial_number.toLowerCase().includes(q) ||
    e.customer?.name.toLowerCase().includes(q)
  ).slice(0, 3).forEach(e => {
    results.push({
      id: `equipment-${e.id}`,
      label: `${e.make} ${e.model}`,
      sub: `S/N ${e.serial_number} · ${e.customer?.name || ''}`,
      icon: <Printer className="w-4 h-4 text-[#a3a3a3]" />,
      href: `/equipment/${e.id}`,
      category: 'Equipment',
    })
  })

  // Search contracts
  MOCK_CONTRACTS.filter(c =>
    c.contract_number.toLowerCase().includes(q) ||
    c.customer?.name.toLowerCase().includes(q)
  ).slice(0, 3).forEach(c => {
    results.push({
      id: `contract-${c.id}`,
      label: c.contract_number,
      sub: c.customer?.name || '',
      icon: <FileText className="w-4 h-4 text-[#a3a3a3]" />,
      href: `/contracts/${c.id}`,
      category: 'Contracts',
    })
  })

  // Search service calls
  MOCK_SERVICE_CALLS.filter(sc =>
    sc.call_number.toLowerCase().includes(q) ||
    sc.customer?.name.toLowerCase().includes(q) ||
    sc.problem_description?.toLowerCase().includes(q)
  ).slice(0, 3).forEach(sc => {
    results.push({
      id: `service-${sc.id}`,
      label: sc.call_number,
      sub: `${sc.customer?.name} · ${sc.problem_description?.slice(0, 50)}`,
      icon: <Wrench className="w-4 h-4 text-[#a3a3a3]" />,
      href: `/service/${sc.id}`,
      category: 'Service Calls',
    })
  })

  return results.slice(0, 12)
}

export function CommandPalette() {
  const { open, setOpen } = useCommandStore()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands = buildCommands(query)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, setOpen])

  useEffect(() => {
    if (!open) return

    const timer = window.setTimeout(() => {
      setQuery('')
      setSelectedIdx(0)
      inputRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, commands.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter') {
      const cmd = commands[selectedIdx]
      if (cmd) { execute(cmd) }
    }
  }

  const execute = useCallback((cmd: CommandItem) => {
    if (cmd.href) router.push(cmd.href)
    if (cmd.action) cmd.action()
    setOpen(false)
    setQuery('')
  }, [router, setOpen])

  // Group commands by category
  const grouped = commands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, CommandItem[]>)

  let globalIdx = 0

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh]">
      <div className="absolute inset-0 bg-[#171717]/20 backdrop-blur-[3px]" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl mx-4">
        <div className="bg-white border border-[#e7e5e1] rounded-2xl shadow-[0_24px_80px_rgba(17,17,17,0.14)] overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#eeecea]">
            <Search className="w-4 h-4 text-[#a3a3a3] flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIdx(0) }}
              onKeyDown={handleKeyDown}
              placeholder="Search customers, equipment, contracts, actions..."
              className="flex-1 bg-transparent text-sm text-[#171717] placeholder-[#a3a3a3] focus:outline-none border-none"
            />
            <kbd className="text-[10px] text-[#a3a3a3] bg-[#f7f7f4] border border-[#e7e5e1] rounded px-1.5 py-0.5 font-mono">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[360px] overflow-y-auto">
            {commands.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-[#a3a3a3]">No results for &ldquo;{query}&rdquo;</div>
            )}
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-1.5 text-[10px] font-semibold text-[#a3a3a3] tracking-wide bg-[#fbfaf8]">{category}</div>
                {items.map(cmd => {
                  const idx = globalIdx++
                  const isSelected = idx === selectedIdx
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => execute(cmd)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? 'bg-[#f3f4f6]' : 'hover:bg-[#fbfaf8]'}`}
                    >
                      <span className="flex-shrink-0">{cmd.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${isSelected ? 'text-[#171717] font-medium' : 'text-[#171717]'}`}>{cmd.label}</div>
                        {cmd.sub && <div className="text-xs text-[#a3a3a3] truncate">{cmd.sub}</div>}
                      </div>
                      {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#2563eb] flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-[#eeecea] flex items-center gap-3 text-[10px] text-[#a3a3a3]">
            <span><kbd className="bg-[#f7f7f4] border border-[#e7e5e1] rounded px-1 py-0.5 font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="bg-[#f7f7f4] border border-[#e7e5e1] rounded px-1 py-0.5 font-mono">↵</kbd> select</span>
            <span><kbd className="bg-[#f7f7f4] border border-[#e7e5e1] rounded px-1 py-0.5 font-mono">⌘K</kbd> close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
