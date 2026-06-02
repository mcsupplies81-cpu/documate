'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Download, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { MOCK_CONTRACTS, MOCK_CONTRACT_EQUIPMENT } from '@/lib/mock-data'
import { formatCurrency, getDaysUntilExpiry } from '@/lib/billing'

type FilterType = 'all' | 'active' | 'expiring' | 'expired'

export default function ContractsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = MOCK_CONTRACTS.filter(c => {
    const matchSearch = c.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contract_number.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? c.status === 'active' :
      filter === 'expiring' ? c.status === 'expiring' :
      filter === 'expired' ? c.status === 'expired' : true
    return matchSearch && matchFilter
  })

  const getEndDateColor = (endDate: string | null, status: string) => {
    if (!endDate || status === 'expired') return 'text-[#ef4444]'
    const days = getDaysUntilExpiry(endDate)
    if (days < 0) return 'text-[#ef4444]'
    if (days <= 30) return 'text-[#ef4444]'
    if (days <= 60) return 'text-[#f59e0b]'
    return 'text-[#555]'
  }

  const contractCounts = {
    all: MOCK_CONTRACTS.length,
    active: MOCK_CONTRACTS.filter(c => c.status === 'active').length,
    expiring: MOCK_CONTRACTS.filter(c => c.status === 'expiring').length,
    expired: MOCK_CONTRACTS.filter(c => c.status === 'expired').length,
  }

  const exportCSV = () => {
    const headers = ['Contract #', 'Customer', 'Type', 'Status', 'Base Rate', 'Billing Cycle', 'Start', 'End', 'Auto-Renew']
    const rows = filtered.map(c => [
      c.contract_number, c.customer?.name || '', c.contract_type, c.status,
      c.base_rate, c.billing_cycle, c.start_date, c.end_date || '', c.auto_renew
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'contracts.csv'; a.click()
  }

  return (
    <div>
      <PageHeader
        title="Contracts"
        subtitle={`${filtered.length} contracts`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={exportCSV}><Download className="w-3.5 h-3.5" />Export</Button>
            <Link href="/contracts/new">
              <Button variant="primary" size="sm"><Plus className="w-3.5 h-3.5" />New Contract</Button>
            </Link>
          </>
        }
      />

      {/* Expiry alert */}
      {contractCounts.expiring > 0 && (
        <div className="bg-[#f59e0b0d] border border-[#f59e0b33] rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-sm text-[#f59e0b]">
            <strong>{contractCounts.expiring}</strong> contract{contractCounts.expiring > 1 ? 's are' : ' is'} expiring soon — review and renew before they lapse.
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#111] border border-[#222] rounded-md text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-[#111] border border-[#1e1e1e] rounded-md">
          {(['all', 'active', 'expiring', 'expired'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded transition-colors capitalize ${filter === f ? 'bg-[#1e1e1e] text-[#e8e8e8]' : 'text-[#555] hover:text-[#888]'}`}
            >
              {f} {f !== 'all' && <span className="ml-0.5 text-[#444]">({contractCounts[f]})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
        <Table>
          <Thead>
            <tr>
              <Th>Contract #</Th>
              <Th>Customer</Th>
              <Th>Type</Th>
              <Th>Equipment</Th>
              <Th>Base Rate</Th>
              <Th>Billing</Th>
              <Th>End Date</Th>
              <Th>Auto-Renew</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <EmptyRow cols={10} message="No contracts found" />}
            {filtered.map(contract => {
              const eqCount = MOCK_CONTRACT_EQUIPMENT.filter(ce => ce.contract_id === contract.id).length
              const days = contract.end_date ? getDaysUntilExpiry(contract.end_date) : null
              return (
                <Tr key={contract.id} onClick={() => window.location.href = `/contracts/${contract.id}`}>
                  <Td><span className="font-mono text-xs text-[#00d4ff]">{contract.contract_number}</span></Td>
                  <Td><span className="text-[#e8e8e8]">{contract.customer?.name}</span></Td>
                  <Td>
                    <Badge variant="muted">{contract.contract_type.replace('_', ' ')}</Badge>
                  </Td>
                  <Td><span className="font-mono text-xs text-[#888]">{eqCount}</span></Td>
                  <Td><span className="font-mono text-sm font-medium">{formatCurrency(contract.base_rate)}</span></Td>
                  <Td><span className="text-xs text-[#555] capitalize">{contract.billing_cycle}</span></Td>
                  <Td>
                    <span className={`text-xs font-mono ${getEndDateColor(contract.end_date, contract.status)}`}>
                      {contract.end_date || '—'}
                      {days !== null && days <= 60 && (
                        <span className="ml-1 text-[10px]">({days < 0 ? `${Math.abs(days)}d ago` : `${days}d`})</span>
                      )}
                    </span>
                  </Td>
                  <Td>
                    <span className={`text-xs ${contract.auto_renew ? 'text-[#22c55e]' : 'text-[#444]'}`}>
                      {contract.auto_renew ? 'Yes' : 'No'}
                    </span>
                  </Td>
                  <Td>
                    <Badge variant={
                      contract.status === 'active' ? 'success' :
                      contract.status === 'expiring' ? 'warning' :
                      contract.status === 'expired' ? 'danger' : 'muted'
                    }>
                      {contract.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Link href={`/contracts/${contract.id}`} onClick={e => e.stopPropagation()} className="text-xs text-[#555] hover:text-[#00d4ff]">
                      View →
                    </Link>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </div>
    </div>
  )
}
