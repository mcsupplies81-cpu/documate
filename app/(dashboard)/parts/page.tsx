'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { MOCK_PARTS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { Plus, Search, AlertTriangle, X, Package } from 'lucide-react'
import { FilterTabs } from '@/components/ui/filter-tabs'
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
        <div className="bg-white border border-[#e7e5e1] rounded-xl p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Total SKUs</div>
          <div className="text-2xl font-semibold text-[#111827] tabular-nums">{MOCK_PARTS.length}</div>
        </div>
        <div className={`bg-white border rounded-xl p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)] ${lowStock > 0 ? 'border-[#fde68a]' : 'border-[#e7e5e1]'}`}>
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Low Stock</div>
          <div className={`text-2xl font-semibold tabular-nums ${lowStock > 0 ? 'text-[#d97706]' : 'text-[#16a34a]'}`}>{lowStock}</div>
          <div className="text-xs text-[#9ca3af] mt-1">At or below reorder point</div>
        </div>
        <div className={`bg-white border rounded-xl p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)] ${outOfStock > 0 ? 'border-[#fecaca]' : 'border-[#e7e5e1]'}`}>
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Out of Stock</div>
          <div className={`text-2xl font-semibold tabular-nums ${outOfStock > 0 ? 'text-[#dc2626]' : 'text-[#16a34a]'}`}>{outOfStock}</div>
        </div>
        <div className="bg-white border border-[#e7e5e1] rounded-xl p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Inventory Value</div>
          <div className="text-2xl font-semibold text-[#2563eb] tabular-nums">{formatCurrency(totalValue)}</div>
          <div className="text-xs text-[#9ca3af] mt-1">At cost</div>
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
            className="w-full pl-9 pr-8 h-9 text-sm bg-white border border-[#e5e7eb] rounded-lg text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <FilterTabs
          options={[
            { key: 'all' as 'all' | 'low' | 'out', label: 'All', count: MOCK_PARTS.length },
            { key: 'low' as 'all' | 'low' | 'out', label: 'Low Stock', count: lowStock },
            { key: 'out' as 'all' | 'low' | 'out', label: 'Out of Stock', count: outOfStock },
          ]}
          value={stockFilter}
          onChange={setStockFilter}
        />

        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value as PartCategory | 'all')}
          className="px-3 h-9 text-xs bg-white border border-[#e5e7eb] rounded-md text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      <div className="bg-white border border-[#e7e5e1] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
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
            {filtered.length === 0 && <EmptyRow cols={9} message="No parts found" icon={Package} />}
            {filtered.map(part => {
              const isOut = part.quantity_on_hand === 0
              const isLow = !isOut && part.quantity_on_hand <= part.reorder_point
              return (
                <Tr key={part.id}>
                  <Td>
                    <Link href={`/parts/${part.id}`} className="font-mono text-xs text-[#2563eb] hover:underline">
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
