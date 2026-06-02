'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { MOCK_PURCHASE_ORDERS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { Plus, Search, X, ShoppingBag } from 'lucide-react'
import { FilterTabs } from '@/components/ui/filter-tabs'
import type { POStatus } from '@/lib/types'

const STATUS_BADGE: Record<POStatus, 'muted' | 'info' | 'warning' | 'success' | 'danger'> = {
  draft: 'muted',
  sent: 'info',
  partial: 'warning',
  received: 'success',
  cancelled: 'danger',
}

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<POStatus | 'all'>('all')

  const filtered = MOCK_PURCHASE_ORDERS.filter(po => {
    const matchSearch = po.po_number.toLowerCase().includes(search.toLowerCase()) ||
      po.vendor?.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || po.status === statusFilter
    return matchSearch && matchStatus
  })

  const openPOs = MOCK_PURCHASE_ORDERS.filter(po => po.status === 'sent' || po.status === 'partial')
  const pendingTotal = openPOs.reduce((s, po) => s + po.total, 0)
  const draftCount = MOCK_PURCHASE_ORDERS.filter(po => po.status === 'draft').length

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        actions={
          <Link href="/purchase-orders/new">
            <Button variant="primary" size="sm"><Plus className="w-3.5 h-3.5" />New PO</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-[#ebebeb] rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Open POs</div>
          <div className="text-2xl font-semibold text-[#d97706] tabular-nums">{openPOs.length}</div>
          <div className="text-xs text-[#9ca3af] mt-1">Sent / partial</div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Pending Total</div>
          <div className="text-2xl font-semibold text-[#5c5fef] tabular-nums">{formatCurrency(pendingTotal)}</div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Drafts</div>
          <div className="text-2xl font-semibold text-[#374151] tabular-nums">{draftCount}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search POs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 h-9 text-sm bg-white border border-[#e5e7eb] rounded-lg text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#5c5fef] focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <FilterTabs
          options={[
            { key: 'all' as POStatus | 'all', label: 'All', count: MOCK_PURCHASE_ORDERS.length },
            { key: 'draft' as POStatus | 'all', label: 'Draft', count: MOCK_PURCHASE_ORDERS.filter(p => p.status === 'draft').length },
            { key: 'sent' as POStatus | 'all', label: 'Sent', count: MOCK_PURCHASE_ORDERS.filter(p => p.status === 'sent').length },
            { key: 'partial' as POStatus | 'all', label: 'Partial', count: MOCK_PURCHASE_ORDERS.filter(p => p.status === 'partial').length },
            { key: 'received' as POStatus | 'all', label: 'Received', count: MOCK_PURCHASE_ORDERS.filter(p => p.status === 'received').length },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <Table>
          <Thead>
            <tr>
              <Th>PO Number</Th>
              <Th>Vendor</Th>
              <Th>Order Date</Th>
              <Th>Expected</Th>
              <Th>Items</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <EmptyRow cols={8} message="No purchase orders found" icon={ShoppingBag} />}
            {filtered.map(po => (
              <Tr key={po.id}>
                <Td><Link href={`/purchase-orders/${po.id}`} className="font-mono text-xs text-[#5c5fef] hover:underline">{po.po_number}</Link></Td>
                <Td><span className="text-[#111827] text-sm font-medium">{po.vendor?.name}</span></Td>
                <Td><span className="font-mono text-xs text-[#6b7280]">{po.order_date}</span></Td>
                <Td>
                  <span className={`font-mono text-xs ${!po.received_date && po.expected_date && new Date(po.expected_date) < new Date('2026-06-02') ? 'text-[#dc2626] font-medium' : 'text-[#6b7280]'}`}>
                    {po.expected_date || '—'}
                  </span>
                </Td>
                <Td><span className="font-mono text-sm text-[#374151]">{po.line_items?.length || 0}</span></Td>
                <Td><span className="font-mono font-medium text-[#374151]">{formatCurrency(po.total)}</span></Td>
                <Td><Badge variant={STATUS_BADGE[po.status]}>{po.status}</Badge></Td>
                <Td><Link href={`/purchase-orders/${po.id}`} className="text-xs text-[#5c5fef] hover:underline font-medium">View</Link></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  )
}
