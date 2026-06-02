'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, ChevronDown, ChevronRight, CheckCircle2, Zap, AlertTriangle } from 'lucide-react'
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
      <div className="flex items-center gap-3 mb-4">
        <Link href="/invoices" className="text-[#555] hover:text-[#888]"><ArrowLeft className="w-4 h-4" /></Link>
        <span className="text-[#333]">/</span>
        <Link href="/invoices" className="text-sm text-[#555]">Invoices</Link>
        <span className="text-[#333]">/</span>
        <span className="text-sm text-[#888]">Billing Run</span>
      </div>

      <PageHeader
        title="Billing Run"
        subtitle={`${period.start} – ${period.end}`}
      />

      {runState === 'done' ? (
        /* Success State */
        <div className="max-w-xl mx-auto text-center py-16">
          <div className="w-16 h-16 bg-[#22c55e1a] border border-[#22c55e33] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
          </div>
          <h2 className="text-xl font-semibold text-[#e8e8e8] mb-2">Billing Complete</h2>
          <p className="text-[#555] mb-2">
            <span className="text-[#e8e8e8] font-mono font-semibold">{generatedInvoices}</span> invoices generated
          </p>
          <p className="text-2xl font-mono font-semibold text-[#00d4ff] mb-8">{formatCurrency(totalRevenue)}</p>
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
            <div className="w-14 h-14 bg-[#00d4ff1a] border border-[#00d4ff33] rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-[#00d4ff] animate-pulse" />
            </div>
            <h2 className="text-lg font-semibold text-[#e8e8e8]">Generating Invoices...</h2>
            <p className="text-sm text-[#555] mt-1">{generatedInvoices} of {previews.length} complete</p>
          </div>
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00d4ff] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-xs font-mono text-[#555] mt-1">{progress}%</div>
        </div>
      ) : (
        <>
          {/* Idle / Preview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-4">
              <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Contracts to Bill</div>
              <div className="text-2xl font-mono font-semibold text-[#e8e8e8]">{previews.length}</div>
            </div>
            <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-4">
              <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Base Charges</div>
              <div className="text-2xl font-mono font-semibold text-[#e8e8e8]">{formatCurrency(previews.reduce((s, p) => s + p.base_charge, 0))}</div>
            </div>
            <div className="bg-[#111] border border-[#00d4ff22] rounded-lg p-4">
              <div className="text-xs text-[#00d4ff] uppercase tracking-wide mb-1">Total to Invoice</div>
              <div className="text-2xl font-mono font-semibold text-[#00d4ff]">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs text-[#555] mt-0.5">+{formatCurrency(totalOverage)} overages</div>
            </div>
          </div>

          {hasMissingReadings && (
            <div className="bg-[#f59e0b0d] border border-[#f59e0b33] rounded-lg px-4 py-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-[#f59e0b] font-medium">Missing meter readings</p>
                <p className="text-xs text-[#888] mt-0.5">
                  Some equipment has no readings for this period. Overages will be calculated as zero.
                  <Link href="/meters" className="text-[#00d4ff] ml-1 hover:underline">Enter readings →</Link>
                </p>
              </div>
            </div>
          )}

          {runState === 'idle' && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#555]">Review the billing preview below before generating invoices.</p>
              <Button variant="primary" size="md" onClick={handlePreview}>
                <TrendingUp className="w-4 h-4" />
                Preview Billing
              </Button>
            </div>
          )}

          {runState === 'preview' && (
            <div className="flex items-center justify-between mb-4 bg-[#00d4ff0a] border border-[#00d4ff22] rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#e8e8e8]">Preview ready — {previews.length} invoices, {formatCurrency(totalRevenue)} total</p>
                <p className="text-xs text-[#555] mt-0.5">Review each invoice below, then click Generate to create and send them.</p>
              </div>
              <Button variant="primary" size="md" onClick={handleGenerate}>
                <Zap className="w-4 h-4" />
                Generate All Invoices
              </Button>
            </div>
          )}

          {/* Preview table */}
          <div className="space-y-2">
            {previews.map((preview, i) => {
              const contractId = preview.contract.id
              const isExpanded = expanded.has(contractId)
              return (
                <div key={contractId} className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#141414] transition-colors text-left"
                    onClick={() => toggleExpand(contractId)}
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-[#444] flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-[#444] flex-shrink-0" />}
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div>
                        <div className="text-sm font-medium text-[#e8e8e8]">{preview.customer.name}</div>
                        <div className="text-xs text-[#555] font-mono">{preview.contract.contract_number}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#444]">Base</div>
                        <div className="font-mono text-sm">{formatCurrency(preview.base_charge)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#444]">B&W Overage</div>
                        <div className="font-mono text-sm">
                          {formatCurrency(preview.equipment_items.reduce((s, i) => s + i.bw_overage_charge, 0))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#444]">Color Overage</div>
                        <div className="font-mono text-sm">
                          {formatCurrency(preview.equipment_items.reduce((s, i) => s + i.color_overage_charge, 0))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#444]">Total</div>
                        <div className="font-mono text-lg font-semibold text-[#00d4ff]">{formatCurrency(preview.total)}</div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#1a1a1a] px-4 py-3 bg-[#0d0d0d]">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-[#666]">
                          <span>Base service charge</span>
                          <span className="font-mono">{formatCurrency(preview.base_charge)}</span>
                        </div>
                        {preview.equipment_items.map(item => (
                          <div key={item.equipment?.id || item.contract_equipment.id} className="pl-3 border-l border-[#2a2a2a] space-y-1.5">
                            <div className="text-xs font-medium text-[#888]">
                              {item.equipment ? `${(item.equipment as { make: string }).make} ${(item.equipment as { model: string }).model}` : 'Equipment'}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#555]">
                                B&W: {formatNumber(item.bw_used)} printed, {formatNumber(item.contract_equipment.included_bw)} included,{' '}
                                <span className={item.bw_overage > 0 ? 'text-[#f59e0b]' : 'text-[#444]'}>
                                  {formatNumber(item.bw_overage)} overage × ${item.contract_equipment.bw_overage_rate.toFixed(4)}
                                </span>
                              </span>
                              <span className={`font-mono ${item.bw_overage > 0 ? 'text-[#e8e8e8]' : 'text-[#444]'}`}>
                                {formatCurrency(item.bw_overage_charge)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#555]">
                                Color: {formatNumber(item.color_used)} printed, {formatNumber(item.contract_equipment.included_color)} included,{' '}
                                <span className={item.color_overage > 0 ? 'text-[#f59e0b]' : 'text-[#444]'}>
                                  {formatNumber(item.color_overage)} overage × ${item.contract_equipment.color_overage_rate.toFixed(4)}
                                </span>
                              </span>
                              <span className={`font-mono ${item.color_overage > 0 ? 'text-[#e8e8e8]' : 'text-[#444]'}`}>
                                {formatCurrency(item.color_overage_charge)}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between text-sm border-t border-[#1a1a1a] pt-2">
                          <span className="font-medium text-[#e8e8e8]">Invoice Total</span>
                          <span className="font-mono font-semibold text-[#00d4ff]">{formatCurrency(preview.total)}</span>
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
