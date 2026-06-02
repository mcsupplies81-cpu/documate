'use client'
import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Download, Search, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
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
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-3">
          <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Outstanding AR</div>
          <div className="text-2xl font-mono font-semibold text-[#f59e0b]">{formatCurrency(totals.outstanding)}</div>
          <div className="text-xs text-[#444] mt-0.5">{MOCK_INVOICES.filter(i => i.status === 'sent' || i.status === 'overdue').length} invoices</div>
        </div>
        <div className="bg-[#111] border border-[#ef444422] rounded-lg p-3">
          <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Overdue</div>
          <div className="text-2xl font-mono font-semibold text-[#ef4444]">{formatCurrency(totals.overdue)}</div>
          <div className="text-xs text-[#444] mt-0.5">{MOCK_INVOICES.filter(i => i.status === 'overdue').length} invoices</div>
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-3">
          <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Collected (This Month)</div>
          <div className="text-2xl font-mono font-semibold text-[#22c55e]">{formatCurrency(totals.paid_this_month)}</div>
          <div className="text-xs text-[#444] mt-0.5">{MOCK_INVOICES.filter(i => i.status === 'paid').length} invoices</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#111] border border-[#222] rounded-md text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#111] border border-[#1e1e1e] rounded-md">
          {(['all', 'draft', 'sent', 'paid', 'overdue'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded transition-colors ${statusFilter === s ? 'bg-[#1e1e1e] text-[#e8e8e8]' : 'text-[#555] hover:text-[#888]'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
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
            {filtered.length === 0 && <EmptyRow cols={8} message="No invoices found" />}
            {filtered.map(inv => (
              <Tr key={inv.id}>
                <Td><span className="font-mono text-xs text-[#00d4ff]">{inv.invoice_number}</span></Td>
                <Td><span className="text-[#e8e8e8]">{inv.customer?.name}</span></Td>
                <Td>
                  {inv.contract_id
                    ? <Link href={`/contracts/${inv.contract_id}`} className="text-xs text-[#555] hover:text-[#00d4ff] font-mono">
                        {inv.contract?.contract_number || inv.contract_id.slice(-8)}
                      </Link>
                    : <span className="text-xs text-[#333]">—</span>
                  }
                </Td>
                <Td>
                  <span className="text-xs text-[#666]">
                    {inv.billing_period_start} – {inv.billing_period_end}
                  </span>
                </Td>
                <Td><span className="font-mono font-medium">{formatCurrency(inv.total)}</span></Td>
                <Td>
                  <span className={`text-xs font-mono ${inv.status === 'overdue' ? 'text-[#ef4444] font-semibold' : 'text-[#666]'}`}>
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
                    <button className="text-xs text-[#555] hover:text-[#22c55e] transition-colors">
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
