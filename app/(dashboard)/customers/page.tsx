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
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import {
  MOCK_CONTRACTS,
  MOCK_CUSTOMERS,
  MOCK_EQUIPMENT,
  MOCK_INVOICES,
  MOCK_LOCATIONS,
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

function ARStatusPill({ label, variant }: { label: string; variant: 'success' | 'warning' | 'danger' }) {
  const styles = {
    success: 'bg-[#d1fae5] text-[#047857]',
    warning: 'bg-[#fef3c7] text-[#b45309]',
    danger: 'bg-[#fee2e2] text-[#dc2626]',
  }

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${styles[variant]}`}>
      {label}
    </span>
  )
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [contractStatusFilter, setContractStatusFilter] = useState('all')
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
    const matchesLocation = locationFilter === 'all' || c.billing_address?.state === locationFilter
    const customerContracts = MOCK_CONTRACTS.filter(contract => contract.customer_id === c.id)
    const matchesContractStatus = contractStatusFilter === 'all' || customerContracts.some(contract => contract.status === contractStatusFilter)

    return matchesSearch && matchesStatus && matchesLocation && matchesContractStatus
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
            <Button variant="secondary" size="sm" onClick={exportCSV}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#eff6ff]">
              <Users className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <div>
              <div className="text-xs text-[#475569] font-medium">Total Customers</div>
              <div className="text-2xl font-semibold text-[#0f172a] tabular-nums leading-tight mt-1">{totalCustomers}</div>
              <div className="text-xs text-[#64748b] mt-1.5">All accounts</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#d1fae5]">
              <FileText className="w-5 h-5 text-[#059669]" />
            </div>
            <div>
              <div className="text-xs text-[#475569] font-medium">Active Contracts</div>
              <div className="text-2xl font-semibold text-[#0f172a] tabular-nums leading-tight mt-1">{activeContracts}</div>
              <div className="text-xs text-[#64748b] mt-1.5">{Math.round(activeContracts / totalCustomers * 100)}% of customers</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#dbeafe]">
              <Printer className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div>
              <div className="text-xs text-[#475569] font-medium">Installed Devices</div>
              <div className="text-2xl font-semibold text-[#0f172a] tabular-nums leading-tight mt-1">{installedDevices}</div>
              <div className="text-xs text-[#64748b] mt-1.5">Across all locations</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#fee2e2]">
              <Wrench className="w-5 h-5 text-[#ef4444]" />
            </div>
            <div>
              <div className="text-xs text-[#475569] font-medium">Open Service Issues</div>
              <div className="text-2xl font-semibold text-[#0f172a] tabular-nums leading-tight mt-1">{openServiceIssues}</div>
              <div className="text-xs text-[#64748b] mt-1.5">Requires attention</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr_1fr_1fr_1fr_auto] gap-4 p-5 border-b border-[#e5e7eb]">
          <div className="relative flex items-end">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-9 h-10 text-sm bg-white border border-[#dbe3ee] rounded-lg text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-[#475569] mb-1.5">Status</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-[#dbe3ee] rounded-lg text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-[#475569] mb-1.5">Location</span>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-[#dbe3ee] rounded-lg text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="all">All Locations</option>
              {[...new Set(MOCK_LOCATIONS.map(location => location.address?.state).filter(Boolean))].map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-[#475569] mb-1.5">Contract Status</span>
            <select
              value={contractStatusFilter}
              onChange={e => setContractStatusFilter(e.target.value)}
              className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-[#dbe3ee] rounded-lg text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="all">All Contracts</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-[#475569] mb-1.5">Sort</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-[#dbe3ee] rounded-lg text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="name_asc">Customer A–Z</option>
              <option value="name_desc">Customer Z–A</option>
              <option value="equipment_desc">Most Equipment</option>
              <option value="contracts_desc">Most Contracts</option>
            </select>
          </label>

          <button className="self-end h-10 w-12 flex items-center justify-center bg-white border border-[#dbe3ee] rounded-lg text-[#475569] hover:text-[#0f172a] hover:border-[#cbd5e1] transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
        <Table>
          <Thead>
            <tr>
              <Th>Customer</Th>
              <Th>Primary Contact</Th>
              <Th>Location</Th>
              <Th>Equipment</Th>
              <Th>Contracts</Th>
              <Th>AR Status</Th>
              <Th>Action</Th>
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
                  <Td className="py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                        style={{ backgroundColor: avatar.bg, color: avatar.text }}
                      >
                        {getInitials(customer.name)}
                      </div>
                      <div>
                        <div className="text-[#0f172a] font-semibold">{customer.name}</div>
                        {customer.notes && (
                          <div className="text-xs text-[#64748b] truncate max-w-[240px] mt-1">{customer.notes}</div>
                        )}
                      </div>
                    </div>
                  </Td>

                  <Td className="py-4">
                    <div className="space-y-1.5">
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                          <Phone className="w-3 h-3 flex-shrink-0" />{customer.phone}
                        </div>
                      )}
                    </div>
                  </Td>

                  <Td className="py-4">
                    {customer.billing_address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 text-[#64748b] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-[#334155]">
                            {customer.billing_address.city}, {customer.billing_address.state}
                          </div>
                          <div className="text-[11px] text-[#64748b]">1 location</div>
                        </div>
                      </div>
                    )}
                  </Td>

                  <Td className="py-4">
                    <div className="flex items-start gap-2">
                      <Printer className="w-4 h-4 text-[#64748b] mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold tabular-nums text-[#0f172a]">{eqCount}</div>
                        <div className="text-[11px] text-[#64748b]">devices</div>
                      </div>
                    </div>
                  </Td>

                  <Td className="py-4">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-[#64748b] mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold tabular-nums text-[#0f172a]">{contractCount}</div>
                        <div className="text-[11px] text-[#64748b]">active</div>
                      </div>
                    </div>
                  </Td>

                  <Td className="py-4">
                    <ARStatusPill label={ar.label} variant={ar.variant} />
                  </Td>

                  <Td className="py-4">
                    <button
                      onClick={e => e.stopPropagation()}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#dbe3ee] bg-white text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] transition-colors"
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
