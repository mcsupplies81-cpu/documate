'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { MOCK_PARTS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { Plus, Search, AlertTriangle } from 'lucide-react'
import type { PartCategory } from '@/lib/types'

const CATEGORY_LABELS: Record<PartCategory, string> = {
  toner: 'Toner',
  drum: 'Drum',
  fuser: 'Fuser',
  feed_roller: 'Feed Roller',
  maintenance_kit: 'Maint. Kit',
  belt: 'Belt',
  other: 'Other',
}

export default function PartsPage() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<PartCategory | 'all'>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')

  const filtered = MOCK_PARTS.filter(p => {
    const matchSearch = p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.part_number.toLowerCase().includes(search.toLowerCase()) ||
      p.make_compatibility.some(m => m.toLowerCase().includes(search.toLowerCase()))
    const matchCat = catFilter === 'all' || p.category === catFilter
    const matchStock = stockFilter === 'all'
      ? true
      : stockFilter === 'out'
        ? p.quantity_on_hand === 0
        : p.quantity_on_hand <= p.reorder_point
    return matchSearch && matchCat && matchStock
  })

  const lowStock = MOCK_PARTS.filter(p => p.quantity_on_hand > 0 && p.quantity_on_hand <= p.reorder_point).length
  const outOfStock = MOCK_PARTS.filter(p => p.quantity_on_hand === 0).length
  const totalValue = MOCK_PARTS.reduce((s, p) => s + p.quantity_on_hand * p.unit_cost, 0)

  const categories = Array.from(new Set(MOCK_PARTS.map(p => p.category)))

  return (
    <div>
      <PageHeader
        title="Parts & Inventory"
        actions={
          <Link href="/parts/new">
            <Button variant="primary" size="sm"><Plus className="w-3.5 h-3.5" />Add Part</Button>
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Total SKUs</div>
          <div className="text-2xl font-mono font-bold text-[#111827]">{MOCK_PARTS.length}</div>
        </div>
        <div className={`bg-white border rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${lowStock > 0 ? 'border-[#fde68a]' : 'border-[#e5e7eb]'}`}>
          <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Low Stock</div>
          <div className={`text-2xl font-mono font-bold ${lowStock > 0 ? 'text-[#d97706]' : 'text-[#16a34a]'}`}>{lowStock}</div>
          <div className="text-[11px] text-[#9ca3af] mt-0.5">At or below reorder point</div>
        </div>
        <div className={`bg-white border rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${outOfStock > 0 ? 'border-[#fecaca]' : 'border-[#e5e7eb]'}`}>
          <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Out of Stock</div>
          <div className={`text-2xl font-mono font-bold ${outOfStock > 0 ? 'text-[#dc2626]' : 'text-[#16a34a]'}`}>{outOfStock}</div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Inventory Value</div>
          <div className="text-2xl font-mono font-bold text-[#5c5fef]">{formatCurrency(totalValue)}</div>
          <div className="text-[11px] text-[#9ca3af] mt-0.5">At cost</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search parts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-9 text-sm bg-white border border-[#e5e7eb] rounded-md text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#5c5fef]"
          />
        </div>

        <div className="flex items-center gap-0.5 p-0.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-md">
          <button onClick={() => setStockFilter('all')} className={`px-3 h-7 text-xs rounded transition-colors ${stockFilter === 'all' ? 'bg-white text-[#111827] font-medium shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'}`}>All</button>
          <button onClick={() => setStockFilter('low')} className={`px-3 h-7 text-xs rounded transition-colors ${stockFilter === 'low' ? 'bg-white text-[#111827] font-medium shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'}`}>Low Stock</button>
          <button onClick={() => setStockFilter('out')} className={`px-3 h-7 text-xs rounded transition-colors ${stockFilter === 'out' ? 'bg-white text-[#111827] font-medium shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'}`}>Out of Stock</button>
        </div>

        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value as PartCategory | 'all')}
          className="px-3 h-9 text-xs bg-white border border-[#e5e7eb] rounded-md text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#5c5fef]"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Table>
          <Thead>
            <tr>
              <Th>Part #</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Compatibility</Th>
              <Th>Cost</Th>
              <Th>Sell Price</Th>
              <Th>On Hand</Th>
              <Th>Status</Th>
              <Th>Vendor</Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <EmptyRow cols={9} message="No parts found" />}
            {filtered.map(part => {
              const isOut = part.quantity_on_hand === 0
              const isLow = !isOut && part.quantity_on_hand <= part.reorder_point
              return (
                <Tr key={part.id}>
                  <Td>
                    <Link href={`/parts/${part.id}`} className="font-mono text-xs text-[#5c5fef] hover:underline">
                      {part.part_number}
                    </Link>
                  </Td>
                  <Td>
                    <div className="text-sm text-[#111827]">{part.description}</div>
                  </Td>
                  <Td><span className="text-xs text-[#6b7280]">{CATEGORY_LABELS[part.category]}</span></Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {part.make_compatibility.slice(0, 2).map(m => (
                        <span key={m} className="text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded border border-[#e5e7eb]">{m}</span>
                      ))}
                      {part.make_compatibility.length > 2 && (
                        <span className="text-[10px] text-[#9ca3af]">+{part.make_compatibility.length - 2}</span>
                      )}
                    </div>
                  </Td>
                  <Td><span className="font-mono text-xs text-[#374151]">{formatCurrency(part.unit_cost)}</span></Td>
                  <Td><span className="font-mono text-xs text-[#16a34a] font-medium">{formatCurrency(part.unit_price)}</span></Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      {isLow && <AlertTriangle className="w-3 h-3 text-[#d97706]" />}
                      <span className={`font-mono text-sm font-semibold ${isOut ? 'text-[#dc2626]' : isLow ? 'text-[#d97706]' : 'text-[#16a34a]'}`}>
                        {part.quantity_on_hand}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    {isOut
                      ? <Badge variant="danger">Out</Badge>
                      : isLow
                        ? <Badge variant="warning">Low</Badge>
                        : <Badge variant="success">OK</Badge>
                    }
                  </Td>
                  <Td><span className="text-xs text-[#6b7280]">{part.vendor?.name?.split(' ').slice(0, 2).join(' ') || '—'}</span></Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </div>
    </div>
  )
}
