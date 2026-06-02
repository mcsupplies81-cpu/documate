'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Download, MapPin, Phone, Mail, Printer, FileText } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { MOCK_CUSTOMERS } from '@/lib/mock-data'
import type { Customer } from '@/lib/types'

export default function CustomersPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'City', 'State', 'Equipment', 'Contracts']
    const rows = filtered.map(c => [
      c.name, c.email || '', c.phone || '',
      c.billing_address?.city || '', c.billing_address?.state || '',
      c.equipment_count || 0, c.active_contracts || 0,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${filtered.length} of ${MOCK_CUSTOMERS.length} customers`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={exportCSV}>
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
            <Link href="/customers/new">
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5" />
                New Customer
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#111] border border-[#222] rounded-md text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
        <Table>
          <Thead>
            <tr>
              <Th>Customer</Th>
              <Th>Contact</Th>
              <Th>Location</Th>
              <Th>Equipment</Th>
              <Th>Contracts</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <EmptyRow cols={6} message="No customers match your search" />}
            {filtered.map(customer => (
              <Tr key={customer.id} onClick={() => window.location.href = `/customers/${customer.id}`}>
                <Td>
                  <div>
                    <div className="text-[#e8e8e8] font-medium">{customer.name}</div>
                    {customer.notes && (
                      <div className="text-xs text-[#444] truncate max-w-[200px]" title={customer.notes}>
                        {customer.notes}
                      </div>
                    )}
                  </div>
                </Td>
                <Td>
                  <div className="space-y-0.5">
                    {customer.email && (
                      <div className="flex items-center gap-1.5 text-xs text-[#666]">
                        <Mail className="w-3 h-3" />{customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-[#666]">
                        <Phone className="w-3 h-3" />{customer.phone}
                      </div>
                    )}
                  </div>
                </Td>
                <Td>
                  {customer.billing_address && (
                    <div className="flex items-center gap-1.5 text-xs text-[#666]">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {customer.billing_address.city}, {customer.billing_address.state}
                    </div>
                  )}
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Printer className="w-3 h-3 text-[#444]" />
                    <span className="font-mono text-[#888]">{customer.equipment_count ?? 0}</span>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5 text-xs">
                    <FileText className="w-3 h-3 text-[#444]" />
                    <span className="font-mono text-[#888]">{customer.active_contracts ?? 0} active</span>
                  </div>
                </Td>
                <Td>
                  <Link
                    href={`/customers/${customer.id}`}
                    onClick={e => e.stopPropagation()}
                    className="text-xs text-[#555] hover:text-[#00d4ff] transition-colors"
                  >
                    View →
                  </Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  )
}
