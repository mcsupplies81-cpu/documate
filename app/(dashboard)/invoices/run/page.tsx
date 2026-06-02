'use client'
import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, ChevronDown, ChevronRight, CheckCircle2, Zap, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { MOCK_CONTRACTS, MOCK_CONTRACT_EQUIPMENT, MOCK_METER_READINGS, MOCK_CUSTOMERS } from '@/lib/mock-data'
import { calculateBilling, formatCurrency, formatNumber, getCurrentPeriod } from '@/lib/billing'
import type { BillingPreviewItem } from '@/lib/types'

type RunState = 'idle' | 'preview' | 'running' | 'done'

export default function BillingRunPage() {
  const [runState, setRunState] = useState<RunState>('idle')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState(0)
  const [generatedInvoices, setGeneratedInvoices] = useState(0)

  const period = getCurrentPeriod()

  // Calculate previews for all active contracts
  const activeBillingContracts = MOCK_CONTRACTS.filter(c =>
    c.status === 'active' || c.status === 'expiring'
  )

  const previews: BillingPreviewItem[] = activeBillingContracts
    .filter(c => c.contract_type !== 'equipment_only')
    .map(contract => {
      const ces = MOCK_CONTRACT_EQUIPMENT
        .filter(ce => ce.contract_id === contract.id)
        .map(ce => ({
          ...ce,
          equipment: MOCK_METER_READINGS
            .filter(r => r.equipment_id === ce.equipment_id)
            .sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())[0]
            ? { ...ce } : ce
        }))

      const contractWithEq = { ...contract, contract_equipment: ces }
      const customer = MOCK_CUSTOMERS.find(c => c.id === contract.customer_id)!

      const currentReadings: Record<string, import('@/lib/types').MeterReading> = {}
      for (const ce of ces) {
        const readings = MOCK_METER_READINGS
          .filter(r => r.equipment_id === ce.equipment_id)
          .sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())
        if (readings[0]) currentReadings[ce.equipment_id] = readings[0]
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return calculateBilling(contractWithEq as any, customer, currentReadings, period.start, period.end)
    })

  const totalRevenue = previews.reduce((sum, p) => sum + p.total, 0)
  const totalOverage = previews.reduce((sum, p) => sum + p.total_overage, 0)

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handlePreview = () => setRunState('preview')

  const handleGenerate = async () => {
    setRunState('running')
    setProgress(0)
    for (let i = 0; i <= previews.length; i++) {
      await new Promise(r => setTimeout(r, 300))
      setProgress(Math.round((i / previews.length) * 100))
      setGeneratedInvoices(i)
    }
    setRunState('done')
  }

  const hasMissingReadings = previews.some(p =>
    p.equipment_items.some(item => item.bw_used === 0 && item.color_used === 0)
  )

  return (
    <div>
      <PageHeader
        title="Billing Run"
        subtitle={`${period.start} – ${period.end}`}
        breadcrumb={[{ label: 'Invoices', href: '/invoices' }, { label: 'Billing Run' }]}
      />

      {runState === 'done' ? (
        /* Success State */
        <div className="max-w-xl mx-auto text-center py-16">
          <div className="w-16 h-16 bg-[#f0fdf4] border border-[#bbf7d0] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#16a34a]" />
          </div>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">Billing Complete</h2>
          <p className="text-[#6b7280] mb-2">
            <span className="text-[#111827] font-mono font-semibold">{generatedInvoices}</span> invoices generated
          </p>
          <p className="text-2xl font-mono font-semibold text-[#5c5fef] mb-8">{formatCurrency(totalRevenue)}</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/invoices">
              <Button variant="secondary" size="md">View Invoices</Button>
            </Link>
            <Button variant="primary" size="md" onClick={() => setRunState('idle')}>
              <TrendingUp className="w-4 h-4" />
              New Run
            </Button>
          </div>
        </div>
      ) : runState === 'running' ? (
        /* Running State */
        <div className="max-w-xl mx-auto py-16">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#f0f0ff] border border-[#5c5fef33] rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-[#5c5fef] animate-pulse" />
            </div>
            <h2 className="text-lg font-semibold text-[#111827]">Generating Invoices...</h2>
            <p className="text-sm text-[#6b7280] mt-1">{generatedInvoices} of {previews.length} complete</p>
          </div>
          <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5c5fef] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-xs font-mono text-[#9ca3af] mt-1">{progress}%</div>
        </div>
      ) : (
        <>
          {/* Idle / Preview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Contracts to Bill</div>
              <div className="text-2xl font-mono font-semibold text-[#111827]">{previews.length}</div>
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="text-xs text-[#6b7280] uppercase tracking-wide mb-1">Base Charges</div>
              <div className="text-2xl font-mono font-semibold text-[#111827]">{formatCurrency(previews.reduce((s, p) => s + p.base_charge, 0))}</div>
            </div>
            <div className="bg-white border border-[#5c5fef33] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="text-xs text-[#5c5fef] uppercase tracking-wide mb-1">Total to Invoice</div>
              <div className="text-2xl font-mono font-semibold text-[#5c5fef]">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs text-[#9ca3af] mt-0.5">+{formatCurrency(totalOverage)} overages</div>
            </div>
          </div>

          {hasMissingReadings && (
            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-lg px-4 py-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#d97706] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-[#92400e] font-medium">Missing meter readings</p>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Some equipment has no readings for this period. Overages will be calculated as zero.
                  <Link href="/meters" className="text-[#5c5fef] ml-1 hover:underline">Enter readings →</Link>
                </p>
              </div>
            </div>
          )}

          {runState === 'idle' && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#6b7280]">Review the billing preview below before generating invoices.</p>
              <Button variant="primary" size="md" onClick={handlePreview}>
                <TrendingUp className="w-4 h-4" />
                Preview Billing
              </Button>
            </div>
          )}

          {runState === 'preview' && (
            <div className="flex items-center justify-between mb-4 bg-[#f0f0ff] border border-[#5c5fef33] rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#111827]">Preview ready — {previews.length} invoices, {formatCurrency(totalRevenue)} total</p>
                <p className="text-xs text-[#6b7280] mt-0.5">Review each invoice below, then click Generate to create and send them.</p>
              </div>
              <Button variant="primary" size="md" onClick={handleGenerate}>
                <Zap className="w-4 h-4" />
                Generate All Invoices
              </Button>
            </div>
          )}

          {/* Preview table */}
          <div className="space-y-2">
            {previews.map((preview) => {
              const contractId = preview.contract.id
              const isExpanded = expanded.has(contractId)
              return (
                <div key={contractId} className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f9fafb] transition-colors text-left"
                    onClick={() => toggleExpand(contractId)}
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-[#9ca3af] flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-[#9ca3af] flex-shrink-0" />}
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div>
                        <div className="text-sm font-medium text-[#111827]">{preview.customer.name}</div>
                        <div className="text-xs text-[#9ca3af] font-mono">{preview.contract.contract_number}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#9ca3af]">Base</div>
                        <div className="font-mono text-sm text-[#374151]">{formatCurrency(preview.base_charge)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#9ca3af]">B&W Overage</div>
                        <div className="font-mono text-sm text-[#374151]">
                          {formatCurrency(preview.equipment_items.reduce((s, i) => s + i.bw_overage_charge, 0))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#9ca3af]">Color Overage</div>
                        <div className="font-mono text-sm text-[#374151]">
                          {formatCurrency(preview.equipment_items.reduce((s, i) => s + i.color_overage_charge, 0))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#9ca3af]">Total</div>
                        <div className="font-mono text-lg font-semibold text-[#5c5fef]">{formatCurrency(preview.total)}</div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#f3f4f6] px-4 py-3 bg-[#f9fafb]">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-[#6b7280]">
                          <span>Base service charge</span>
                          <span className="font-mono">{formatCurrency(preview.base_charge)}</span>
                        </div>
                        {preview.equipment_items.map(item => (
                          <div key={item.equipment?.id || item.contract_equipment.id} className="pl-3 border-l-2 border-[#e5e7eb] space-y-1.5">
                            <div className="text-xs font-medium text-[#374151]">
                              {item.equipment ? `${(item.equipment as { make: string }).make} ${(item.equipment as { model: string }).model}` : 'Equipment'}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#6b7280]">
                                B&W: {formatNumber(item.bw_used)} printed, {formatNumber(item.contract_equipment.included_bw)} included,{' '}
                                <span className={item.bw_overage > 0 ? 'text-[#d97706]' : 'text-[#9ca3af]'}>
                                  {formatNumber(item.bw_overage)} overage × ${item.contract_equipment.bw_overage_rate.toFixed(4)}
                                </span>
                              </span>
                              <span className={`font-mono ${item.bw_overage > 0 ? 'text-[#374151]' : 'text-[#9ca3af]'}`}>
                                {formatCurrency(item.bw_overage_charge)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#6b7280]">
                                Color: {formatNumber(item.color_used)} printed, {formatNumber(item.contract_equipment.included_color)} included,{' '}
                                <span className={item.color_overage > 0 ? 'text-[#d97706]' : 'text-[#9ca3af]'}>
                                  {formatNumber(item.color_overage)} overage × ${item.contract_equipment.color_overage_rate.toFixed(4)}
                                </span>
                              </span>
                              <span className={`font-mono ${item.color_overage > 0 ? 'text-[#374151]' : 'text-[#9ca3af]'}`}>
                                {formatCurrency(item.color_overage_charge)}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between text-sm border-t border-[#e5e7eb] pt-2">
                          <span className="font-medium text-[#111827]">Invoice Total</span>
                          <span className="font-mono font-semibold text-[#5c5fef]">{formatCurrency(preview.total)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {runState === 'preview' && (
            <div className="flex justify-end mt-4">
              <Button variant="primary" size="lg" onClick={handleGenerate}>
                <Zap className="w-4 h-4" />
                Generate {previews.length} Invoices — {formatCurrency(totalRevenue)}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
