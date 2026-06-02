'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/page-header'
import { MOCK_VENDORS } from '@/lib/mock-data'
import { useToastStore } from '@/lib/store'
import type { PartCategory } from '@/lib/types'

const CATEGORIES: { value: PartCategory; label: string }[] = [
  { value: 'toner', label: 'Toner' },
  { value: 'drum', label: 'Drum' },
  { value: 'fuser', label: 'Fuser' },
  { value: 'feed_roller', label: 'Feed Roller' },
  { value: 'maintenance_kit', label: 'Maintenance Kit' },
  { value: 'belt', label: 'Belt' },
  { value: 'other', label: 'Other' },
]

export default function NewPartPage() {
  const router = useRouter()
  const toast = useToastStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    part_number: '', description: '', category: 'toner' as PartCategory,
    unit_cost: '', unit_price: '', quantity_on_hand: '',
    reorder_point: '', reorder_quantity: '', vendor_id: '',
    compatibility: '', notes: '',
  })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.part_number || !form.description) {
      toast.error('Missing fields', 'Part number and description are required')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    toast.success('Part added', `${form.part_number} added to inventory`)
    router.push('/parts')
  }

  return (
    <div>
      <PageHeader
        title="Add New Part"
        breadcrumb={[{ label: 'Parts', href: '/parts' }, { label: 'New Part' }]}
      />

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold mb-1">Part Information</div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Part Number *" value={form.part_number} onChange={e => set('part_number', e.target.value)} placeholder="TNP-50M" />
            <Select label="Category" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </div>
          <Input label="Description *" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Full part description" />
          <Input label="Compatible Makes (comma-separated)" value={form.compatibility} onChange={e => set('compatibility', e.target.value)} placeholder="Konica Minolta, Kyocera" />
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold mb-1">Pricing</div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Unit Cost ($)" type="number" step="0.01" value={form.unit_cost} onChange={e => set('unit_cost', e.target.value)} placeholder="42.00" />
            <Input label="Sell Price ($)" type="number" step="0.01" value={form.unit_price} onChange={e => set('unit_price', e.target.value)} placeholder="89.00" />
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold mb-1">Inventory</div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="On Hand" type="number" value={form.quantity_on_hand} onChange={e => set('quantity_on_hand', e.target.value)} placeholder="0" />
            <Input label="Reorder Point" type="number" value={form.reorder_point} onChange={e => set('reorder_point', e.target.value)} placeholder="3" />
            <Input label="Reorder Qty" type="number" value={form.reorder_quantity} onChange={e => set('reorder_quantity', e.target.value)} placeholder="6" />
          </div>
          <Select label="Default Vendor" value={form.vendor_id} onChange={e => set('vendor_id', e.target.value)}>
            <option value="">No vendor</option>
            {MOCK_VENDORS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </Select>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Textarea label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any special handling notes..." rows={2} />
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/parts"><Button variant="ghost" type="button">Cancel</Button></Link>
          <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Part'}</Button>
        </div>
      </form>
    </div>
  )
}
