'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/page-header'
import { useToastStore } from '@/lib/store'

export default function NewVendorPage() {
  const router = useRouter()
  const toast = useToastStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', contact_name: '', email: '', phone: '',
    street: '', city: '', state: 'CA', zip: '',
    account_number: '', payment_terms: 'net30', notes: '',
  })
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Missing name', 'Vendor name is required'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    toast.success('Vendor added', form.name)
    router.push('/vendors')
  }

  return (
    <div>
      <PageHeader
        title="Add Vendor"
        breadcrumb={[{ label: 'Vendors', href: '/vendors' }, { label: 'New Vendor' }]}
      />
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 space-y-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <Input label="Company Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Konica Minolta Business Solutions" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Name" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
            <Input label="Account Number" value={form.account_number} onChange={e => set('account_number', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <Select label="Payment Terms" value={form.payment_terms} onChange={e => set('payment_terms', e.target.value)}>
            <option value="net15">Net 15</option>
            <option value="net30">Net 30</option>
            <option value="net45">Net 45</option>
            <option value="cod">COD</option>
            <option value="prepaid">Prepaid</option>
          </Select>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 space-y-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold mb-1">Address</div>
          <Input label="Street Address" value={form.street} onChange={e => set('street', e.target.value)} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="City" value={form.city} onChange={e => set('city', e.target.value)} />
            <Input label="State" value={form.state} onChange={e => set('state', e.target.value)} />
            <Input label="ZIP" value={form.zip} onChange={e => set('zip', e.target.value)} />
          </div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <Textarea label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
        </div>
        <div className="flex gap-3 justify-end">
          <Link href="/vendors"><Button variant="ghost" type="button">Cancel</Button></Link>
          <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Vendor'}</Button>
        </div>
      </form>
    </div>
  )
}
