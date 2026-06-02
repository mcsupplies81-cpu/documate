'use client'
import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Download, Search, X, Receipt } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { FilterTabs } from '@/components/ui/filter-tabs'
import { MOCK_INVOICES } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'

type StatusFilter = 'all' | 'draft' | 'sent' | 'paid' | 'overdue'

export default function InvoicesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = MOCK_INVOICES.filter(inv => {
    const matchSearch = inv.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  const totals = {
    outstanding: MOCK_INVOICES.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    overdue: MOCK_INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    paid_this_month: MOCK_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
  }

  const exportCSV = () => {
    const headers = ['Invoice #', 'Customer', 'Period Start', 'Period End', 'Total', 'Status', 'Due Date', 'Paid At']
    const rows = filtered.map(i => [
      i.invoice_number, i.customer?.name || '', i.billing_period_start || '', i.billing_period_end || '',
      i.total, i.status, i.due_date || '', i.paid_at ? new Date(i.paid_at).toLocaleDateString() : ''
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click()
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={exportCSV}><Download className="w-3.5 h-3.5" />Export</Button>
            <Link href="/invoices/run">
              <Button variant="primary" size="sm"><TrendingUp className="w-3.5 h-3.5" />Run Billing</Button>
            </Link>
          </>
        }
      />

      {/* AR summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Outstanding AR</div>
          <div className="text-2xl font-semibold text-[#d97706] tabular-nums">{formatCurrency(totals.outstanding)}</div>
          <div className="text-xs text-[#9ca3af] mt-1">{MOCK_INVOICES.filter(i => i.status === 'sent' || i.status === 'overdue').length} invoices</div>
        </div>
        <div className="bg-white border border-[#fecaca] rounded-lg p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Overdue</div>
          <div className="text-2xl font-semibold text-[#dc2626] tabular-nums">{formatCurrency(totals.overdue)}</div>
          <div className="text-xs text-[#9ca3af] mt-1">{MOCK_INVOICES.filter(i => i.status === 'overdue').length} invoices</div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">Collected (This Month)</div>
          <div className="text-2xl font-semibold text-[#16a34a] tabular-nums">{formatCurrency(totals.paid_this_month)}</div>
          <div className="text-xs text-[#9ca3af] mt-1">{MOCK_INVOICES.filter(i => i.status === 'paid').length} invoices</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 h-9 text-sm bg-white border border-[#e5e7eb] rounded-lg text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <FilterTabs
          options={[
            { key: 'all' as StatusFilter, label: 'All', count: MOCK_INVOICES.length },
            { key: 'draft' as StatusFilter, label: 'Draft', count: MOCK_INVOICES.filter(i => i.status === 'draft').length },
            { key: 'sent' as StatusFilter, label: 'Sent', count: MOCK_INVOICES.filter(i => i.status === 'sent').length },
            { key: 'paid' as StatusFilter, label: 'Paid', count: MOCK_INVOICES.filter(i => i.status === 'paid').length },
            { key: 'overdue' as StatusFilter, label: 'Overdue', count: MOCK_INVOICES.filter(i => i.status === 'overdue').length },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
        <Table>
          <Thead>
            <tr>
              <Th>Invoice #</Th>
              <Th>Customer</Th>
              <Th>Contract</Th>
              <Th>Period</Th>
              <Th>Amount</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <EmptyRow cols={8} message="No invoices found" icon={Receipt} />}
            {filtered.map(inv => (
              <Tr key={inv.id}>
                <Td><Link href={`/invoices/${inv.id}`} className="font-mono text-xs text-[#2563eb] hover:underline font-medium">{inv.invoice_number}</Link></Td>
                <Td><span className="text-[#111827] font-medium">{inv.customer?.name}</span></Td>
                <Td>
                  {inv.contract_id
                    ? <Link href={`/contracts/${inv.contract_id}`} className="text-xs text-[#6b7280] hover:text-[#2563eb] font-mono">
                        {inv.contract?.contract_number || inv.contract_id.slice(-8)}
                      </Link>
                    : <span className="text-xs text-[#9ca3af]">—</span>
                  }
                </Td>
                <Td>
                  <span className="text-xs text-[#6b7280]">
                    {inv.billing_period_start} – {inv.billing_period_end}
                  </span>
                </Td>
                <Td><span className="font-semibold tabular-nums">{formatCurrency(inv.total)}</span></Td>
                <Td>
                  <span className={`text-xs tabular-nums ${inv.status === 'overdue' ? 'text-[#dc2626] font-semibold' : 'text-[#6b7280]'}`}>
                    {inv.due_date || '—'}
                  </span>
                </Td>
                <Td>
                  <Badge variant={
                    inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' :
                    inv.status === 'sent' ? 'info' : 'muted'
                  }>{inv.status}</Badge>
                </Td>
                <Td>
                  {inv.status !== 'paid' && (
                    <button className="text-xs text-[#6b7280] hover:text-[#16a34a] transition-colors font-medium">
                      Mark Paid
                    </button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  )
}
