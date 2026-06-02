'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Download, Activity } from 'lucide-react'
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
          <input
            type="text"
            placeholder="Search equipment..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#111] border border-[#222] rounded-md text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 p-1 bg-[#111] border border-[#1e1e1e] rounded-md">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded transition-colors capitalize ${statusFilter === s ? 'bg-[#1e1e1e] text-[#e8e8e8]' : 'text-[#555] hover:text-[#888]'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Customer filter */}
        <select
          value={customerFilter}
          onChange={e => setCustomerFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-[#111] border border-[#222] rounded-md text-[#888] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
        >
          <option value="">All Customers</option>
          {MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
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
            {filtered.length === 0 && <EmptyRow cols={9} message="No equipment found" />}
            {filtered.map(eq => (
              <Tr key={eq.id} onClick={() => window.location.href = `/equipment/${eq.id}`}>
                <Td>
                  <Link href={`/customers/${eq.customer_id}`} onClick={e => e.stopPropagation()} className="text-[#888] hover:text-[#00d4ff] transition-colors text-xs">
                    {eq.customer?.name || '—'}
                  </Link>
                </Td>
                <Td>
                  <div>
                    <div className="text-[#e8e8e8] text-sm">{eq.make} {eq.model}</div>
                    {eq.notes && <div className="text-[10px] text-[#444] truncate max-w-[160px]">{eq.notes}</div>}
                  </div>
                </Td>
                <Td><span className="font-mono text-xs text-[#888]">{eq.serial_number}</span></Td>
                <Td><span className="text-xs text-[#666]">{eq.install_date || '—'}</span></Td>
                <Td>
                  {eq.latest_reading
                    ? <span className="font-mono text-xs text-[#888]">{formatNumber(eq.latest_reading.bw_reading)}</span>
                    : <span className="text-xs text-[#333]">—</span>
                  }
                </Td>
                <Td>
                  {eq.latest_reading
                    ? <span className="font-mono text-xs text-[#888]">{formatNumber(eq.latest_reading.color_reading)}</span>
                    : <span className="text-xs text-[#333]">—</span>
                  }
                </Td>
                <Td>
                  {eq.latest_reading
                    ? <span className="text-xs text-[#555]">{eq.latest_reading.reading_date}</span>
                    : <span className="text-xs text-[#ef4444]">Never</span>
                  }
                </Td>
                <Td>
                  <Badge variant={eq.status === 'active' ? 'success' : eq.status === 'inactive' ? 'warning' : 'muted'}>
                    {eq.status}
                  </Badge>
                </Td>
                <Td>
                  <Link href={`/equipment/${eq.id}`} onClick={e => e.stopPropagation()} className="text-xs text-[#555] hover:text-[#00d4ff]">
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
