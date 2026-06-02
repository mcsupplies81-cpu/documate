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
import { MOCK_CUSTOMERS, MOCK_EQUIPMENT, MOCK_USERS } from '@/lib/mock-data'
import { Suspense } from 'react'

function NewServiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preCustomer = searchParams.get('customer') || ''
  const preEquipment = searchParams.get('equipment') || ''

  const [customerId, setCustomerId] = useState(preCustomer)
  const [loading, setLoading] = useState(false)

  const customerEquipment = MOCK_EQUIPMENT.filter(e => e.customer_id === customerId && e.status !== 'removed')
  const technicians = MOCK_USERS.filter(u => u.role === 'technician' || u.role === 'service_manager')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    router.push('/service')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/service" className="text-[#555] hover:text-[#888]"><ArrowLeft className="w-4 h-4" /></Link>
        <span className="text-[#333]">/</span>
        <Link href="/service" className="text-sm text-[#555]">Service</Link>
        <span className="text-[#333]">/</span>
        <span className="text-sm text-[#888]">New Call</span>
      </div>

      <PageHeader title="New Service Call" subtitle="Log a new service request or work order" />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Customer"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                options={MOCK_CUSTOMERS.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Select customer"
                className="col-span-2"
              />
              <Select
                label="Equipment"
                defaultValue={preEquipment}
                options={customerEquipment.map(e => ({ value: e.id, label: `${e.make} ${e.model} (${e.serial_number})` }))}
                placeholder={customerId ? 'Select equipment' : 'Select customer first'}
                disabled={!customerId}
                className="col-span-2"
              />
            </div>

            <Textarea
              label="Problem Description"
              placeholder="Describe the issue the customer is experiencing..."
              rows={3}
              required
            />

            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Priority"
                options={[
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'high', label: 'High' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'low', label: 'Low' },
                ]}
                defaultValue="normal"
              />
              <Select
                label="Assign To"
                options={technicians.map(t => ({ value: t.id, label: t.name }))}
                placeholder="Unassigned"
              />
              <Input label="Call Number" placeholder="SC-2026-0313" hint="Auto-generated if blank" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="billable" className="w-4 h-4" />
              <label htmlFor="billable" className="text-sm text-[#888]">
                Billable (not covered by contract)
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <Link href="/service">
              <Button variant="ghost" size="sm" type="button">Cancel</Button>
            </Link>
            <Button variant="primary" size="sm" type="submit" loading={loading}>
              Create Service Call
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewServicePage() {
  return <Suspense><NewServiceForm /></Suspense>
}
