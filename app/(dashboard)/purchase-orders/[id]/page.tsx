'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { MOCK_PURCHASE_ORDERS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { useToastStore } from '@/lib/store'
import type { POStatus } from '@/lib/types'

const STATUS_BADGE: Record<POStatus, 'muted' | 'info' | 'warning' | 'success' | 'danger'> = {
  draft: 'muted', sent: 'info', partial: 'warning', received: 'success', cancelled: 'danger',
}

export default function PODetailPage() {
  const { id } = useParams<{ id: string }>()
  const toast = useToastStore()
  const [receiving, setReceiving] = useState(false)

  const po = MOCK_PURCHASE_ORDERS.find(p => p.id === id)
  if (!po) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="text-[#6b7280] text-sm">Purchase order not found</div>
      <Link href="/purchase-orders" className="text-xs text-[#5c5fef] hover:underline">Back to POs</Link>
    </div>
  )

  const handleReceive = async () => {
    setReceiving(true)
    await new Promise(r => setTimeout(r, 600))
    setReceiving(false)
    toast.success('PO received', `${po.po_number} marked as received. Inventory updated.`)
  }

  return (
    <div>
      <PageHeader
        title={po.po_number}
        breadcrumb={[{ label: 'Purchase Orders', href: '/purchase-orders' }, { label: po.po_number }]}
        actions={
          po.status === 'sent' ? (
            <Button variant="primary" size="sm" onClick={handleReceive} disabled={receiving}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {receiving ? 'Receiving...' : 'Mark Received'}
            </Button>
          ) : undefined
        }
      >
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={STATUS_BADGE[po.status]}>{po.status}</Badge>
          <span className="text-xs text-[#9ca3af]">{po.vendor?.name} · Ordered {po.order_date}</span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 col-span-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Vendor</div>
          <div className="text-sm font-semibold text-[#111827]">{po.vendor?.name}</div>
          {po.vendor?.contact_name && <div className="text-xs text-[#374151] mt-1">{po.vendor.contact_name}</div>}
          {po.vendor?.email && <div className="text-xs text-[#6b7280]">{po.vendor.email}</div>}
          {po.vendor?.phone && <div className="text-xs text-[#6b7280]">{po.vendor.phone}</div>}
          {po.vendor?.account_number && (
            <div className="text-xs text-[#9ca3af] mt-2">Account: <span className="font-mono text-[#6b7280]">{po.vendor.account_number}</span></div>
          )}
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Dates</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#6b7280]">Order Date</span>
              <span className="font-mono text-[#374151]">{po.order_date}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6b7280]">Expected</span>
              <span className="font-mono text-[#374151]">{po.expected_date || '—'}</span>
            </div>
            {po.received_date && (
              <div className="flex items-center justify-between">
                <span className="text-[#6b7280]">Received</span>
                <span className="font-mono text-[#16a34a] font-medium">{po.received_date}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-[#f3f4f6]">
              <span className="text-[#6b7280]">Terms</span>
              <span className="font-mono text-[#374151] uppercase">{po.vendor?.payment_terms || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="px-4 py-3 border-b border-[#f3f4f6]">
          <span className="text-sm font-semibold text-[#111827]">Line Items</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              {['Part #', 'Description', 'Ordered', 'Received', 'Unit Cost', 'Total', 'Status'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {(po.line_items || []).map(item => {
              const received = item.quantity_received
              const ordered = item.quantity_ordered
              const fullyReceived = received >= ordered
              return (
                <tr key={item.id} className="h-10 hover:bg-[#f9fafb] transition-colors">
                  <td className="px-3 py-3">
                    {item.part ? (
                      <Link href={`/parts/${item.part_id}`} className="font-mono text-xs text-[#5c5fef] hover:underline">
                        {item.part.part_number}
                      </Link>
                    ) : <span className="text-[#9ca3af] text-xs">—</span>}
                  </td>
                  <td className="px-3 py-3 text-[#374151]">{item.description}</td>
                  <td className="px-3 py-3 font-mono text-sm text-[#374151]">{ordered}</td>
                  <td className="px-3 py-3">
                    <span className={`font-mono text-sm font-semibold ${fullyReceived ? 'text-[#16a34a]' : received > 0 ? 'text-[#d97706]' : 'text-[#9ca3af]'}`}>
                      {received}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-[#374151]">{formatCurrency(item.unit_cost)}</td>
                  <td className="px-3 py-3 font-mono font-medium text-[#374151]">{formatCurrency(item.total)}</td>
                  <td className="px-3 py-3">
                    {fullyReceived
                      ? <Badge variant="success">Received</Badge>
                      : received > 0
                        ? <Badge variant="warning">Partial</Badge>
                        : <Badge variant="muted">Pending</Badge>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-[#e5e7eb] flex justify-end bg-[#f9fafb]">
          <div className="text-sm font-semibold text-[#111827]">
            Total: <span className="font-mono text-[#5c5fef] ml-2">{formatCurrency(po.total)}</span>
          </div>
        </div>
      </div>

      {po.notes && (
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">Notes</div>
          <p className="text-sm text-[#374151]">{po.notes}</p>
        </div>
      )}
    </div>
  )
}
