'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MOCK_CUSTOMERS, MOCK_EQUIPMENT } from '@/lib/mock-data'

interface MeterGroup {
  equipment_id: string
  included_bw: string
  included_color: string
  bw_overage_rate: string
  color_overage_rate: string
}

export default function NewContractPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [customerId, setCustomerId] = useState('')
  const [contractType, setContractType] = useState('cpc')
  const [meterGroups, setMeterGroups] = useState<MeterGroup[]>([])

  const customerEquipment = MOCK_EQUIPMENT.filter(e => e.customer_id === customerId && e.status === 'active')

  const addMeterGroup = () => {
    setMeterGroups(prev => [...prev, {
      equipment_id: '', included_bw: '2000', included_color: '500',
      bw_overage_rate: '0.0080', color_overage_rate: '0.0650'
    }])
  }

  const removeMeterGroup = (i: number) => {
    setMeterGroups(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    router.push('/contracts')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/contracts" className="text-[#555] hover:text-[#888]"><ArrowLeft className="w-4 h-4" /></Link>
        <span className="text-[#333]">/</span>
        <Link href="/contracts" className="text-sm text-[#555]">Contracts</Link>
        <span className="text-[#333]">/</span>
        <span className="text-sm text-[#888]">New Contract</span>
      </div>

      <PageHeader title="New Service Contract" subtitle="Set up a new maintenance agreement" />

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        {[
          { n: 1, label: 'Customer & Type' },
          { n: 2, label: 'Billing Terms' },
          { n: 3, label: 'Equipment & Meters' },
        ].map(s => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= s.n ? 'bg-[#00d4ff] text-[#0a0a0a]' : 'bg-[#1a1a1a] text-[#555]'}`}>
              {s.n}
            </div>
            <span className={`text-xs ${step >= s.n ? 'text-[#888]' : 'text-[#444]'}`}>{s.label}</span>
            {s.n < 3 && <span className="text-[#2a2a2a] mx-1">—</span>}
          </div>
        ))}
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider">Customer &amp; Contract Type</h3>
              <Select
                label="Customer"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                options={MOCK_CUSTOMERS.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Select a customer"
              />
              <Input label="Contract Number" placeholder="CON-2026-001" />
              <Select
                label="Contract Type"
                value={contractType}
                onChange={e => setContractType(e.target.value)}
                options={[
                  { value: 'cpc', label: 'Cost Per Copy (CPC) — Base rate + overage' },
                  { value: 'flat_rate', label: 'Flat Rate — Fixed monthly, no overage' },
                  { value: 'block', label: 'Block/Copy Block — Pre-paid copy block' },
                  { value: 'equipment_only', label: 'Equipment Only — Tracking only, no billing' },
                ]}
              />
              <div className="flex justify-end">
                <Button variant="primary" size="sm" type="button" onClick={() => setStep(2)} disabled={!customerId}>
                  Next →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider">Billing Terms</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Base Rate ($/month)" type="number" step="0.01" placeholder="0.00" />
                <Select
                  label="Billing Cycle"
                  options={[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'annual', label: 'Annual' },
                  ]}
                  defaultValue="monthly"
                />
                <Input label="Start Date" type="date" required />
                <Input label="End Date" type="date" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="autorenew" className="w-4 h-4 rounded border-[#333] bg-[#111] text-[#00d4ff]" />
                <label htmlFor="autorenew" className="text-sm text-[#888]">Auto-renew at end of term</label>
              </div>
              <Textarea label="Notes" placeholder="Special terms, conditions, etc." rows={2} />
              <div className="flex justify-between">
                <Button variant="ghost" size="sm" type="button" onClick={() => setStep(1)}>← Back</Button>
                <Button variant="primary" size="sm" type="button" onClick={() => setStep(3)}>Next →</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider">Equipment &amp; Meter Groups</h3>
                {contractType !== 'flat_rate' && contractType !== 'equipment_only' && (
                  <Button variant="ghost" size="sm" type="button" onClick={addMeterGroup} disabled={!customerId}>
                    <Plus className="w-3 h-3" />Add Equipment
                  </Button>
                )}
              </div>

              {!customerId && (
                <p className="text-xs text-[#555]">Go back and select a customer to add equipment.</p>
              )}

              {meterGroups.map((group, i) => (
                <div key={i} className="border border-[#2a2a2a] rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#666] font-medium">Equipment {i + 1}</span>
                    <button type="button" onClick={() => removeMeterGroup(i)} className="text-[#444] hover:text-[#ef4444] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Select
                    label="Machine"
                    value={group.equipment_id}
                    onChange={e => {
                      const updated = [...meterGroups]
                      updated[i].equipment_id = e.target.value
                      setMeterGroups(updated)
                    }}
                    options={customerEquipment.map(eq => ({ value: eq.id, label: `${eq.make} ${eq.model} (${eq.serial_number})` }))}
                    placeholder="Select equipment"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Included B&W" type="number" value={group.included_bw} onChange={e => { const u = [...meterGroups]; u[i].included_bw = e.target.value; setMeterGroups(u) }} />
                    <Input label="Included Color" type="number" value={group.included_color} onChange={e => { const u = [...meterGroups]; u[i].included_color = e.target.value; setMeterGroups(u) }} />
                    <Input label="B&W Overage Rate ($/page)" type="number" step="0.0001" value={group.bw_overage_rate} onChange={e => { const u = [...meterGroups]; u[i].bw_overage_rate = e.target.value; setMeterGroups(u) }} />
                    <Input label="Color Overage Rate ($/page)" type="number" step="0.0001" value={group.color_overage_rate} onChange={e => { const u = [...meterGroups]; u[i].color_overage_rate = e.target.value; setMeterGroups(u) }} />
                  </div>
                </div>
              ))}

              {meterGroups.length === 0 && contractType === 'cpc' && (
                <div className="border border-dashed border-[#2a2a2a] rounded-lg p-6 text-center">
                  <p className="text-sm text-[#444] mb-2">No equipment added yet</p>
                  <Button variant="ghost" size="sm" type="button" onClick={addMeterGroup} disabled={!customerId}>
                    <Plus className="w-3 h-3" />Add Equipment
                  </Button>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setStep(2)}>← Back</Button>
                <Button variant="primary" size="sm" type="submit" loading={loading}>
                  Create Contract
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
