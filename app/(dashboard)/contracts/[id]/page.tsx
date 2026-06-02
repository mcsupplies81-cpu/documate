'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { getContractWithEquipment, MOCK_METER_READINGS, MOCK_INVOICES } from '@/lib/mock-data'
import { formatCurrency, formatNumber, getDaysUntilExpiry, calculateBilling, getCurrentPeriod } from '@/lib/billing'
import { useToastStore } from '@/lib/store'
import type { Customer } from '@/lib/types'

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const toast = useToastStore()
  const [renewalOpen, setRenewalOpen] = useState(false)
  const [renewYears, setRenewYears] = useState('1')
  const [newRate, setNewRate] = useState('')
  const [renewing, setRenewing] = useState(false)

  const handleRenew = async () => {
    setRenewing(true)
    await new Promise(r => setTimeout(r, 700))
    setRenewing(false)
    setRenewalOpen(false)
    toast.success('Contract renewed', `${contract?.contract_number} extended ${renewYears} year${renewYears !== '1' ? 's' : ''}`)
  }

  const contract = getContractWithEquipment(id)
  if (!contract) return (
    <div className="text-[#6b7280] py-20 text-center">
      Contract not found. <Link href="/contracts" className="text-[#2563eb]">Back to list</Link>
    </div>
  )

  const invoices = MOCK_INVOICES.filter(i => i.contract_id === id)
  const days = contract.end_date ? getDaysUntilExpiry(contract.end_date) : null

  const period = getCurrentPeriod()
  const currentReadings: Record<string, import('@/lib/types').MeterReading> = {}
  for (const ce of contract.contract_equipment || []) {
    const readings = MOCK_METER_READINGS
      .filter(r => r.equipment_id === ce.equipment_id)
      .sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())
    if (readings[0]) currentReadings[ce.equipment_id] = readings[0]
  }

  const preview = calculateBilling(
    contract as Parameters<typeof calculateBilling>[0],
    contract.customer as Customer,
    currentReadings,
    period.start,
    period.end
  )

  return (
    <div>
      <PageHeader
        title={contract.contract_number}
        breadcrumb={[
          { label: 'Contracts', href: '/contracts' },
          { label: contract.contract_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {(contract.status === 'expiring' || contract.status === 'expired') && (
              <Button variant="ghost" size="sm" onClick={() => { setNewRate(String(contract.base_rate)); setRenewalOpen(true) }}>
                <RotateCcw className="w-3.5 h-3.5" />Renew Contract
              </Button>
            )}
            <Link href="/invoices/run">
              <Button variant="primary" size="sm"><RefreshCw className="w-3.5 h-3.5" />Run Billing</Button>
            </Link>
          </div>
        }
      >
        <div className="flex items-center gap-3 mt-1">
          <Link href={`/customers/${contract.customer_id}`} className="text-sm text-[#2563eb] hover:underline font-medium">{contract.customer?.name}</Link>
          <span className="text-[#d1d5db]">·</span>
          <Badge variant="muted">{contract.contract_type.replace('_', ' ')}</Badge>
          <Badge variant={
            contract.status === 'active' ? 'success' :
            contract.status === 'expiring' ? 'warning' :
            contract.status === 'expired' ? 'danger' : 'muted'
          }>{contract.status}</Badge>
          {days !== null && (
            <span className={`text-xs tabular-nums font-medium ${days < 0 ? 'text-[#dc2626]' : days <= 30 ? 'text-[#dc2626]' : days <= 60 ? 'text-[#d97706]' : 'text-[#6b7280]'}`}>
              {days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days} days remaining`}
            </span>
          )}
        </div>
      </PageHeader>

      {/* Contract terms */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Base Rate', value: formatCurrency(contract.base_rate), sub: `/ ${contract.billing_cycle}` },
          { label: 'Start Date', value: contract.start_date },
          { label: 'End Date', value: contract.end_date || 'Open-ended' },
          { label: 'Auto-Renew', value: contract.auto_renew ? 'Yes' : 'No', color: contract.auto_renew ? 'text-[#16a34a]' : 'text-[#9ca3af]' },
        ].map(tile => (
          <div key={tile.label} className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
            <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">{tile.label}</div>
            <div className={`text-lg font-semibold tabular-nums ${(tile as { color?: string }).color || 'text-[#111827]'}`}>{tile.value}</div>
            {(tile as { sub?: string }).sub && <div className="text-xs text-[#9ca3af]">{(tile as { sub?: string }).sub}</div>}
          </div>
        ))}
      </div>

      {/* Equipment on contract */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-[0_1px_2px_rgba(17,17,17,0.03)] mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f3f4f6]">
          <span className="text-sm font-semibold text-[#111827]">Equipment &amp; Meter Groups</span>
        </div>
        <Table>
          <Thead>
            <tr>
              <Th>Equipment</Th>
              <Th>Serial #</Th>
              <Th>Incl. B&W</Th>
              <Th>Incl. Color</Th>
              <Th>B&W Overage</Th>
              <Th>Color Overage</Th>
              <Th>Last Billed B&W</Th>
              <Th>Last Billed Color</Th>
              <Th>Last Billed</Th>
            </tr>
          </Thead>
          <Tbody>
            {(contract.contract_equipment || []).length === 0 && <EmptyRow cols={9} message="No equipment on this contract" />}
            {(contract.contract_equipment || []).map(ce => (
              <Tr key={ce.id}>
                <Td>
                  {ce.equipment
                    ? <Link href={`/equipment/${ce.equipment_id}`} className="text-[#2563eb] hover:underline text-sm font-medium">{ce.equipment.make} {ce.equipment.model}</Link>
                    : '—'
                  }
                </Td>
                <Td><span className="font-mono text-xs text-[#6b7280]">{ce.equipment?.serial_number}</span></Td>
                <Td><span className="font-mono text-xs">{formatNumber(ce.included_bw)}</span></Td>
                <Td><span className="font-mono text-xs">{formatNumber(ce.included_color)}</span></Td>
                <Td><span className="font-mono text-xs">${ce.bw_overage_rate.toFixed(4)}</span></Td>
                <Td><span className="font-mono text-xs">${ce.color_overage_rate.toFixed(4)}</span></Td>
                <Td><span className="font-mono text-xs text-[#6b7280]">{formatNumber(ce.last_billed_bw)}</span></Td>
                <Td><span className="font-mono text-xs text-[#6b7280]">{formatNumber(ce.last_billed_color)}</span></Td>
                <Td><span className="text-xs text-[#9ca3af]">{ce.last_billed_date || '—'}</span></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      {/* Current period billing preview */}
      <div className="bg-white border border-[#2563eb22] rounded-lg shadow-[0_1px_2px_rgba(17,17,17,0.03)] mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f3f4f6]">
          <div>
            <span className="text-sm font-semibold text-[#2563eb]">Current Period Preview</span>
            <span className="text-xs text-[#9ca3af] ml-3">{period.start} – {period.end}</span>
          </div>
          <span className="text-lg font-semibold text-[#111827] tabular-nums">{formatCurrency(preview.total)}</span>
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6b7280]">Base Rate</span>
            <span className="font-semibold tabular-nums">{formatCurrency(preview.base_charge)}</span>
          </div>
          {preview.equipment_items.map(item => (
            <div key={item.equipment?.id} className="pl-3 border-l border-[#e5e7eb] space-y-1">
              <div className="text-xs text-[#9ca3af]">{item.equipment?.make} {item.equipment?.model}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6b7280]">B&W: {formatNumber(item.bw_used)} used ({formatNumber(item.bw_overage)} over)</span>
                <span className="font-semibold tabular-nums text-[#111827]">{item.bw_overage > 0 ? formatCurrency(item.bw_overage_charge) : '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6b7280]">Color: {formatNumber(item.color_used)} used ({formatNumber(item.color_overage)} over)</span>
                <span className="font-semibold tabular-nums text-[#111827]">{item.color_overage > 0 ? formatCurrency(item.color_overage_charge) : '—'}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm border-t border-[#f3f4f6] pt-2">
            <span className="text-[#111827] font-medium">Estimated Total</span>
            <span className="font-semibold text-[#2563eb] tabular-nums">{formatCurrency(preview.total)}</span>
          </div>
        </div>
      </div>

      {/* Invoice history */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f3f4f6]">
          <span className="text-sm font-semibold text-[#111827]">Invoice History</span>
          <Link href="/invoices/run" className="text-xs text-[#2563eb] hover:underline font-medium">Run billing →</Link>
        </div>
        <Table>
          <Thead>
            <tr>
              <Th>Invoice #</Th>
              <Th>Period</Th>
              <Th>Total</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
            </tr>
          </Thead>
          <Tbody>
            {invoices.length === 0 && <EmptyRow cols={5} message="No invoices yet" />}
            {invoices.map(inv => (
              <Tr key={inv.id}>
                <Td><span className="font-mono text-xs text-[#2563eb] font-medium">{inv.invoice_number}</span></Td>
                <Td><span className="text-xs text-[#6b7280]">{inv.billing_period_start} – {inv.billing_period_end}</span></Td>
                <Td><span className="font-semibold tabular-nums">{formatCurrency(inv.total)}</span></Td>
                <Td><span className="text-xs text-[#6b7280] tabular-nums">{inv.due_date || '—'}</span></Td>
                <Td>
                  <Badge variant={
                    inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' :
                    inv.status === 'sent' ? 'info' : 'muted'
                  }>{inv.status}</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      {/* Renewal Modal (slide panel) */}
      <Modal
        open={renewalOpen}
        onClose={() => setRenewalOpen(false)}
        title={`Renew Contract — ${contract.customer?.name}`}
      >
        <div className="space-y-4">
          <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-3 text-sm">
            <div className="flex justify-between text-[#6b7280] mb-1">
              <span>Current end date</span>
              <span className="font-semibold text-[#111827] tabular-nums">{contract.end_date}</span>
            </div>
            <div className="flex justify-between text-[#6b7280]">
              <span>New end date</span>
              <span className="font-semibold text-[#16a34a] tabular-nums">
                {contract.end_date
                  ? new Date(new Date(contract.end_date).setFullYear(new Date(contract.end_date).getFullYear() + Number(renewYears))).toISOString().split('T')[0]
                  : '—'
                }
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#374151] mb-1.5 uppercase tracking-wider font-medium">Renewal Term</label>
              <select
                value={renewYears}
                onChange={e => setRenewYears(e.target.value)}
                className="w-full px-3 h-9 text-sm bg-white border border-[#e5e7eb] rounded-md text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
              >
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3 Years</option>
              </select>
            </div>
            <Input
              label="New Monthly Rate ($)"
              type="number"
              step="0.01"
              value={newRate}
              onChange={e => setNewRate(e.target.value)}
              placeholder={String(contract.base_rate)}
            />
          </div>
          <div className="text-xs text-[#9ca3af]">
            Current rate: <span className="font-semibold text-[#374151] tabular-nums">{formatCurrency(contract.base_rate)}/mo</span>
            {newRate && Number(newRate) !== contract.base_rate && (
              <span className={`ml-2 font-semibold tabular-nums ${Number(newRate) > contract.base_rate ? 'text-[#16a34a]' : 'text-[#d97706]'}`}>
                → {formatCurrency(Number(newRate))}/mo
                ({Number(newRate) > contract.base_rate ? '+' : ''}{(((Number(newRate) - contract.base_rate) / contract.base_rate) * 100).toFixed(1)}%)
              </span>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setRenewalOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleRenew} loading={renewing} className="flex-1">
              Confirm Renewal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
