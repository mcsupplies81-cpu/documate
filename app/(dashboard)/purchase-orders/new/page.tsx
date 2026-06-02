'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MOCK_VENDORS, MOCK_PARTS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { useToastStore } from '@/lib/store'

interface LineItem {
  part_id: string
  description: string
  quantity: number
  unit_cost: number
}

export default function NewPOPage() {
  const router = useRouter()
  const toast = useToastStore()
  const [vendorId, setVendorId] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineItem[]>([{ part_id: '', description: '', quantity: 1, unit_cost: 0 }])
  const [loading, setLoading] = useState(false)

  const addLine = () => setLines(prev => [...prev, { part_id: '', description: '', quantity: 1, unit_cost: 0 }])
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))

  const updateLine = (i: number, field: keyof LineItem, value: string | number) => {
    setLines(prev => {
      const next = [...prev]
      if (field === 'part_id' && typeof value === 'string') {
        const part = MOCK_PARTS.find(p => p.id === value)
        next[i] = { ...next[i], part_id: value, description: part?.description || '', unit_cost: part?.unit_cost || 0 }
      } else {
        next[i] = { ...next[i], [field]: value }
      }
      return next
    })
  }

  const total = lines.reduce((s, l) => s + l.quantity * l.unit_cost, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendorId) { toast.error('Missing vendor', 'Select a vendor to continue'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    toast.success('PO Created', 'Purchase order saved as draft')
    router.push('/purchase-orders')
  }

  return (
    <div>
      <PageHeader
        title="New Purchase Order"
        breadcrumb={[{ label: 'Purchase Orders', href: '/purchase-orders' }, { label: 'New PO' }]}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold mb-3">Vendor</div>
            <Select
              value={vendorId}
              onChange={e => setVendorId(e.target.value)}
              label="Vendor *"
            >
              <option value="">Select vendor...</option>
              {MOCK_VENDORS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </div>
          <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <Input
              label="Expected Delivery Date"
              type="date"
              value={expectedDate}
              onChange={e => setExpectedDate(e.target.value)}
            />
            <Textarea
              label="Notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Special instructions, urgency notes..."
              rows={2}
            />
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#111827]">Line Items</span>
            <button type="button" onClick={addLine} className="text-xs text-[#5c5fef] hover:underline flex items-center gap-1 font-medium">
              <Plus className="w-3 h-3" /> Add Item
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                {['Part', 'Description', 'Qty', 'Unit Cost', 'Total', ''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-[#f9fafb]">
                  <td className="px-3 py-2.5 w-48">
                    <select
                      value={line.part_id}
                      onChange={e => updateLine(i, 'part_id', e.target.value)}
                      className="w-full px-2 h-8 text-xs bg-white border border-[#e5e7eb] rounded text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#5c5fef]"
                    >
                      <option value="">Select part...</option>
                      {MOCK_PARTS.map(p => <option key={p.id} value={p.id}>{p.part_number}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      type="text"
                      value={line.description}
                      onChange={e => updateLine(i, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-2 h-8 text-xs bg-white border border-[#e5e7eb] rounded text-[#374151] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#5c5fef]"
                    />
                  </td>
                  <td className="px-3 py-2.5 w-20">
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={e => updateLine(i, 'quantity', Number(e.target.value))}
                      className="w-full px-2 h-8 text-xs font-mono bg-white border border-[#e5e7eb] rounded text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#5c5fef]"
                    />
                  </td>
                  <td className="px-3 py-2.5 w-28">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unit_cost}
                      onChange={e => updateLine(i, 'unit_cost', Number(e.target.value))}
                      className="w-full px-2 h-8 text-xs font-mono bg-white border border-[#e5e7eb] rounded text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#5c5fef]"
                    />
                  </td>
                  <td className="px-3 py-2.5 w-24">
                    <span className="font-mono text-xs text-[#374151]">{formatCurrency(line.quantity * line.unit_cost)}</span>
                  </td>
                  <td className="px-3 py-2.5 w-8">
                    {lines.length > 1 && (
                      <button type="button" onClick={() => removeLine(i)} className="text-[#d1d5db] hover:text-[#dc2626] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-[#e5e7eb] flex justify-end bg-[#f9fafb]">
            <span className="text-sm font-semibold text-[#111827]">
              Total: <span className="font-mono text-[#5c5fef] ml-2">{formatCurrency(total)}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Link href="/purchase-orders">
            <Button variant="ghost" size="sm" type="button">Cancel</Button>
          </Link>
          <Button variant="secondary" size="sm" type="submit" disabled={loading}>Save as Draft</Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create & Send PO'}
          </Button>
        </div>
      </form>
    </div>
  )
}
