'use client'
import Link from 'next/link'
import { TrendingUp, Gauge, Wrench, FileText, CheckCircle2, CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/ui/table'
import { MOCK_METRICS, MOCK_SERVICE_CALLS, MOCK_CONTRACTS, MOCK_INVOICES } from '@/lib/mock-data'
import { formatCurrency, getDaysUntilExpiry } from '@/lib/billing'
import { AlertsPanel } from '@/components/alerts-panel'
import { Button } from '@/components/ui/button'

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

const STATUS_DOT: Record<string, { color: string; label: string }> = {
  open: { color: '#dc2626', label: 'Open' },
  in_progress: { color: '#d97706', label: 'In Progress' },
  completed: { color: '#16a34a', label: 'Completed' },
  closed: { color: '#9ca3af', label: 'Closed' },
}

const INV_STATUS: Record<string, { color: string; label: string }> = {
  paid: { color: '#16a34a', label: 'Paid' },
  sent: { color: '#5c5fef', label: 'Sent' },
  overdue: { color: '#dc2626', label: 'Overdue' },
  draft: { color: '#9ca3af', label: 'Draft' },
}

function getCallAge(openedAt: string): { label: string; color: string } {
  const hours = (Date.now() - new Date(openedAt).getTime()) / 3600000
  if (hours < 4) return { label: `${Math.round(hours)}h`, color: 'text-[#16a34a]' }
  if (hours < 24) return { label: `${Math.round(hours)}h`, color: 'text-[#d97706]' }
  const days = Math.floor(hours / 24)
  return { label: `${days}d ${Math.round(hours % 24)}h`, color: 'text-[#dc2626]' }
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
  const overdueTotal = MOCK_INVOICES.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0)
  const meterPct = Math.round((m.meters_collected / m.meters_due) * 100)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <Link href="/invoices/run">
            <Button variant="primary" size="sm">
              <TrendingUp className="w-3.5 h-3.5" />
              Run Billing
            </Button>
          </Link>
        }
      />

      <AlertsPanel />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <StatCard
          label="Monthly Revenue"
          value={mrrFormatted}
          sub={`${m.active_customers} customers · ${m.active_contracts} contracts`}
          color="info"
          icon={TrendingUp}
          trend={{ direction: 'up', label: '12.4% vs May 2026', color: '#16a34a' }}
        />
        <StatCard
          label="Open Service Calls"
          value={m.open_service_calls}
          sub={`${m.active_equipment} active machines`}
          color={m.open_service_calls > 3 ? 'warning' : 'default'}
          icon={Wrench}
          trend={{ direction: 'neutral', label: '2 urgent', color: '#dc2626' }}
        />
        <StatCard
          label="Meters Collected"
          value={`${m.meters_collected}/${m.meters_due}`}
          sub={`${meterPct}% this cycle`}
          color={meterPct === 100 ? 'success' : meterPct > 70 ? 'warning' : 'danger'}
          icon={Gauge}
          trend={{ direction: 'down', label: '3 days remaining', color: '#6b7280' }}
        />
        <StatCard
          label="Outstanding AR"
          value={outstandingFormatted}
          sub={`${m.invoices_outstanding_count} invoices · ${m.contracts_expiring_30} expiring soon`}
          color={m.invoices_outstanding_amount > 500 ? 'warning' : 'default'}
          icon={CreditCard}
          trend={{ direction: 'down', label: `${formatCurrency(overdueTotal)} overdue`, color: '#dc2626' }}
        />
        <StatCard
          label="Active Contracts"
          value={m.active_contracts}
          sub={`Across ${m.active_customers} customers`}
          color="info"
          icon={FileText}
          trend={{ direction: 'up', label: `${m.contracts_expiring_30} expiring this month`, color: '#d97706' }}
        />
      </div>

      {/* Meter progress bar */}
      <div className="bg-white border border-[#ebebeb] rounded-xl p-5 mb-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1">
              Meter Collection Progress
            </div>
            <div className="text-2xl font-semibold text-[#111827]">
              <span className="tabular-nums">{m.meters_collected}</span>
              <span className="text-[#9ca3af] font-normal"> of </span>
              <span className="tabular-nums">{m.meters_due}</span>
              <span className="text-base font-normal text-[#6b7280] ml-1.5">meters collected</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-semibold tabular-nums text-[#111827]">{meterPct}%</span>
            <Link href="/meters">
              <Button variant="outline" size="sm">Enter Readings →</Button>
            </Link>
          </div>
        </div>
        <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5c5fef] rounded-full transition-all duration-700"
            style={{ width: `${meterPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Open Service Calls */}
        <div className="bg-white border border-[#ebebeb] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#9ca3af]" />
              <span className="text-sm font-semibold text-[#111827]">Open Service Calls</span>
            </div>
            <Link href="/service" className="text-xs text-[#5c5fef] hover:underline font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-[#f7f7f7]">
            {openCalls.slice(0, 5).map(call => {
              const age = getCallAge(call.opened_at)
              const priorityDot: Record<string, string> = { urgent: 'bg-[#dc2626]', high: 'bg-[#d97706]', normal: 'bg-[#5c5fef]', low: 'bg-[#d1d5db]' }
              return (
                <Link key={call.id} href={`/service/${call.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[call.priority] || 'bg-[#d1d5db]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-[#111827] font-medium truncate">{call.customer?.name}</span>
                      <span className="text-[10px] font-mono text-[#9ca3af] flex-shrink-0">{call.call_number}</span>
                    </div>
                    <div className="text-xs text-[#6b7280] truncate">{call.problem_description?.slice(0, 55)}…</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium flex-shrink-0"
                      style={{ color: STATUS_DOT[call.status]?.color }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STATUS_DOT[call.status]?.color }}
                      />
                      {STATUS_DOT[call.status]?.label}
                    </div>
                    <span className={`text-xs font-mono ${age.color}`}>{age.label}</span>
                  </div>
                </Link>
              )
            })}
            {openCalls.length === 0 && (
              <div className="flex items-center gap-2 px-4 py-6 text-[#6b7280] text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                All caught up — no open calls
              </div>
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-[#f0f0f0]">
            <Link href="/service" className="text-xs text-[#6b7280] hover:text-[#5c5fef]">
              {openCalls.length} open calls →
            </Link>
          </div>
        </div>

        {/* Expiring Contracts */}
        <div className="bg-white border border-[#ebebeb] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#9ca3af]" />
              <span className="text-sm font-semibold text-[#111827]">Expiring Contracts</span>
            </div>
            <Link href="/contracts?filter=expiring" className="text-xs text-[#5c5fef] hover:underline font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-[#f7f7f7]">
            {expiringContracts.slice(0, 5).map(contract => {
              const days = getDaysUntilExpiry(contract.end_date!)
              const isExpired = days < 0
              return (
                <Link key={contract.id} href={`/contracts/${contract.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#111827] font-medium truncate">{contract.customer?.name}</div>
                    <div className="text-xs text-[#6b7280] font-mono">{contract.contract_number}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs font-semibold tabular-nums ${isExpired ? 'text-[#dc2626]' : days <= 30 ? 'text-[#dc2626]' : 'text-[#d97706]'}`}>
                      {isExpired ? `${Math.abs(days)}d ago` : `${days}d left`}
                    </div>
                    <div className="text-[10px] text-[#9ca3af]">{contract.end_date}</div>
                  </div>
                </Link>
              )
            })}
            {expiringContracts.length === 0 && (
              <div className="flex items-center gap-2 px-4 py-6 text-[#6b7280] text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                No contracts expiring soon
              </div>
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-[#f0f0f0]">
            <Link href="/contracts?filter=expiring" className="text-xs text-[#6b7280] hover:text-[#5c5fef]">
              {expiringContracts.length} contracts expiring →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white border border-[#ebebeb] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#9ca3af]" />
            <span className="text-sm font-semibold text-[#111827]">Recent Invoices</span>
          </div>
          <Link href="/invoices" className="text-xs text-[#5c5fef] hover:underline font-medium">View all →</Link>
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
              <Tr key={inv.id}>
                <Td><span className="font-mono text-[#5c5fef] text-xs font-medium">{inv.invoice_number}</span></Td>
                <Td><span className="text-[#111827] font-medium">{inv.customer?.name}</span></Td>
                <Td><span className="text-xs text-[#6b7280]">{inv.billing_period_start} – {inv.billing_period_end}</span></Td>
                <Td><span className="font-semibold tabular-nums">{formatCurrency(inv.total)}</span></Td>
                <Td>
                  <span className={`text-xs tabular-nums ${inv.status === 'overdue' ? 'text-[#dc2626]' : 'text-[#6b7280]'}`}>
                    {inv.due_date || '—'}
                  </span>
                </Td>
                <Td>
                  <div
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: INV_STATUS[inv.status]?.color }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: INV_STATUS[inv.status]?.color }}
                    />
                    {INV_STATUS[inv.status]?.label}
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <div className="px-5 py-3 border-t border-[#f0f0f0] text-center">
          <Link href="/invoices" className="text-xs text-[#5c5fef] hover:underline font-medium">
            View all invoices →
          </Link>
        </div>
      </div>
    </div>
  )
}
