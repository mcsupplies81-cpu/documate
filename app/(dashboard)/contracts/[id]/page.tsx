'use client'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { getContractWithEquipment, MOCK_METER_READINGS, MOCK_INVOICES } from '@/lib/mock-data'
import { formatCurrency, formatNumber, getDaysUntilExpiry, calculateBilling, getCurrentPeriod } from '@/lib/billing'
import type { Customer } from '@/lib/types'

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const contract = getContractWithEquipment(id)
  if (!contract) return (
    <div className="text-[#555] py-20 text-center">
      Contract not found. <Link href="/contracts" className="text-[#00d4ff]">Back to list</Link>
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
      <div className="flex items-center gap-3 mb-4">
        <Link href="/contracts" className="text-[#555] hover:text-[#888]"><ArrowLeft className="w-4 h-4" /></Link>
        <span className="text-[#333]">/</span>
        <Link href="/contracts" className="text-sm text-[#555]">Contracts</Link>
        <span className="text-[#333]">/</span>
        <span className="text-sm text-[#888]">{contract.contract_number}</span>
      </div>

      <PageHeader
        title={contract.contract_number}
        actions={
          <Link href="/invoices/run">
            <Button variant="primary" size="sm"><RefreshCw className="w-3.5 h-3.5" />Run Billing</Button>
          </Link>
        }
      >
        <div className="flex items-center gap-3 mt-1">
          <Link href={`/customers/${contract.customer_id}`} className="text-xs text-[#00d4ff] hover:underline">{contract.customer?.name}</Link>
          <span className="text-[#333]">·</span>
          <Badge variant="muted">{contract.contract_type.replace('_', ' ')}</Badge>
          <Badge variant={
            contract.status === 'active' ? 'success' :
            contract.status === 'expiring' ? 'warning' :
            contract.status === 'expired' ? 'danger' : 'muted'
          }>{contract.status}</Badge>
          {days !== null && (
            <span className={`text-xs font-mono ${days < 0 ? 'text-[#ef4444]' : days <= 30 ? 'text-[#ef4444]' : days <= 60 ? 'text-[#f59e0b]' : 'text-[#555]'}`}>
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
          { label: 'Auto-Renew', value: contract.auto_renew ? 'Yes' : 'No', color: contract.auto_renew ? 'text-[#22c55e]' : 'text-[#555]' },
        ].map(tile => (
          <div key={tile.label} className="bg-[#111] border border-[#1e1e1e] rounded-lg p-3">
            <div className="text-xs text-[#555] uppercase tracking-wide mb-1">{tile.label}</div>
            <div className={`text-lg font-mono font-semibold ${(tile as { color?: string }).color || 'text-[#e8e8e8]'}`}>{tile.value}</div>
            {(tile as { sub?: string }).sub && <div className="text-xs text-[#444]">{(tile as { sub?: string }).sub}</div>}
          </div>
        ))}
      </div>

      {/* Equipment on contract */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
          <span className="text-sm font-medium">Equipment &amp; Meter Groups</span>
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
                    ? <Link href={`/equipment/${ce.equipment_id}`} className="text-[#00d4ff] hover:underline text-sm">{ce.equipment.make} {ce.equipment.model}</Link>
                    : '—'
                  }
                </Td>
                <Td><span className="font-mono text-xs text-[#666]">{ce.equipment?.serial_number}</span></Td>
                <Td><span className="font-mono text-xs">{formatNumber(ce.included_bw)}</span></Td>
                <Td><span className="font-mono text-xs">{formatNumber(ce.included_color)}</span></Td>
                <Td><span className="font-mono text-xs">${ce.bw_overage_rate.toFixed(4)}</span></Td>
                <Td><span className="font-mono text-xs">${ce.color_overage_rate.toFixed(4)}</span></Td>
                <Td><span className="font-mono text-xs text-[#666]">{formatNumber(ce.last_billed_bw)}</span></Td>
                <Td><span className="font-mono text-xs text-[#666]">{formatNumber(ce.last_billed_color)}</span></Td>
                <Td><span className="text-xs text-[#555]">{ce.last_billed_date || '—'}</span></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      {/* Current period billing preview */}
      <div className="bg-[#111] border border-[#00d4ff22] rounded-lg mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
          <div>
            <span className="text-sm font-medium text-[#00d4ff]">Current Period Preview</span>
            <span className="text-xs text-[#444] ml-3">{period.start} – {period.end}</span>
          </div>
          <span className="text-lg font-mono font-semibold text-[#e8e8e8]">{formatCurrency(preview.total)}</span>
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#666]">Base Rate</span>
            <span className="font-mono">{formatCurrency(preview.base_charge)}</span>
          </div>
          {preview.equipment_items.map(item => (
            <div key={item.equipment?.id} className="pl-3 border-l border-[#1e1e1e] space-y-1">
              <div className="text-xs text-[#555]">{item.equipment?.make} {item.equipment?.model}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#666]">B&W: {formatNumber(item.bw_used)} used ({formatNumber(item.bw_overage)} over)</span>
                <span className="font-mono text-[#e8e8e8]">{item.bw_overage > 0 ? formatCurrency(item.bw_overage_charge) : '—'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#666]">Color: {formatNumber(item.color_used)} used ({formatNumber(item.color_overage)} over)</span>
                <span className="font-mono text-[#e8e8e8]">{item.color_overage > 0 ? formatCurrency(item.color_overage_charge) : '—'}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm border-t border-[#1a1a1a] pt-2">
            <span className="text-[#e8e8e8] font-medium">Estimated Total</span>
            <span className="font-mono font-semibold text-[#00d4ff]">{formatCurrency(preview.total)}</span>
          </div>
        </div>
      </div>

      {/* Invoice history */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
          <span className="text-sm font-medium">Invoice History</span>
          <Link href="/invoices/run" className="text-xs text-[#00d4ff] hover:underline">Run billing →</Link>
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
                <Td><span className="font-mono text-xs text-[#00d4ff]">{inv.invoice_number}</span></Td>
                <Td><span className="text-xs text-[#666]">{inv.billing_period_start} – {inv.billing_period_end}</span></Td>
                <Td><span className="font-mono font-medium">{formatCurrency(inv.total)}</span></Td>
                <Td><span className="text-xs text-[#666] font-mono">{inv.due_date || '—'}</span></Td>
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
    </div>
  )
}
