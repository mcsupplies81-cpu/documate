'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MOCK_CUSTOMERS } from '@/lib/mock-data'
import { Suspense } from 'react'

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
      <div className="flex items-center gap-3 mb-4">
        <Link href="/equipment" className="text-[#555] hover:text-[#888]"><ArrowLeft className="w-4 h-4" /></Link>
        <span className="text-[#333]">/</span>
        <Link href="/equipment" className="text-sm text-[#555]">Equipment</Link>
        <span className="text-[#333]">/</span>
        <span className="text-sm text-[#888]">Add Equipment</span>
      </div>

      <PageHeader title="Add Equipment" subtitle="Register a new machine to your fleet" />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5 space-y-5">
            <div>
              <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider mb-3">Assignment</h3>
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

            <div className="border-t border-[#1a1a1a] pt-5">
              <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider mb-3">Machine Info</h3>
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

            <div className="border-t border-[#1a1a1a] pt-5">
              <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider mb-3">Initial Meter Readings</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="B&W Counter" type="number" defaultValue="0" min="0" />
                <Input label="Color Counter" type="number" defaultValue="0" min="0" />
              </div>
              <p className="text-xs text-[#444] mt-2">Enter current meter readings if this is an existing machine being added to the system.</p>
            </div>

            <div className="border-t border-[#1a1a1a] pt-5">
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
