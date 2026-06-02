'use client'
import Link from 'next/link'
import { AlertTriangle, TrendingUp, Gauge, Wrench, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/ui/table'
import { MOCK_METRICS, MOCK_SERVICE_CALLS, MOCK_CONTRACTS, MOCK_INVOICES } from '@/lib/mock-data'
import { formatCurrency, getDaysUntilExpiry } from '@/lib/billing'

function getStatusColor(status: string) {
  switch (status) {
    case 'open': return 'danger'
    case 'in_progress': return 'warning'
    case 'completed': return 'success'
    case 'closed': return 'muted'
    case 'active': return 'success'
    case 'expiring': return 'warning'
    case 'expired': return 'danger'
    case 'sent': return 'info'
    case 'paid': return 'success'
    case 'overdue': return 'danger'
    case 'draft': return 'muted'
    default: return 'default'
  }
}

function getCallAge(openedAt: string): { label: string; color: string } {
  const hours = (Date.now() - new Date(openedAt).getTime()) / 3600000
  if (hours < 4) return { label: `${Math.round(hours)}h`, color: 'text-[#22c55e]' }
  if (hours < 24) return { label: `${Math.round(hours)}h`, color: 'text-[#f59e0b]' }
  const days = Math.floor(hours / 24)
  return { label: `${days}d ${Math.round(hours % 24)}h`, color: 'text-[#ef4444]' }
}

export default function DashboardPage() {
  const m = MOCK_METRICS
  const openCalls = MOCK_SERVICE_CALLS.filter(c => c.status === 'open' || c.status === 'in_progress')
  const expiringContracts = MOCK_CONTRACTS.filter(c => {
    if (!c.end_date) return false
    const days = getDaysUntilExpiry(c.end_date)
    return days >= 0 && days <= 60
  })
  const recentInvoices = MOCK_INVOICES.slice(0, 5)

  const mrrFormatted = formatCurrency(m.monthly_recurring_revenue)
  const outstandingFormatted = formatCurrency(m.invoices_outstanding_amount)
  const meterPct = Math.round((m.meters_collected / m.meters_due) * 100)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        actions={
          <Link href="/invoices/run" className="inline-flex items-center gap-2 px-4 py-2 bg-[#00d4ff] text-[#0a0a0a] rounded-md text-sm font-semibold hover:bg-[#00bde8] transition-colors">
            <TrendingUp className="w-4 h-4" />
            Run Billing
          </Link>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Monthly Revenue"
          value={mrrFormatted}
          sub={`${m.active_contracts} active contracts`}
          color="info"
        />
        <StatCard
          label="Open Service Calls"
          value={m.open_service_calls}
          sub="Requires attention"
          color={m.open_service_calls > 3 ? 'warning' : 'default'}
        />
        <StatCard
          label="Meters Collected"
          value={`${m.meters_collected}/${m.meters_due}`}
          sub={`${meterPct}% this cycle`}
          color={meterPct === 100 ? 'success' : meterPct > 70 ? 'warning' : 'danger'}
        />
        <StatCard
          label="Outstanding AR"
          value={outstandingFormatted}
          sub={`${m.invoices_outstanding_count} invoices`}
          color={m.invoices_outstanding_amount > 500 ? 'warning' : 'default'}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard label="Active Customers" value={m.active_customers} />
        <StatCard label="Active Equipment" value={m.active_equipment} />
        <StatCard
          label="Expiring (30d)"
          value={m.contracts_expiring_30}
          color={m.contracts_expiring_30 > 0 ? 'danger' : 'success'}
        />
        <StatCard
          label="Expiring (60d)"
          value={m.contracts_expiring_30 + m.contracts_expiring_60}
          color={(m.contracts_expiring_30 + m.contracts_expiring_60) > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Meter progress bar */}
      {meterPct < 100 && (
        <div className="bg-[#111] border border-[#f59e0b33] rounded-lg p-3 mb-6 flex items-center gap-3">
          <Gauge className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#f59e0b] font-medium">Meter Collection in Progress</span>
              <span className="text-[#888] font-mono">{m.meters_collected}/{m.meters_due}</span>
            </div>
            <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
                style={{ width: `${meterPct}%` }}
              />
            </div>
          </div>
          <Link href="/meters" className="text-xs text-[#f59e0b] hover:underline flex-shrink-0">
            Enter readings →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Open Service Calls */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#555]" />
              <span className="text-sm font-medium">Open Service Calls</span>
            </div>
            <Link href="/service" className="text-xs text-[#00d4ff] hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {openCalls.slice(0, 5).map(call => {
              const age = getCallAge(call.opened_at)
              return (
                <Link key={call.id} href={`/service/${call.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#141414] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#e8e8e8] truncate">{call.customer?.name}</div>
                    <div className="text-xs text-[#555] truncate">{call.problem_description?.slice(0, 60)}…</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={getStatusColor(call.status) as 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'default'}>{call.status.replace('_', ' ')}</Badge>
                    <span className={`text-xs font-mono ${age.color}`}>{age.label}</span>
                  </div>
                </Link>
              )
            })}
            {openCalls.length === 0 && (
              <div className="flex items-center gap-2 px-4 py-6 text-[#444] text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                All caught up — no open calls
              </div>
            )}
          </div>
        </div>

        {/* Expiring Contracts */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#555]" />
              <span className="text-sm font-medium">Expiring Contracts</span>
            </div>
            <Link href="/contracts?filter=expiring" className="text-xs text-[#00d4ff] hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {expiringContracts.slice(0, 5).map(contract => {
              const days = getDaysUntilExpiry(contract.end_date!)
              const isExpired = days < 0
              return (
                <Link key={contract.id} href={`/contracts/${contract.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#141414] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#e8e8e8] truncate">{contract.customer?.name}</div>
                    <div className="text-xs text-[#555] font-mono">{contract.contract_number}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs font-mono font-semibold ${isExpired ? 'text-[#ef4444]' : days <= 30 ? 'text-[#ef4444]' : 'text-[#f59e0b]'}`}>
                      {isExpired ? `${Math.abs(days)}d ago` : `${days}d left`}
                    </div>
                    <div className="text-[10px] text-[#444]">{contract.end_date}</div>
                  </div>
                </Link>
              )
            })}
            {expiringContracts.length === 0 && (
              <div className="flex items-center gap-2 px-4 py-6 text-[#444] text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                No contracts expiring soon
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#555]" />
            <span className="text-sm font-medium">Recent Invoices</span>
          </div>
          <Link href="/invoices" className="text-xs text-[#00d4ff] hover:underline">View all →</Link>
        </div>
        <Table>
          <Thead>
            <tr>
              <Th>Invoice #</Th>
              <Th>Customer</Th>
              <Th>Period</Th>
              <Th>Total</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
            </tr>
          </Thead>
          <Tbody>
            {recentInvoices.map(inv => (
              <Tr key={inv.id} onClick={() => {}} className="cursor-pointer">
                <Td><span className="font-mono text-[#00d4ff] text-xs">{inv.invoice_number}</span></Td>
                <Td><span className="text-[#e8e8e8]">{inv.customer?.name}</span></Td>
                <Td><span className="text-xs text-[#666]">{inv.billing_period_start} – {inv.billing_period_end}</span></Td>
                <Td><span className="font-mono font-medium">{formatCurrency(inv.total)}</span></Td>
                <Td>
                  <span className={`text-xs font-mono ${inv.status === 'overdue' ? 'text-[#ef4444]' : 'text-[#666]'}`}>
                    {inv.due_date || '—'}
                  </span>
                </Td>
                <Td>
                  <Badge variant={getStatusColor(inv.status) as 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'default'}>
                    {inv.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  )
}
