'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { MOCK_PURCHASE_ORDERS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { Plus, Search } from 'lucide-react'
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
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Open POs</div>
          <div className="text-2xl font-mono font-bold text-[#d97706]">{openPOs.length}</div>
          <div className="text-[11px] text-[#9ca3af] mt-0.5">Sent / partial</div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Pending Total</div>
          <div className="text-2xl font-mono font-bold text-[#5c5fef]">{formatCurrency(pendingTotal)}</div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Drafts</div>
          <div className="text-2xl font-mono font-bold text-[#374151]">{draftCount}</div>
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
            className="w-full pl-9 pr-3 h-9 text-sm bg-white border border-[#e5e7eb] rounded-md text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#5c5fef]"
          />
        </div>
        <div className="flex items-center gap-0.5 p-0.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-md">
          {(['all', 'draft', 'sent', 'partial', 'received', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 h-7 text-xs rounded transition-colors capitalize ${statusFilter === s ? 'bg-white text-[#111827] font-medium shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
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
            {filtered.length === 0 && <EmptyRow cols={8} message="No purchase orders found" />}
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
