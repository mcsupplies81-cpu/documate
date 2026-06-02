'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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
      <div className="flex items-center gap-3 mb-4">
        <Link href="/customers" className="text-[#555] hover:text-[#888]"><ArrowLeft className="w-4 h-4" /></Link>
        <span className="text-[#333]">/</span>
        <Link href="/customers" className="text-sm text-[#555]">Customers</Link>
        <span className="text-[#333]">/</span>
        <span className="text-sm text-[#888]">New Customer</span>
      </div>

      <PageHeader title="New Customer" subtitle="Add a new customer to your account" />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5 space-y-5">
            <div>
              <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider mb-3">Basic Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Company Name" placeholder="Acme Corp" required className="col-span-2" />
                <Input label="Email" type="email" placeholder="billing@example.com" />
                <Input label="Phone" placeholder="(555) 000-0000" />
              </div>
            </div>

            <div className="border-t border-[#1a1a1a] pt-5">
              <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider mb-3">Billing Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Street" placeholder="123 Main St" className="col-span-2" />
                <Input label="City" placeholder="San Francisco" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="State" placeholder="CA" maxLength={2} />
                  <Input label="ZIP" placeholder="94105" />
                </div>
              </div>
            </div>

            <div className="border-t border-[#1a1a1a] pt-5">
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
