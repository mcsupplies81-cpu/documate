'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Phone, Mail, MapPin, ShoppingCart } from 'lucide-react'
import { MOCK_VENDORS, MOCK_PURCHASE_ORDERS, MOCK_PARTS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import type { POStatus } from '@/lib/types'

const STATUS_BADGE: Record<POStatus, 'muted' | 'info' | 'warning' | 'success' | 'danger'> = {
  draft: 'muted', sent: 'info', partial: 'warning', received: 'success', cancelled: 'danger',
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>()

  const vendor = MOCK_VENDORS.find(v => v.id === id)
  if (!vendor) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="text-[#6b7280] text-sm">Vendor not found</div>
      <Link href="/vendors" className="text-xs text-[#5c5fef] hover:underline">Back to vendors</Link>
    </div>
  )

  const pos = MOCK_PURCHASE_ORDERS.filter(po => po.vendor_id === id)
  const parts = MOCK_PARTS.filter(p => p.vendor_id === id)
  const totalSpend = pos.filter(po => po.status === 'received').reduce((s, po) => s + po.total, 0)
  const openPos = pos.filter(po => po.status === 'sent' || po.status === 'partial')

  return (
    <div>
      <PageHeader
        title={vendor.name}
        breadcrumb={[{ label: 'Vendors', href: '/vendors' }, { label: vendor.name }]}
        actions={
          <Link href={`/purchase-orders/new?vendor=${vendor.id}`}>
            <Button variant="primary" size="sm"><ShoppingCart className="w-3.5 h-3.5" />New PO</Button>
          </Link>
        }
      >
        <p className="text-xs text-[#9ca3af] mt-0.5">
          {vendor.account_number ? `Acct: ${vendor.account_number} · ` : ''}{vendor.payment_terms?.toUpperCase() || 'No terms set'}
        </p>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Total Spend</div>
          <div className="text-xl font-mono font-bold text-[#5c5fef]">{formatCurrency(totalSpend)}</div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Open POs</div>
          <div className={`text-xl font-mono font-bold ${openPos.length > 0 ? 'text-[#d97706]' : 'text-[#16a34a]'}`}>{openPos.length}</div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Parts Supplied</div>
          <div className="text-xl font-mono font-bold text-[#111827]">{parts.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Contact</div>
          {vendor.contact_name && <div className="text-sm font-medium text-[#111827] mb-2">{vendor.contact_name}</div>}
          <div className="space-y-2">
            {vendor.phone && (
              <div className="flex items-center gap-2 text-xs text-[#374151]">
                <Phone className="w-3.5 h-3.5 text-[#9ca3af]" />{vendor.phone}
              </div>
            )}
            {vendor.email && (
              <div className="flex items-center gap-2 text-xs text-[#374151]">
                <Mail className="w-3.5 h-3.5 text-[#9ca3af]" />{vendor.email}
              </div>
            )}
            {vendor.address && (
              <div className="flex items-center gap-2 text-xs text-[#374151]">
                <MapPin className="w-3.5 h-3.5 text-[#9ca3af]" />
                {vendor.address.street}, {vendor.address.city}, {vendor.address.state}
              </div>
            )}
          </div>
          {vendor.notes && (
            <div className="mt-3 pt-3 border-t border-[#f3f4f6] text-xs text-[#6b7280]">{vendor.notes}</div>
          )}
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Parts Supplied ({parts.length})</div>
          <div className="space-y-1.5">
            {parts.slice(0, 6).map(p => (
              <Link key={p.id} href={`/parts/${p.id}`}
                className="flex items-center justify-between hover:bg-[#f9fafb] -mx-2 px-2 py-1.5 rounded transition-colors">
                <div>
                  <span className="font-mono text-xs text-[#5c5fef]">{p.part_number}</span>
                  <span className="text-xs text-[#6b7280] ml-2">{p.description.slice(0, 30)}</span>
                </div>
                <span className={`text-xs font-mono font-semibold ${p.quantity_on_hand === 0 ? 'text-[#dc2626]' : p.quantity_on_hand <= p.reorder_point ? 'text-[#d97706]' : 'text-[#16a34a]'}`}>
                  {p.quantity_on_hand}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* PO History */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="px-4 py-3 border-b border-[#f3f4f6]">
          <span className="text-sm font-semibold text-[#111827]">Purchase Order History</span>
        </div>
        {pos.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#9ca3af]">No purchase orders yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                {['PO Number', 'Order Date', 'Expected', 'Total', 'Status'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {pos.map(po => (
                <tr key={po.id} className="h-10 hover:bg-[#f9fafb] transition-colors">
                  <td className="px-3 py-2.5">
                    <Link href={`/purchase-orders/${po.id}`} className="font-mono text-xs text-[#5c5fef] hover:underline">{po.po_number}</Link>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-[#6b7280]">{po.order_date}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-[#6b7280]">{po.expected_date || '—'}</td>
                  <td className="px-3 py-2.5 font-mono font-medium text-[#374151]">{formatCurrency(po.total)}</td>
                  <td className="px-3 py-2.5"><Badge variant={STATUS_BADGE[po.status]}>{po.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
