'use client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ShoppingCart } from 'lucide-react'
import { MOCK_PARTS, MOCK_PART_USAGE, MOCK_SERVICE_CALLS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { useToastStore } from '@/lib/store'

export default function PartDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const toast = useToastStore()

  const part = MOCK_PARTS.find(p => p.id === id)
  if (!part) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="text-[#6b7280] text-sm">Part not found</div>
      <Link href="/parts" className="text-xs text-[#2563eb] hover:underline">Back to parts</Link>
    </div>
  )

  const usage = MOCK_PART_USAGE.filter(u => u.part_id === id)
  const usedQty = usage.reduce((s, u) => s + u.quantity, 0)
  const isOut = part.quantity_on_hand === 0
  const isLow = !isOut && part.quantity_on_hand <= part.reorder_point
  const margin = ((part.unit_price - part.unit_cost) / part.unit_price * 100).toFixed(0)
  const inventoryValue = part.quantity_on_hand * part.unit_cost

  const createReorder = () => {
    toast.info('Reorder initiated', `Draft PO created for ${part.reorder_quantity}x ${part.part_number}`)
  }

  return (
    <div>
      <PageHeader
        title={part.part_number}
        breadcrumb={[{ label: 'Parts', href: '/parts' }, { label: part.part_number }]}
        actions={
          (isOut || isLow) ? (
            <Button variant="primary" size="sm" onClick={createReorder}>
              <ShoppingCart className="w-3.5 h-3.5" />
              Reorder ({part.reorder_quantity})
            </Button>
          ) : undefined
        }
      >
        <div className="flex items-center gap-2 mt-1">
          {isOut
            ? <Badge variant="danger">Out of Stock</Badge>
            : isLow
              ? <Badge variant="warning">Low Stock</Badge>
              : <Badge variant="success">In Stock</Badge>
          }
          <span className="text-sm text-[#6b7280]">{part.description}</span>
        </div>
      </PageHeader>

      {(isOut || isLow) && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border mb-5 ${isOut ? 'bg-[#fef2f2] border-[#fecaca]' : 'bg-[#fffbeb] border-[#fde68a]'}`}>
          <AlertTriangle className={`w-4 h-4 ${isOut ? 'text-[#dc2626]' : 'text-[#d97706]'}`} />
          <span className={`text-sm ${isOut ? 'text-[#991b1b]' : 'text-[#92400e]'}`}>
            {isOut ? `Out of stock — reorder point is ${part.reorder_point}` : `Stock at ${part.quantity_on_hand} — reorder point is ${part.reorder_point}`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'On Hand', value: part.quantity_on_hand.toString(), color: isOut ? 'text-[#dc2626]' : isLow ? 'text-[#d97706]' : 'text-[#16a34a]' },
          { label: 'Reorder Point', value: part.reorder_point.toString(), color: 'text-[#111827]' },
          { label: 'Unit Margin', value: `${margin}%`, color: 'text-[#2563eb]' },
          { label: 'Stock Value', value: formatCurrency(inventoryValue), color: 'text-[#111827]' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-[#e5e7eb] rounded-lg p-3 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
            <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">{stat.label}</div>
            <div className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Part Details</div>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Category', value: part.category.replace('_', ' ') },
              { label: 'Unit Cost', value: formatCurrency(part.unit_cost) },
              { label: 'Sell Price', value: formatCurrency(part.unit_price) },
              { label: 'Reorder Qty', value: part.reorder_quantity.toString() },
              { label: 'Vendor', value: part.vendor?.name || '—' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-[#f3f4f6] last:border-0">
                <span className="text-[#6b7280]">{row.label}</span>
                <span className="font-mono text-[#374151] capitalize">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-3">Compatibility</div>
          <div className="flex flex-wrap gap-2">
            {part.make_compatibility.map(m => (
              <span key={m} className="px-3 py-1 bg-[#f3f4f6] border border-[#e5e7eb] text-xs text-[#374151] rounded-full">{m}</span>
            ))}
          </div>
          {part.notes && (
            <div className="mt-4">
              <div className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">Notes</div>
              <p className="text-sm text-[#374151]">{part.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Usage history */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
        <div className="px-4 py-3 border-b border-[#f3f4f6]">
          <span className="text-sm font-semibold text-[#111827]">Usage History</span>
          <span className="text-xs text-[#9ca3af] ml-2">({usedQty} units used)</span>
        </div>
        {usage.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#9ca3af]">No usage recorded yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                {['Service Call', 'Qty', 'Unit Price', 'Total', 'Date'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {usage.map(u => {
                const call = MOCK_SERVICE_CALLS.find(sc => sc.id === u.service_call_id)
                return (
                  <tr key={u.id} className="h-10 hover:bg-[#f9fafb] transition-colors">
                    <td className="px-3 py-2.5">
                      <Link href={`/service/${u.service_call_id}`} className="font-mono text-xs text-[#2563eb] hover:underline">
                        {call?.call_number || u.service_call_id}
                      </Link>
                      <div className="text-[11px] text-[#9ca3af]">{call?.customer?.name}</div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-sm text-[#374151]">{u.quantity}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[#374151]">{formatCurrency(u.unit_price)}</td>
                    <td className="px-3 py-2.5 font-mono font-medium text-[#16a34a]">{formatCurrency(u.total)}</td>
                    <td className="px-3 py-2.5 text-xs text-[#6b7280] font-mono">{u.created_at.split('T')[0]}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
