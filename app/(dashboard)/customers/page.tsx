'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Download,
  MapPin,
  Phone,
  Mail,
  Printer,
  FileText,
  X,
  Users,
  SlidersHorizontal,
  MoreHorizontal,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import {
  MOCK_CONTRACTS,
  MOCK_CUSTOMERS,
  MOCK_EQUIPMENT,
  MOCK_INVOICES,
  MOCK_SERVICE_CALLS,
} from '@/lib/mock-data'

function getAvatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: '#dbeafe', text: '#1d4ed8' }, // blue
    { bg: '#dcfce7', text: '#15803d' }, // green
    { bg: '#fef3c7', text: '#b45309' }, // amber
    { bg: '#ede9fe', text: '#6d28d9' }, // violet
    { bg: '#fce7f3', text: '#be185d' }, // pink
    { bg: '#cffafe', text: '#0e7490' }, // cyan
    { bg: '#fee2e2', text: '#b91c1c' }, // red
    { bg: '#f3f4f6', text: '#374151' }, // gray
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function getARStatus(customerId: string): { label: string; variant: 'success' | 'warning' | 'danger' } {
  const custInvoices = MOCK_INVOICES.filter(i => i.customer_id === customerId)
  if (custInvoices.some(i => i.status === 'overdue')) return { label: 'Overdue', variant: 'danger' }
  if (custInvoices.some(i => i.status === 'sent')) return { label: 'Attention', variant: 'warning' }
  return { label: 'Good Standing', variant: 'success' }
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name_asc')

  const totalCustomers = MOCK_CUSTOMERS.length
  const activeContracts = MOCK_CONTRACTS.filter(c => c.status === 'active' || c.status === 'expiring').length
  const installedDevices = MOCK_EQUIPMENT.filter(e => e.status === 'active').length
  const openServiceIssues = MOCK_SERVICE_CALLS.filter(s => s.status === 'open' || s.status === 'in_progress').length

  const filtered = MOCK_CUSTOMERS.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    const customerStatus = 'status' in c && typeof c.status === 'string' ? c.status : 'active'
    const matchesStatus = statusFilter === 'all' || customerStatus === statusFilter

    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name)
    if (sortBy === 'equipment_desc') return (b.equipment_count ?? 0) - (a.equipment_count ?? 0)
    if (sortBy === 'contracts_desc') return (b.active_contracts ?? 0) - (a.active_contracts ?? 0)
    return 0
  })

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
        subtitle={`${MOCK_CUSTOMERS.length} active customer accounts`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={exportCSV}>
              <Download className="w-3.5 h-3.5" />Export
            </Button>
            <Link href="/customers/new">
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5" />New Customer
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <div className="bg-white border border-[#ebebeb] rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#eff6ff]">
              <Users className="w-4 h-4 text-[#3b82f6]" />
            </div>
            <div>
              <div className="text-xs text-[#6b7280] font-medium">Total Customers</div>
              <div className="text-2xl font-semibold text-[#111827] tabular-nums leading-tight">{totalCustomers}</div>
              <div className="text-xs text-[#9ca3af] mt-0.5">All accounts</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#f0fdf4]">
              <FileText className="w-4 h-4 text-[#16a34a]" />
            </div>
            <div>
              <div className="text-xs text-[#6b7280] font-medium">Active Contracts</div>
              <div className="text-2xl font-semibold text-[#111827] tabular-nums leading-tight">{activeContracts}</div>
              <div className="text-xs text-[#9ca3af] mt-0.5">{Math.round(activeContracts / totalCustomers * 100)}% of customers</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#f5f3ff]">
              <Printer className="w-4 h-4 text-[#7c3aed]" />
            </div>
            <div>
              <div className="text-xs text-[#6b7280] font-medium">Installed Devices</div>
              <div className="text-2xl font-semibold text-[#111827] tabular-nums leading-tight">{installedDevices}</div>
              <div className="text-xs text-[#9ca3af] mt-0.5">Across all locations</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#fff7ed]">
              <Wrench className="w-4 h-4 text-[#ea580c]" />
            </div>
            <div>
              <div className="text-xs text-[#6b7280] font-medium">Open Service Issues</div>
              <div className="text-2xl font-semibold text-[#111827] tabular-nums leading-tight">{openServiceIssues}</div>
              <div className="text-xs text-[#9ca3af] mt-0.5">Requires attention</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 h-9 text-sm bg-white border border-[#e5e7eb] rounded-lg text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#5c5fef] focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 pl-3 pr-8 text-sm bg-white border border-[#e5e7eb] rounded-lg text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#5c5fef]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="h-9 pl-3 pr-8 text-sm bg-white border border-[#e5e7eb] rounded-lg text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#5c5fef]"
        >
          <option value="name_asc">Customer A–Z</option>
          <option value="name_desc">Customer Z–A</option>
          <option value="equipment_desc">Most Equipment</option>
          <option value="contracts_desc">Most Contracts</option>
        </select>

        <button className="h-9 w-9 flex items-center justify-center bg-white border border-[#e5e7eb] rounded-lg text-[#6b7280] hover:text-[#374151] hover:border-[#d1d5db] transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <Table>
          <Thead>
            <tr>
              <Th>Customer</Th>
              <Th>Primary Contact</Th>
              <Th>Location</Th>
              <Th>Equipment</Th>
              <Th>Contracts</Th>
              <Th>AR Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <EmptyRow cols={7} message="No customers match your search" icon={Users} />}
            {filtered.map(customer => {
              const avatar = getAvatarColor(customer.name)
              const ar = getARStatus(customer.id)
              const eqCount = customer.equipment_count ?? 0
              const contractCount = customer.active_contracts ?? 0
              return (
                <Tr key={customer.id} onClick={() => window.location.href = `/customers/${customer.id}`}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: avatar.bg, color: avatar.text }}
                      >
                        {getInitials(customer.name)}
                      </div>
                      <div>
                        <div className="text-[#111827] font-medium">{customer.name}</div>
                        {customer.notes && (
                          <div className="text-xs text-[#9ca3af] truncate max-w-[220px]">{customer.notes}</div>
                        )}
                      </div>
                    </div>
                  </Td>

                  <Td>
                    <div className="space-y-0.5">
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                          <Phone className="w-3 h-3 flex-shrink-0" />{customer.phone}
                        </div>
                      )}
                    </div>
                  </Td>

                  <Td>
                    {customer.billing_address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-[#9ca3af] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-[#374151]">
                            {customer.billing_address.city}, {customer.billing_address.state}
                          </div>
                          <div className="text-[11px] text-[#9ca3af]">1 location</div>
                        </div>
                      </div>
                    )}
                  </Td>

                  <Td>
                    <div className="flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5 text-[#9ca3af]" />
                      <div>
                        <div className="text-sm font-semibold tabular-nums text-[#111827]">{eqCount}</div>
                        <div className="text-[11px] text-[#9ca3af]">devices</div>
                      </div>
                    </div>
                  </Td>

                  <Td>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#9ca3af]" />
                      <div>
                        <div className="text-sm font-semibold tabular-nums text-[#111827]">{contractCount}</div>
                        <div className="text-[11px] text-[#9ca3af]">active</div>
                      </div>
                    </div>
                  </Td>

                  <Td>
                    <Badge variant={ar.variant}>{ar.label}</Badge>
                  </Td>

                  <Td>
                    <button
                      onClick={e => e.stopPropagation()}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0f0f0]">
          <span className="text-xs text-[#6b7280]">
            Showing 1 to {filtered.length} of {MOCK_CUSTOMERS.length} customers
          </span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e7eb] text-[#9ca3af] hover:border-[#d1d5db] disabled:opacity-40" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded border border-[#5c5fef] bg-[#5c5fef] text-white text-xs font-medium">
              1
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e7eb] text-[#9ca3af] hover:border-[#d1d5db] disabled:opacity-40" disabled>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
