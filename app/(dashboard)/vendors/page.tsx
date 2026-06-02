'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { MOCK_VENDORS, MOCK_PURCHASE_ORDERS, MOCK_PARTS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { Plus, Search, ShoppingCart, X, Building2 } from 'lucide-react'

export default function VendorsPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_VENDORS.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  )

  const vendorStats = MOCK_VENDORS.map(v => {
    const pos = MOCK_PURCHASE_ORDERS.filter(po => po.vendor_id === v.id)
    const parts = MOCK_PARTS.filter(p => p.vendor_id === v.id)
    const openPos = pos.filter(po => po.status === 'sent' || po.status === 'partial')
    const totalSpend = pos.filter(po => po.status === 'received').reduce((s, po) => s + po.total, 0)
    return { ...v, poCount: pos.length, partsCount: parts.length, openPos: openPos.length, totalSpend }
  })

  const totalOpenPos = MOCK_PURCHASE_ORDERS.filter(po => po.status === 'sent' || po.status === 'partial').length
  const totalPending = MOCK_PURCHASE_ORDERS.filter(po => po.status === 'sent').reduce((s, po) => s + po.total, 0)

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Supplier management & accounts payable"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/purchase-orders/new">
              <Button variant="ghost" size="sm"><ShoppingCart className="w-3.5 h-3.5" />New PO</Button>
            </Link>
            <Link href="/vendors/new">
              <Button variant="primary" size="sm"><Plus className="w-3.5 h-3.5" />Add Vendor</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-[#ebebeb] rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Active Vendors</div>
          <div className="text-2xl font-semibold text-[#111827] tabular-nums">{MOCK_VENDORS.length}</div>
        </div>
        <div className={`bg-white border rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)] ${totalOpenPos > 0 ? 'border-[#fde68a]' : 'border-[#ebebeb]'}`}>
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Open POs</div>
          <div className={`text-2xl font-semibold tabular-nums ${totalOpenPos > 0 ? 'text-[#d97706]' : 'text-[#16a34a]'}`}>{totalOpenPos}</div>
          <div className="text-xs text-[#9ca3af] mt-1">Awaiting receipt</div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Pending Payment</div>
          <div className="text-2xl font-semibold text-[#5c5fef] tabular-nums">{formatCurrency(totalPending)}</div>
        </div>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
        <input
          type="text"
          placeholder="Search vendors..."
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

      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <Table>
          <Thead>
            <tr>
              <Th>Vendor</Th>
              <Th>Contact</Th>
              <Th>Terms</Th>
              <Th>Parts</Th>
              <Th>Open POs</Th>
              <Th>Total Spend</Th>
              <Th>Account #</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <EmptyRow cols={8} message="No vendors found" icon={Building2} />}
            {vendorStats.filter(v => filtered.find(f => f.id === v.id)).map(v => (
              <Tr key={v.id}>
                <Td>
                  <Link href={`/vendors/${v.id}`} className="text-[#111827] hover:text-[#5c5fef] font-medium text-sm transition-colors">
                    {v.name}
                  </Link>
                </Td>
                <Td>
                  <div className="text-xs text-[#374151]">{v.contact_name || '—'}</div>
                  {v.email && <div className="text-[11px] text-[#9ca3af]">{v.email}</div>}
                </Td>
                <Td>
                  <span className="text-xs font-mono text-[#6b7280] uppercase">{v.payment_terms || '—'}</span>
                </Td>
                <Td><span className="font-mono text-sm text-[#374151]">{v.partsCount}</span></Td>
                <Td>
                  {v.openPos > 0
                    ? <Badge variant="warning">{v.openPos} open</Badge>
                    : <span className="text-xs text-[#9ca3af]">—</span>
                  }
                </Td>
                <Td><span className="font-mono text-sm text-[#374151]">{formatCurrency(v.totalSpend)}</span></Td>
                <Td><span className="font-mono text-xs text-[#6b7280]">{v.account_number || '—'}</span></Td>
                <Td>
                  <Link href={`/vendors/${v.id}`} className="text-xs text-[#5c5fef] hover:underline font-medium">View</Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  )
}
