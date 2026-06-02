'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MOCK_CUSTOMERS } from '@/lib/mock-data'

function NewEquipmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCustomer = searchParams.get('customer') || ''
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    router.push('/equipment')
  }

  const makes = ['Canon', 'HP', 'Konica Minolta', 'Kyocera', 'Ricoh', 'Sharp', 'Toshiba', 'Xerox', 'Other']

  return (
    <div>
      <PageHeader
        title="Add Equipment"
        subtitle="Register a new machine to your fleet"
        breadcrumb={[{ label: 'Equipment', href: '/equipment' }, { label: 'Add Equipment' }]}
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div>
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Assignment</h3>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Customer"
                  className="col-span-2"
                  defaultValue={preselectedCustomer}
                  options={MOCK_CUSTOMERS.map(c => ({ value: c.id, label: c.name }))}
                  placeholder="Select a customer"
                />
              </div>
            </div>

            <div className="border-t border-[#f3f4f6] pt-5">
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Machine Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Make"
                  options={makes.map(m => ({ value: m, label: m }))}
                  placeholder="Select manufacturer"
                />
                <Input label="Model" placeholder="e.g. bizhub C360i" required />
                <Input label="Serial Number" placeholder="e.g. A1234567" required className="col-span-2" />
                <Input label="Install Date" type="date" />
                <Select
                  label="Status"
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'removed', label: 'Removed' },
                  ]}
                  defaultValue="active"
                />
              </div>
            </div>

            <div className="border-t border-[#f3f4f6] pt-5">
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Initial Meter Readings</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="B&W Counter" type="number" defaultValue="0" min="0" />
                <Input label="Color Counter" type="number" defaultValue="0" min="0" />
              </div>
              <p className="text-xs text-[#9ca3af] mt-2">Enter current meter readings if this is an existing machine being added to the system.</p>
            </div>

            <div className="border-t border-[#f3f4f6] pt-5">
              <Textarea label="Notes" placeholder="Location in building, special instructions, etc." rows={2} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <Link href="/equipment">
              <Button variant="ghost" size="sm" type="button">Cancel</Button>
            </Link>
            <Button variant="primary" size="sm" type="submit" loading={loading}>
              Add Equipment
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewEquipmentPage() {
  return <Suspense><NewEquipmentForm /></Suspense>
}
