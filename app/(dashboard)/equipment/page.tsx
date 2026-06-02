'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Download, X, Monitor } from 'lucide-react'
import { FilterTabs } from '@/components/ui/filter-tabs'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { getEquipmentWithReadings, MOCK_CUSTOMERS } from '@/lib/mock-data'
import { formatNumber } from '@/lib/billing'

const statusOptions = ['all', 'active', 'inactive', 'removed'] as const
type StatusFilter = typeof statusOptions[number]

export default function EquipmentPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [customerFilter, setCustomerFilter] = useState('')

  const allEquipment = getEquipmentWithReadings()

  const filtered = allEquipment.filter(eq => {
    const matchSearch = (
      eq.make.toLowerCase().includes(search.toLowerCase()) ||
      eq.model.toLowerCase().includes(search.toLowerCase()) ||
      eq.serial_number.toLowerCase().includes(search.toLowerCase()) ||
      eq.customer?.name.toLowerCase().includes(search.toLowerCase())
    )
    const matchStatus = statusFilter === 'all' || eq.status === statusFilter
    const matchCustomer = !customerFilter || eq.customer_id === customerFilter
    return matchSearch && matchStatus && matchCustomer
  })

  const exportCSV = () => {
    const headers = ['Customer', 'Make', 'Model', 'Serial #', 'Status', 'Install Date', 'Last B&W', 'Last Color', 'Last Reading Date']
    const rows = filtered.map(eq => [
      eq.customer?.name || '', eq.make, eq.model, eq.serial_number, eq.status,
      eq.install_date || '', eq.latest_reading?.bw_reading || '',
      eq.latest_reading?.color_reading || '', eq.latest_reading?.reading_date || '',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'equipment.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Equipment"
        subtitle={`${filtered.length} of ${allEquipment.length} assets`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={exportCSV}>
              <Download className="w-3.5 h-3.5" />Export
            </Button>
            <Link href="/equipment/new">
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5" />Add Equipment
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search equipment..."
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

        <FilterTabs
          options={[
            { key: 'all' as StatusFilter, label: 'All', count: allEquipment.length },
            { key: 'active' as StatusFilter, label: 'Active', count: allEquipment.filter(e => e.status === 'active').length },
            { key: 'inactive' as StatusFilter, label: 'Inactive', count: allEquipment.filter(e => e.status === 'inactive').length },
            { key: 'removed' as StatusFilter, label: 'Removed', count: allEquipment.filter(e => e.status === 'removed').length },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        {/* Customer filter */}
        <select
          value={customerFilter}
          onChange={e => setCustomerFilter(e.target.value)}
          className="h-9 px-3 text-sm bg-white border border-[#e5e7eb] rounded-md text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#5c5fef]"
        >
          <option value="">All Customers</option>
          {MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <Table>
          <Thead>
            <tr>
              <Th>Customer</Th>
              <Th>Make / Model</Th>
              <Th>Serial #</Th>
              <Th>Installed</Th>
              <Th>Last B&W</Th>
              <Th>Last Color</Th>
              <Th>Last Read</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <EmptyRow cols={9} message="No equipment found" icon={Monitor} />}
            {filtered.map(eq => (
              <Tr key={eq.id} onClick={() => window.location.href = `/equipment/${eq.id}`}>
                <Td>
                  <Link href={`/customers/${eq.customer_id}`} onClick={e => e.stopPropagation()} className="text-[#5c5fef] hover:underline text-xs font-medium">
                    {eq.customer?.name || '—'}
                  </Link>
                </Td>
                <Td>
                  <div>
                    <div className="text-[#111827] font-medium">{eq.make} {eq.model}</div>
                    {eq.notes && <div className="text-[10px] text-[#9ca3af] truncate max-w-[160px]">{eq.notes}</div>}
                  </div>
                </Td>
                <Td><span className="font-mono text-xs text-[#6b7280]">{eq.serial_number}</span></Td>
                <Td><span className="text-xs text-[#6b7280]">{eq.install_date || '—'}</span></Td>
                <Td>
                  {eq.latest_reading
                    ? <span className="font-mono text-xs text-[#374151]">{formatNumber(eq.latest_reading.bw_reading)}</span>
                    : <span className="text-xs text-[#9ca3af]">—</span>
                  }
                </Td>
                <Td>
                  {eq.latest_reading
                    ? <span className="font-mono text-xs text-[#374151]">{formatNumber(eq.latest_reading.color_reading)}</span>
                    : <span className="text-xs text-[#9ca3af]">—</span>
                  }
                </Td>
                <Td>
                  {eq.latest_reading
                    ? <span className="text-xs text-[#6b7280]">{eq.latest_reading.reading_date}</span>
                    : <span className="text-xs text-[#dc2626] font-medium">Never</span>
                  }
                </Td>
                <Td>
                  <Badge variant={eq.status === 'active' ? 'success' : eq.status === 'inactive' ? 'warning' : 'muted'}>
                    {eq.status}
                  </Badge>
                </Td>
                <Td>
                  <Link href={`/equipment/${eq.id}`} onClick={e => e.stopPropagation()} className="text-xs text-[#5c5fef] hover:underline font-medium">
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
