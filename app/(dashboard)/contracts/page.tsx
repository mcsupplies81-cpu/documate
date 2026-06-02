'use client'
import { type ElementType, type ReactNode, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileText,
  Folder,
  MoreVertical,
  Pencil,
  Plus,
  Receipt,
  RotateCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
  X,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { MOCK_CONTRACTS, MOCK_CONTRACT_EQUIPMENT, MOCK_INVOICES } from '@/lib/mock-data'
import { formatCurrency, getDaysUntilExpiry } from '@/lib/billing'
import type { Contract } from '@/lib/types'

type FilterType = 'all' | 'active' | 'expiring' | 'expired'
type BillingFilter = 'all' | 'monthly' | 'quarterly' | 'annual'
type AutoRenewFilter = 'all' | 'yes' | 'no'

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expiring', label: 'Expiring' },
  { key: 'expired', label: 'Expired' },
]

function contractTypeLabel(type: string) {
  return type.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00`))
}

function expiryLabel(endDate: string | null) {
  if (!endDate) return 'No end date'
  const days = getDaysUntilExpiry(endDate)
  if (days < 0) return `expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
  return `in ${days} day${days === 1 ? '' : 's'}`
}

function detailExpiryLabel(endDate: string | null) {
  if (!endDate) return 'No end date'
  return `${endDate} (${expiryLabel(endDate)})`
}

function StatusBadge({ status }: { status: Contract['status'] }) {
  const styles = status === 'active'
    ? 'bg-[#dcfce7] text-[#16a34a]'
    : status === 'expiring'
      ? 'bg-[#ffedd5] text-[#f97316]'
      : status === 'expired'
        ? 'bg-[#fee2e2] text-[#dc2626]'
        : 'bg-[#f1f5f9] text-[#64748b]'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}>
      {status === 'expiring' ? 'Expiring Soon' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function MetricCard({ icon: Icon, iconClassName, iconBg, label, value, trend }: {
  icon: ElementType
  iconClassName: string
  iconBg: string
  label: string
  value: string
  trend: ReactNode
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconClassName}`} />
        </div>
        <div>
          <div className="text-[11px] font-medium text-[#64748b]">{label}</div>
          <div className="mt-1 text-2xl font-semibold leading-none tracking-tight text-[#0f172a]">{value}</div>
          <div className="mt-2 text-[11px] text-[#64748b]">{trend}</div>
        </div>
      </div>
    </div>
  )
}

function SelectFilter({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={event => onChange(event.target.value)}
      className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#334155] shadow-[0_1px_2px_rgba(15,23,42,0.03)] focus:border-transparent focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
    >
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  )
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-start gap-3 text-[13px]">
      <dt className="text-[#64748b]">{label}</dt>
      <dd className="font-medium text-[#0f172a]">{children}</dd>
    </div>
  )
}

export default function ContractsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [contractType, setContractType] = useState('all')
  const [billing, setBilling] = useState<BillingFilter>('all')
  const [autoRenew, setAutoRenew] = useState<AutoRenewFilter>('all')
  const [selectedId, setSelectedId] = useState(MOCK_CONTRACTS[0]?.id ?? '')

  const contractCounts = useMemo(() => ({
    all: MOCK_CONTRACTS.length,
    active: MOCK_CONTRACTS.filter(c => c.status === 'active').length,
    expiring: MOCK_CONTRACTS.filter(c => c.status === 'expiring').length,
    expired: MOCK_CONTRACTS.filter(c => c.status === 'expired').length,
  }), [])

  const filtered = useMemo(() => MOCK_CONTRACTS.filter(c => {
    const matchSearch = c.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contract_number.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    const matchType = contractType === 'all' || c.contract_type === contractType
    const matchBilling = billing === 'all' || c.billing_cycle === billing
    const matchAutoRenew = autoRenew === 'all' || (autoRenew === 'yes' ? c.auto_renew : !c.auto_renew)
    return matchSearch && matchFilter && matchType && matchBilling && matchAutoRenew
  }), [autoRenew, billing, contractType, filter, search])

  const selectedContract = MOCK_CONTRACTS.find(contract => contract.id === selectedId) ?? filtered[0] ?? MOCK_CONTRACTS[0]
  const selectedEquipment = MOCK_CONTRACT_EQUIPMENT.filter(ce => ce.contract_id === selectedContract?.id)
  const selectedInvoice = MOCK_INVOICES.find(invoice => invoice.contract_id === selectedContract?.id)

  const activeContracts = contractCounts.active + contractCounts.expiring
  const monthlyRecurringRevenue = MOCK_CONTRACTS
    .filter(contract => contract.status !== 'expired')
    .reduce((sum, contract) => sum + contract.base_rate, 0)
  const autoRenewEnabled = MOCK_CONTRACTS.filter(contract => contract.auto_renew).length
  const expiringInNinetyDays = MOCK_CONTRACTS.filter(contract => {
    if (!contract.end_date || contract.status === 'expired') return false
    const days = getDaysUntilExpiry(contract.end_date)
    return days >= 0 && days <= 90
  }).length

  const getEndDateColor = (endDate: string | null, status: string) => {
    if (!endDate || status === 'expired') return 'text-[#dc2626]'
    const days = getDaysUntilExpiry(endDate)
    if (days < 0 || days <= 30) return 'text-[#dc2626]'
    if (days <= 90) return 'text-[#f97316]'
    return 'text-[#334155]'
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
    const a = document.createElement('a')
    a.href = url
    a.download = 'contracts.csv'
    a.click()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">Contracts</h1>
          <p className="mt-1 text-sm text-[#64748b]">{activeContracts} active contracts across {new Set(MOCK_CONTRACTS.map(contract => contract.customer_id)).size} customers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm"><UploadCloud className="w-3.5 h-3.5" />Import CSV</Button>
          <Button variant="secondary" size="sm" onClick={exportCSV}><Download className="w-3.5 h-3.5" />Export</Button>
          <Link href="/contracts/new">
            <Button variant="primary" size="sm"><Plus className="w-3.5 h-3.5" />New Contract</Button>
          </Link>
        </div>
      </div>

      {contractCounts.expiring > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-[#fbbf24] bg-[#fffbeb] px-4 py-3 shadow-[0_1px_2px_rgba(251,191,36,0.08)]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-[#f97316]" />
            <span className="text-sm font-medium text-[#0f172a]">
              <strong>{contractCounts.expiring} contracts</strong> are expiring soon — review and renew before they lapse.
            </span>
          </div>
          <X className="h-4 w-4 text-[#475569]" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <MetricCard
          icon={Folder}
          iconBg="bg-[#eff6ff]"
          iconClassName="text-[#2563eb]"
          label="Active Contracts"
          value={String(activeContracts)}
          trend={<><span className="font-medium text-[#16a34a]">↑ 8</span> vs last 30 days</>}
        />
        <MetricCard
          icon={Clock}
          iconBg="bg-[#fff7ed]"
          iconClassName="text-[#f97316]"
          label="Expiring in 90 Days"
          value={String(expiringInNinetyDays)}
          trend={<><span className="font-medium text-[#f97316]">↑ {expiringInNinetyDays}</span> vs last 30 days</>}
        />
        <MetricCard
          icon={DollarSign}
          iconBg="bg-[#ecfdf5]"
          iconClassName="text-[#16a34a]"
          label="Monthly Recurring Revenue"
          value={formatCurrency(monthlyRecurringRevenue)}
          trend={<><span className="font-medium text-[#16a34a]">↑ 6.3%</span> vs last 30 days</>}
        />
        <MetricCard
          icon={ShieldCheck}
          iconBg="bg-[#eef2ff]"
          iconClassName="text-[#4f46e5]"
          label="Auto-Renew Enabled"
          value={String(autoRenewEnabled)}
          trend={<><span className="font-medium text-[#16a34a]">↑ 4</span> vs last 30 days</>}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="border-b border-[#e5e7eb] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full min-w-[230px] sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white pl-10 pr-9 text-[13px] text-[#0f172a] shadow-[0_1px_2px_rgba(15,23,42,0.03)] placeholder:text-[#94a3b8] focus:border-transparent focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <SelectFilter
                label="Status"
                value={filter}
                onChange={value => setFilter(value as FilterType)}
                options={FILTER_OPTIONS.map(option => ({ value: option.key, label: `Status: ${option.label}` }))}
              />
              <SelectFilter
                label="Contract Type"
                value={contractType}
                onChange={setContractType}
                options={[
                  { value: 'all', label: 'Contract Type: All' },
                  { value: 'cpc', label: 'Contract Type: CPC' },
                  { value: 'flat_rate', label: 'Contract Type: Flat Rate' },
                ]}
              />
              <SelectFilter
                label="Billing"
                value={billing}
                onChange={value => setBilling(value as BillingFilter)}
                options={[
                  { value: 'all', label: 'Billing: All' },
                  { value: 'monthly', label: 'Billing: Monthly' },
                  { value: 'quarterly', label: 'Billing: Quarterly' },
                  { value: 'annual', label: 'Billing: Annual' },
                ]}
              />
              <SelectFilter
                label="Auto-Renew"
                value={autoRenew}
                onChange={value => setAutoRenew(value as AutoRenewFilter)}
                options={[
                  { value: 'all', label: 'Auto-Renew: All' },
                  { value: 'yes', label: 'Auto-Renew: Yes' },
                  { value: 'no', label: 'Auto-Renew: No' },
                ]}
              />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#334155] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                Sort: End Date (Soonest)
                <ArrowUpDown className="h-3.5 w-3.5 text-[#64748b]" />
              </button>
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#64748b] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Table>
            <Thead>
              <tr>
                <Th className="w-8"></Th>
                <Th>Contract</Th>
                <Th>Customer</Th>
                <Th>Type</Th>
                <Th>Equipment</Th>
                <Th>Base Rate</Th>
                <Th>Billing</Th>
                <Th>End Date</Th>
                <Th>Auto-Renew</Th>
                <Th>Status</Th>
              </tr>
            </Thead>
            <Tbody>
              {filtered.length === 0 && <EmptyRow cols={10} message="No contracts found" icon={FileText} />}
              {filtered.map(contract => {
                const eqCount = MOCK_CONTRACT_EQUIPMENT.filter(ce => ce.contract_id === contract.id).length
                const days = contract.end_date ? getDaysUntilExpiry(contract.end_date) : null
                const isSelected = selectedContract?.id === contract.id

                return (
                  <Tr
                    key={contract.id}
                    onClick={() => setSelectedId(contract.id)}
                    className={isSelected ? 'bg-[#eff6ff] shadow-[inset_0_0_0_1px_#2563eb]' : ''}
                  >
                    <Td className="py-3 pr-0">
                      <span className={`block h-3.5 w-3.5 rounded-full border ${isSelected ? 'border-[#2563eb] bg-[#2563eb] shadow-[inset_0_0_0_4px_white]' : 'border-[#cbd5e1] bg-white'}`} />
                    </Td>
                    <Td><span className="text-xs font-medium text-[#2563eb]">{contract.contract_number}</span></Td>
                    <Td><span className="text-[13px] font-medium text-[#0f172a]">{contract.customer?.name}</span></Td>
                    <Td>
                      <div className="flex items-center gap-2 text-[13px] text-[#334155]">
                        <span className={`h-2 w-2 rounded-full ${contract.contract_type === 'flat_rate' ? 'bg-[#2563eb]' : 'bg-[#94a3b8]'}`} />
                        {contractTypeLabel(contract.contract_type)}
                      </div>
                    </Td>
                    <Td><span className="tabular-nums text-[#334155]">{eqCount}</span></Td>
                    <Td><span className="font-medium tabular-nums text-[#0f172a]">{formatCurrency(contract.base_rate)}</span></Td>
                    <Td><span className="text-[13px] capitalize text-[#334155]">{contract.billing_cycle}</span></Td>
                    <Td>
                      <span className={`text-[13px] tabular-nums ${getEndDateColor(contract.end_date, contract.status)}`}>
                        {contract.end_date || '—'}
                        {days !== null && (
                          <span className="mt-0.5 block text-[11px] font-medium">
                            {days < 0 ? `expired ${Math.abs(days)}d ago` : `in ${days} days`}
                          </span>
                        )}
                      </span>
                    </Td>
                    <Td>
                      <div className={`flex items-center gap-1.5 text-[13px] font-medium ${contract.auto_renew ? 'text-[#16a34a]' : 'text-[#64748b]'}`}>
                        {contract.auto_renew ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 text-[#ef4444]" />}
                        {contract.auto_renew ? 'Yes' : 'No'}
                      </div>
                    </Td>
                    <Td><StatusBadge status={contract.status} /></Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
          <div className="flex items-center justify-between border-t border-[#e5e7eb] px-4 py-3 text-xs text-[#64748b]">
            <span>Showing 1 to {filtered.length} of {MOCK_CONTRACTS.length} contracts</span>
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 rounded-lg border border-[#e5e7eb] text-[#94a3b8]">‹</button>
              <button className="h-8 w-8 rounded-lg border border-[#2563eb] bg-[#eff6ff] font-semibold text-[#2563eb]">1</button>
              <button className="h-8 w-8 rounded-lg border border-[#e5e7eb] text-[#334155]">2</button>
              <button className="h-8 w-8 rounded-lg border border-[#e5e7eb] text-[#334155]">›</button>
            </div>
          </div>
        </section>

        {selectedContract && (
          <aside className="rounded-xl border border-[#e5e7eb] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="border-b border-[#e5e7eb] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-[#64748b]">{selectedContract.contract_number}</div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-[#0f172a]">{selectedContract.customer?.name}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedContract.status} />
                  <MoreVertical className="h-5 w-5 text-[#64748b]" />
                </div>
              </div>
              <div className="mt-5 flex gap-7 border-b border-[#e5e7eb] text-[13px] font-medium">
                {['Overview', 'Equipment', 'Billing', 'History'].map((tab, index) => (
                  <button key={tab} className={`pb-3 ${index === 0 ? 'border-b-2 border-[#2563eb] text-[#2563eb]' : 'text-[#64748b]'}`}>{tab}</button>
                ))}
              </div>
            </div>

            <div className="space-y-5 p-5">
              <dl className="space-y-4">
                <DetailRow label="Customer">{selectedContract.customer?.name}</DetailRow>
                <DetailRow label="Contract Type">{contractTypeLabel(selectedContract.contract_type)} ({selectedContract.contract_type === 'cpc' ? 'Cost Per Copy' : 'Fixed monthly rate'})</DetailRow>
                <DetailRow label="Covered Equipment">{selectedEquipment.length} device{selectedEquipment.length === 1 ? '' : 's'}</DetailRow>
                <DetailRow label="Start Date">{selectedContract.start_date}</DetailRow>
                <DetailRow label="End Date">{detailExpiryLabel(selectedContract.end_date)}</DetailRow>
                <DetailRow label="Billing Frequency"><span className="capitalize">{selectedContract.billing_cycle}</span></DetailRow>
              </dl>

              <div className="border-t border-[#e5e7eb] pt-5">
                <dl className="space-y-4">
                  <DetailRow label="Base Rate">{formatCurrency(selectedContract.base_rate)} / month</DetailRow>
                  <DetailRow label="Included Pages">
                    {selectedEquipment.length > 0
                      ? `${selectedEquipment.reduce((sum, item) => sum + item.included_bw, 0).toLocaleString()} B&W / ${selectedEquipment.reduce((sum, item) => sum + item.included_color, 0).toLocaleString()} Color`
                      : 'No included volume'}
                  </DetailRow>
                  <DetailRow label="Overage Rates">
                    {selectedEquipment[0]
                      ? `${formatCurrency(selectedEquipment[0].bw_overage_rate)} B&W / ${formatCurrency(selectedEquipment[0].color_overage_rate)} Color`
                      : '—'}
                  </DetailRow>
                  <DetailRow label="Auto-Renew">
                    <span className={`inline-flex items-center gap-2 ${selectedContract.auto_renew ? 'text-[#16a34a]' : 'text-[#64748b]'}`}>
                      {selectedContract.auto_renew ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4 text-[#ef4444]" />}
                      {selectedContract.auto_renew ? 'Enabled' : 'Disabled'}
                    </span>
                  </DetailRow>
                  <DetailRow label="Last Invoice">
                    {selectedInvoice ? (
                      <span>{selectedInvoice.invoice_number}<br /><span className="font-normal text-[#64748b]">{formatDate(selectedInvoice.created_at.split('T')[0])} – {formatCurrency(selectedInvoice.total)}</span></span>
                    ) : 'No invoice found'}
                  </DetailRow>
                </dl>
              </div>

              <div className="border-t border-[#e5e7eb] pt-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
                  Risk & Alerts
                  <span className="rounded-md bg-[#fed7aa] px-1.5 py-0.5 text-[11px] font-semibold text-[#f97316]">2</span>
                </h3>
                <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
                  <div className="flex gap-3 border-b border-[#e5e7eb] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff7ed]"><Clock className="h-4 w-4 text-[#f97316]" /></div>
                    <div>
                      <div className="text-xs font-semibold text-[#0f172a]">Renews {expiryLabel(selectedContract.end_date)}</div>
                      <div className="mt-0.5 text-xs text-[#64748b]">Contract ends on {formatDate(selectedContract.end_date)}</div>
                    </div>
                  </div>
                  <div className="flex gap-3 border-b border-[#e5e7eb] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff7ed]"><BarChart3 className="h-4 w-4 text-[#f97316]" /></div>
                    <div>
                      <div className="text-xs font-semibold text-[#0f172a]">Usage above included volume</div>
                      <div className="mt-0.5 text-xs text-[#64748b]">102% of B&W pages, 118% of Color pages</div>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff]"><FileText className="h-4 w-4 text-[#2563eb]" /></div>
                    <div>
                      <div className="text-xs font-semibold text-[#0f172a]">Pending renewal review</div>
                      <div className="mt-0.5 text-xs text-[#64748b]">Review and confirm terms for renewal</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href={`/contracts/${selectedContract.id}`} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] text-[13px] font-medium text-[#0f172a] hover:bg-[#f8fafc]">
                    <Pencil className="h-4 w-4" />Edit Contract
                  </Link>
                  <button className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] text-[13px] font-medium text-[#0f172a] hover:bg-[#f8fafc]">
                    <RotateCw className="h-4 w-4" />Create Renewal
                  </button>
                  <Link href="/invoices" className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] text-[13px] font-medium text-[#0f172a] hover:bg-[#f8fafc]">
                    <Receipt className="h-4 w-4" />View Billing History
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
