'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Search, Download, X, SlidersHorizontal, Plus, Upload,
  Gauge, Wrench, FileText, MapPin, Clock,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FilterTabs } from '@/components/ui/filter-tabs'
import { Table, Thead, Th, Tbody, EmptyRow } from '@/components/ui/table'
import {
  getEquipmentWithReadings, MOCK_CUSTOMERS, MOCK_CONTRACTS,
  MOCK_CONTRACT_EQUIPMENT, MOCK_SERVICE_CALLS, MOCK_LOCATIONS,
} from '@/lib/mock-data'
import { formatNumber, getDaysUntilExpiry } from '@/lib/billing'

type StatusFilter = 'all' | 'active' | 'inactive' | 'removed'
type PanelTab = 'overview' | 'meters' | 'service' | 'contracts' | 'history'
type EquipmentRow = ReturnType<typeof getEquipmentWithReadings>[0]

// ─── helpers ─────────────────────────────────────────────────────────────────

function getEquipmentContract(equipmentId: string) {
  const ce = MOCK_CONTRACT_EQUIPMENT.find(c => c.equipment_id === equipmentId)
  if (!ce) return null
  return MOCK_CONTRACTS.find(c => c.id === ce.contract_id) ?? null
}

function getLocationName(locationId: string | null) {
  if (!locationId) return null
  return MOCK_LOCATIONS.find(l => l.id === locationId)?.name ?? null
}

function getMeterStatus(eq: EquipmentRow): { ok: boolean; date: string | null } {
  if (!eq.latest_reading) return { ok: false, date: null }
  const days = (Date.now() - new Date(eq.latest_reading.reading_date).getTime()) / 86400000
  return { ok: days <= 35, date: eq.latest_reading.reading_date }
}

function getOpenCall(equipmentId: string) {
  return MOCK_SERVICE_CALLS.find(
    sc => sc.equipment_id === equipmentId && (sc.status === 'open' || sc.status === 'in_progress')
  ) ?? null
}

function getAlerts(eq: EquipmentRow) {
  const alerts: Array<{ icon: 'meter' | 'contract' | 'service'; title: string; sub: string }> = []
  const meter = getMeterStatus(eq)
  if (!meter.ok) {
    alerts.push({
      icon: 'meter',
      title: 'Meter missing this cycle',
      sub: meter.date ? `Last read ${meter.date}` : 'Never read',
    })
  }
  const contract = getEquipmentContract(eq.id)
  if (contract?.end_date) {
    const days = getDaysUntilExpiry(contract.end_date)
    if (days >= 0 && days <= 60) {
      alerts.push({
        icon: 'contract',
        title: `Contract expires in ${days} days`,
        sub: `${contract.end_date} · Action recommended`,
      })
    }
  }
  const call = getOpenCall(eq.id)
  if (call) {
    alerts.push({ icon: 'service', title: '1 Open Call', sub: call.call_number })
  }
  return alerts
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function EquipmentPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [customerFilter, setCustomerFilter] = useState('')
  const [makeFilter, setMakeFilter] = useState('')
  const [contractFilter, setContractFilter] = useState<'all' | 'under_contract' | 'no_contract' | 'expiring'>('all')
  const [meterFilter, setMeterFilter] = useState<'all' | 'ok' | 'missing'>('all')
  const [sortBy, setSortBy] = useState<'recently_updated' | 'customer' | 'make' | 'missing_meter'>('recently_updated')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<PanelTab>('overview')

  const allEquipment = getEquipmentWithReadings()
  const makes = Array.from(new Set(allEquipment.map(e => e.make))).sort()

  const activeCount   = allEquipment.filter(e => e.status === 'active').length
  const underContract = allEquipment.filter(e => getEquipmentContract(e.id) !== null).length
  const missingMeter  = allEquipment.filter(e => !getMeterStatus(e).ok).length
  const openIssues    = new Set(
    MOCK_SERVICE_CALLS
      .filter(sc => (sc.status === 'open' || sc.status === 'in_progress') && sc.equipment_id)
      .map(sc => sc.equipment_id)
  ).size

  const filtered = allEquipment.filter(eq => {
    const matchSearch =
      eq.make.toLowerCase().includes(search.toLowerCase()) ||
      eq.model.toLowerCase().includes(search.toLowerCase()) ||
      eq.serial_number.toLowerCase().includes(search.toLowerCase()) ||
      (eq.customer?.name.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchStatus   = statusFilter === 'all' || eq.status === statusFilter
    const matchCustomer = !customerFilter || eq.customer_id === customerFilter
    const matchMake     = !makeFilter || eq.make === makeFilter
    const contract      = getEquipmentContract(eq.id)
    const matchContract =
      contractFilter === 'all' ? true :
      contractFilter === 'under_contract' ? contract !== null :
      contractFilter === 'no_contract' ? contract === null :
      contractFilter === 'expiring' ? (contract?.end_date ? getDaysUntilExpiry(contract.end_date) <= 60 : false) : true
    const meter = getMeterStatus(eq)
    const matchMeter =
      meterFilter === 'all' ? true :
      meterFilter === 'ok' ? meter.ok :
      meterFilter === 'missing' ? !meter.ok : true
    return matchSearch && matchStatus && matchCustomer && matchMake && matchContract && matchMeter
  }).sort((a, b) => {
    if (sortBy === 'customer') return (a.customer?.name || '').localeCompare(b.customer?.name || '')
    if (sortBy === 'make') return a.make.localeCompare(b.make)
    if (sortBy === 'missing_meter') {
      const aM = getMeterStatus(a).ok ? 1 : 0
      const bM = getMeterStatus(b).ok ? 1 : 0
      return aM - bM
    }
    const aDate = a.latest_reading?.reading_date || ''
    const bDate = b.latest_reading?.reading_date || ''
    return bDate.localeCompare(aDate)
  })

  const selectedEquipment   = selectedId ? allEquipment.find(e => e.id === selectedId) ?? null : null
  const selectedContract    = selectedEquipment ? getEquipmentContract(selectedEquipment.id) : null
  const selectedAlerts      = selectedEquipment ? getAlerts(selectedEquipment) : []

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

  const activeFilterCount = [customerFilter, makeFilter, contractFilter !== 'all', meterFilter !== 'all'].filter(Boolean).length

  return (
    <div>
      <PageHeader
        title="Equipment"
        subtitle={`${activeCount} installed devices across ${MOCK_CUSTOMERS.length} customers`}
        actions={
          <>
            <Button variant="ghost" size="sm"><Upload className="w-3.5 h-3.5" />Import CSV</Button>
            <Button variant="ghost" size="sm" onClick={exportCSV}><Download className="w-3.5 h-3.5" />Export</Button>
            <Link href="/equipment/new">
              <Button variant="primary" size="sm"><Plus className="w-3.5 h-3.5" />Add Equipment</Button>
            </Link>
          </>
        }
      />

      {/* Stats strip */}
      <div className="flex items-center gap-1.5 text-sm mb-4 flex-wrap">
        <span className="font-semibold text-[#111827]">{activeCount}</span>
        <span className="text-[#9ca3af]">devices</span>
        <span className="text-[#d1d5db] mx-1">·</span>
        <span className="font-semibold text-[#111827]">{underContract}</span>
        <span className="text-[#9ca3af]">under contract</span>
        <span className="text-[#d1d5db] mx-1">·</span>
        <span className={`font-semibold ${missingMeter > 0 ? 'text-[#dc2626]' : 'text-[#111827]'}`}>{missingMeter}</span>
        <span className="text-[#9ca3af]">missing meters</span>
        <span className="text-[#d1d5db] mx-1">·</span>
        <span className={`font-semibold ${openIssues > 0 ? 'text-[#d97706]' : 'text-[#111827]'}`}>{openIssues}</span>
        <span className="text-[#9ca3af]">open calls</span>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="relative min-w-[180px] max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search equipment..."
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

        <select
          value={customerFilter}
          onChange={e => setCustomerFilter(e.target.value)}
          className="h-9 pl-3 pr-7 text-sm bg-white border border-[#e5e7eb] rounded-lg text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
        >
          <option value="">All Customers</option>
          {MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <FilterTabs
          options={[
            { key: 'all'      as StatusFilter, label: 'All',      count: allEquipment.length },
            { key: 'active'   as StatusFilter, label: 'Active',   count: allEquipment.filter(e => e.status === 'active').length },
            { key: 'inactive' as StatusFilter, label: 'Inactive', count: allEquipment.filter(e => e.status === 'inactive').length },
            { key: 'removed'  as StatusFilter, label: 'Removed',  count: allEquipment.filter(e => e.status === 'removed').length },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        <button
          onClick={() => setShowAdvanced(v => !v)}
          className={`relative h-9 px-3 flex items-center gap-1.5 rounded-lg border text-sm transition-colors ${
            showAdvanced || activeFilterCount > 0
              ? 'bg-[#eff6ff] border-[#c7d2fe] text-[#2563eb]'
              : 'bg-white border-[#e5e7eb] text-[#6b7280] hover:text-[#374151] hover:border-[#d1d5db]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#2563eb] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced filters row */}
      {showAdvanced && (
        <div className="flex items-center gap-2 mb-3 flex-wrap py-2.5 px-3 bg-[#fafafa] border border-[#e5e7eb] rounded-lg">
          <select
            value={makeFilter}
            onChange={e => setMakeFilter(e.target.value)}
            className="h-8 pl-3 pr-7 text-xs bg-white border border-[#e5e7eb] rounded-md text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
          >
            <option value="">All Manufacturers</option>
            {makes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select
            value={contractFilter}
            onChange={e => setContractFilter(e.target.value as typeof contractFilter)}
            className="h-8 pl-3 pr-7 text-xs bg-white border border-[#e5e7eb] rounded-md text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
          >
            <option value="all">All Contracts</option>
            <option value="under_contract">Under Contract</option>
            <option value="no_contract">No Contract</option>
            <option value="expiring">Expiring Soon</option>
          </select>

          <select
            value={meterFilter}
            onChange={e => setMeterFilter(e.target.value as typeof meterFilter)}
            className="h-8 pl-3 pr-7 text-xs bg-white border border-[#e5e7eb] rounded-md text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
          >
            <option value="all">All Meters</option>
            <option value="ok">Meter OK</option>
            <option value="missing">Missing Meter</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="h-8 pl-3 pr-7 text-xs bg-white border border-[#e5e7eb] rounded-md text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
          >
            <option value="recently_updated">Recently Updated</option>
            <option value="customer">Customer A–Z</option>
            <option value="make">Manufacturer A–Z</option>
            <option value="missing_meter">Missing Meters First</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={() => { setMakeFilter(''); setContractFilter('all'); setMeterFilter('all'); setSortBy('recently_updated') }}
              className="h-8 px-2.5 text-xs text-[#6b7280] hover:text-[#dc2626] transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-[#9ca3af] mb-2">{filtered.length} of {allEquipment.length} devices</p>

      {/* Table + optional side panel */}
      <div className={`grid gap-4 items-start ${selectedEquipment ? 'grid-cols-[minmax(0,1fr)_360px]' : 'grid-cols-1'}`}>

        {/* Table card */}
        <div className="bg-white border border-[#e7e5e1] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <table className="w-full min-w-0">
            <thead>
              <tr className="border-b border-[#e7e5e1] bg-[#fafafa]">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">Device / Model</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">Customer</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">Contract</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">Meter</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">Service</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f7f7f7]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#9ca3af]">No equipment found</td>
                </tr>
              )}
              {filtered.map(eq => {
                const contract     = getEquipmentContract(eq.id)
                const meter        = getMeterStatus(eq)
                const call         = getOpenCall(eq.id)
                const isSelected   = eq.id === selectedId
                const contractDays = contract?.end_date ? getDaysUntilExpiry(contract.end_date) : null
                const expiringSoon = contractDays !== null && contractDays >= 0 && contractDays <= 60

                return (
                  <tr
                    key={eq.id}
                    onClick={() => { setSelectedId(isSelected ? null : eq.id); setActiveTab('overview') }}
                    className={`cursor-pointer transition-colors duration-75 ${isSelected ? 'bg-[#eff6ff]' : 'hover:bg-[#fafafa]'}`}
                    style={isSelected ? { boxShadow: 'inset 3px 0 0 #2563eb' } : undefined}
                  >
                    {/* Device */}
                    <td className="px-4 py-2">
                      <div className="text-sm text-[#111827] font-medium truncate max-w-[160px]">{eq.make} {eq.model}</div>
                      <div className="text-[11px] text-[#9ca3af] font-mono">{eq.serial_number}</div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-2">
                      <Link
                        href={`/customers/${eq.customer_id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-sm text-[#111827] font-medium hover:text-[#2563eb] transition-colors truncate block max-w-[160px]"
                      >
                        {eq.customer?.name || '—'}
                      </Link>
                      {eq.customer?.billing_address && (
                        <div className="text-[11px] text-[#9ca3af]">
                          {eq.customer.billing_address.city}, {eq.customer.billing_address.state}
                        </div>
                      )}
                    </td>

                    {/* Contract */}
                    <td className="px-4 py-2">
                      {contract ? (
                        <>
                          <Link
                            href={`/contracts/${contract.id}`}
                            onClick={e => e.stopPropagation()}
                            className="text-xs font-mono text-[#2563eb] hover:underline"
                          >
                            {contract.contract_number}
                          </Link>
                          {contractDays !== null && (
                            <div className={`text-[11px] font-medium mt-0.5 ${expiringSoon ? 'text-[#dc2626]' : 'text-[#9ca3af]'}`}>
                              {expiringSoon ? `${contractDays}d left` : `Exp. ${contract.end_date}`}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={`/contracts/new?equipment=${eq.id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-xs text-[#9ca3af] hover:text-[#2563eb] transition-colors"
                        >
                          Add contract
                        </Link>
                      )}
                    </td>

                    {/* Meter */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: meter.ok ? '#16a34a' : '#dc2626' }}
                        />
                        <span className={`text-xs ${meter.ok ? 'text-[#6b7280]' : 'text-[#dc2626] font-medium'}`}>
                          {meter.date ?? 'Never'}
                        </span>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-4 py-2">
                      {call ? (
                        <span className="text-xs font-medium text-[#dc2626]">1 open call</span>
                      ) : (
                        <span className="text-[#d1d5db]">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          eq.status === 'active' ? 'bg-[#16a34a]' :
                          eq.status === 'inactive' ? 'bg-[#d97706]' : 'bg-[#9ca3af]'
                        }`} />
                        <span className={`text-xs font-medium capitalize ${
                          eq.status === 'active' ? 'text-[#16a34a]' :
                          eq.status === 'inactive' ? 'text-[#d97706]' : 'text-[#6b7280]'
                        }`}>{eq.status}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#e7e5e1]">
            <span className="text-xs text-[#9ca3af]">Showing {filtered.length} of {allEquipment.length}</span>
            <div className="flex items-center gap-1">
              <button disabled className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e7eb] text-[#9ca3af] opacity-40">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-[#2563eb] bg-[#2563eb] text-white text-xs font-semibold">1</button>
              <button disabled className="w-7 h-7 flex items-center justify-center rounded border border-[#e5e7eb] text-[#9ca3af] opacity-40">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Detail panel ──────────────────────────────────────────── */}
        {selectedEquipment && (() => {
          const contractDays  = selectedContract?.end_date ? getDaysUntilExpiry(selectedContract.end_date) : null
          const panelExpiring = contractDays !== null && contractDays >= 0 && contractDays <= 60
          const locationName  = getLocationName(selectedEquipment.location_id)

          return (
            <div className="w-[360px] flex-shrink-0 bg-white border border-[#e7e5e1] rounded-xl shadow-[0_1px_2px_rgba(17,17,17,0.03)] overflow-hidden self-start sticky top-4">

              {/* Panel header */}
              <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-[#e7e5e1]">
                <div>
                  <div className="text-sm font-semibold text-[#111827] leading-snug">
                    {selectedEquipment.make} {selectedEquipment.model}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedEquipment.status === 'active' ? 'bg-[#16a34a]' : 'bg-[#d97706]'}`} />
                    <span className={`text-xs font-medium capitalize ${selectedEquipment.status === 'active' ? 'text-[#16a34a]' : 'text-[#d97706]'}`}>
                      {selectedEquipment.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-6 h-6 flex items-center justify-center rounded text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#e7e5e1]">
                {(['overview', 'meters', 'service', 'contracts', 'history'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-[11px] font-medium capitalize border-b-2 transition-colors text-center ${
                      activeTab === tab
                        ? 'border-[#2563eb] text-[#2563eb]'
                        : 'border-transparent text-[#6b7280] hover:text-[#374151]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="overflow-y-auto max-h-[calc(100vh-320px)]">

                  {/* Detail rows */}
                  <div className="divide-y divide-[#f7f7f7]">
                    {([
                      {
                        label: 'Serial Number',
                        value: <span className="font-mono text-xs text-[#374151]">{selectedEquipment.serial_number}</span>,
                      },
                      {
                        label: 'Customer',
                        value: (
                          <Link href={`/customers/${selectedEquipment.customer_id}`} className="text-xs text-[#2563eb] hover:underline font-medium">
                            {selectedEquipment.customer?.name}
                          </Link>
                        ),
                      },
                      {
                        label: 'Location',
                        value: (
                          <div className="flex items-start gap-1 text-right">
                            <MapPin className="w-3 h-3 text-[#9ca3af] mt-0.5 flex-shrink-0" />
                            <div>
                              {selectedEquipment.customer?.billing_address && (
                                <div className="text-xs text-[#374151]">
                                  {selectedEquipment.customer.billing_address.city}, {selectedEquipment.customer.billing_address.state}
                                </div>
                              )}
                              {locationName && <div className="text-[11px] text-[#9ca3af]">{locationName}</div>}
                              {!locationName && selectedEquipment.notes && (
                                <div className="text-[11px] text-[#9ca3af]">{selectedEquipment.notes}</div>
                              )}
                            </div>
                          </div>
                        ),
                      },
                      {
                        label: 'Contract',
                        value: selectedContract ? (
                          <Link href={`/contracts/${selectedContract.id}`} className="text-xs font-mono text-[#2563eb] hover:underline font-medium">
                            {selectedContract.contract_number}
                          </Link>
                        ) : <span className="text-xs text-[#9ca3af]">No contract</span>,
                      },
                      ...(selectedContract ? [{
                        label: 'Contract Status',
                        value: (
                          <div className="text-right">
                            {panelExpiring ? (
                              <span className="inline-flex text-[11px] font-medium text-[#d97706] bg-[#fffbeb] border border-[#fde68a] rounded px-1.5 py-0.5">
                                Expiring Soon
                              </span>
                            ) : (
                              <Badge variant="success">Active</Badge>
                            )}
                            {selectedContract.end_date && contractDays !== null && (
                              <div className="text-[11px] text-[#9ca3af] mt-0.5">
                                Expires {selectedContract.end_date} ({contractDays}d)
                              </div>
                            )}
                          </div>
                        ),
                      }] : []),
                      {
                        label: 'Install Date',
                        value: <span className="text-xs text-[#374151]">{selectedEquipment.install_date || '—'}</span>,
                      },
                      {
                        label: 'Last Meter Read',
                        value: selectedEquipment.latest_reading ? (
                          <div className="text-right">
                            <div className="text-xs text-[#374151]">{selectedEquipment.latest_reading.reading_date}</div>
                            <div className="text-[11px] text-[#9ca3af] mt-0.5">
                              {formatNumber(selectedEquipment.latest_reading.bw_reading)} B&amp;W · {formatNumber(selectedEquipment.latest_reading.color_reading)} Color
                            </div>
                          </div>
                        ) : <span className="text-xs text-[#dc2626] font-medium">Never</span>,
                      },
                    ] as Array<{ label: string; value: React.ReactNode }>).map(row => (
                      <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                        <span className="text-xs text-[#6b7280] flex-shrink-0 w-[110px]">{row.label}</span>
                        <div className="flex-1 text-right">{row.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Risk & Alerts */}
                  {selectedAlerts.length > 0 && (
                    <div className="border-t border-[#e7e5e1]">
                      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                        <span className="text-xs font-semibold text-[#111827]">Risk &amp; Alerts</span>
                        <span className="w-4 h-4 rounded-full bg-[#dc2626] text-white text-[10px] font-bold flex items-center justify-center">
                          {selectedAlerts.length}
                        </span>
                      </div>
                      <div className="divide-y divide-[#f7f7f7]">
                        {selectedAlerts.map((alert, i) => (
                          <button key={i} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] transition-colors text-left">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              alert.icon === 'meter'    ? 'bg-[#fff7ed]' :
                              alert.icon === 'contract' ? 'bg-[#f0fdf4]' : 'bg-[#fef2f2]'
                            }`}>
                              {alert.icon === 'meter'    && <Gauge    className="w-3.5 h-3.5 text-[#ea580c]" />}
                              {alert.icon === 'contract' && <FileText className="w-3.5 h-3.5 text-[#16a34a]" />}
                              {alert.icon === 'service'  && <Wrench   className="w-3.5 h-3.5 text-[#dc2626]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-[#374151]">{alert.title}</div>
                              <div className="text-[11px] text-[#9ca3af] truncate">{alert.sub}</div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-[#d1d5db] flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="border-t border-[#e7e5e1] px-4 py-3">
                    <div className="text-xs font-semibold text-[#111827] mb-2">Quick Actions</div>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { label: 'Add Meter Read',      icon: Gauge,  href: `/meters?equipment=${selectedEquipment.id}` },
                        { label: 'Create Service Call', icon: Wrench, href: `/service/new?equipment=${selectedEquipment.id}` },
                        { label: 'View Full History',   icon: Clock,  href: `/equipment/${selectedEquipment.id}` },
                      ] as const).map(action => (
                        <Link
                          key={action.label}
                          href={action.href}
                          className="flex flex-col items-center gap-1.5 p-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6] hover:border-[#d1d5db] transition-colors"
                        >
                          <action.icon className="w-4 h-4 text-[#2563eb]" />
                          <span className="text-[10px] font-medium text-[#374151] text-center leading-tight">{action.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Other tabs — placeholder */}
              {activeTab !== 'overview' && (
                <div className="px-4 py-12 text-center">
                  <div className="text-sm text-[#9ca3af] capitalize">{activeTab} details coming soon</div>
                </div>
              )}

            </div>
          )
        })()}

      </div>
    </div>
  )
}
