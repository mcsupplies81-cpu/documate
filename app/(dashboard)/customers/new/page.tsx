'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    router.push('/customers')
  }

  return (
    <div>
      <PageHeader
        title="New Customer"
        subtitle="Add a new customer to your account"
        breadcrumb={[{ label: 'Customers', href: '/customers' }, { label: 'New Customer' }]}
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div>
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Basic Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Company Name" placeholder="Acme Corp" required className="col-span-2" />
                <Input label="Email" type="email" placeholder="billing@example.com" />
                <Input label="Phone" placeholder="(555) 000-0000" />
              </div>
            </div>

            <div className="border-t border-[#f3f4f6] pt-5">
              <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Billing Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Street" placeholder="123 Main St" className="col-span-2" />
                <Input label="City" placeholder="San Francisco" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="State" placeholder="CA" maxLength={2} />
                  <Input label="ZIP" placeholder="94105" />
                </div>
              </div>
            </div>

            <div className="border-t border-[#f3f4f6] pt-5">
              <Textarea label="Notes" placeholder="Net 30 terms, special instructions, etc." rows={3} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <Link href="/customers">
              <Button variant="ghost" size="sm" type="button">Cancel</Button>
            </Link>
            <Button variant="primary" size="sm" type="submit" loading={loading}>
              Create Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
