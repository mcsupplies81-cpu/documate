'use client'
import { useState, useRef } from 'react'
import { Zap, CheckCircle2, AlertTriangle, Printer, ChevronRight } from 'lucide-react'

const DEMO_TOKEN_DATA = {
  customer: {
    name: 'Meridian Law Group',
    contact: 'Lisa Chen',
    address: '555 Market St, San Francisco, CA 94105',
  },
  dealer: {
    name: 'Pacific Office Solutions',
    phone: '(415) 555-9000',
    email: 'service@pacificoffice.com',
  },
  period: 'May 2026',
  due_date: '2026-06-07',
  equipment: [
    {
      id: 'eq-1',
      make: 'Konica Minolta',
      model: 'bizhub C360i',
      serial: 'A1234567',
      location: 'Main Office',
      last_bw: 138180,
      last_color: 36100,
      last_date: '2026-04-30',
      has_color: true,
    },
    {
      id: 'eq-2',
      make: 'Kyocera',
      model: 'ECOSYS M8130cidn',
      serial: 'B2345678',
      location: 'Floor 3 Copy Room',
      last_bw: 84200,
      last_color: 11200,
      last_date: '2026-04-30',
      has_color: true,
    },
  ],
}

type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error'

interface Reading {
  bw: string
  color: string
  error?: string
}

function validate(reading: Reading, lastBw: number, lastColor: number, hasColor: boolean): string | undefined {
  const bw = parseInt(reading.bw, 10)
  const color = parseInt(reading.color, 10)
  if (!reading.bw || isNaN(bw)) return 'B&W reading required'
  if (bw < lastBw) return `Reading must be ≥ last reading (${lastBw.toLocaleString()})`
  if (bw > lastBw * 3 + 50000) return 'Reading seems unusually high — double-check'
  if (hasColor && (!reading.color || isNaN(color))) return 'Color reading required'
  if (hasColor && color < lastColor) return `Color reading must be ≥ last reading (${lastColor.toLocaleString()})`
  return undefined
}

export default function MeterSubmitPage({ params }: { params: { token: string } }) {
  const [readings, setReadings] = useState<Record<string, Reading>>(
    Object.fromEntries(DEMO_TOKEN_DATA.equipment.map(e => [e.id, { bw: '', color: '' }]))
  )
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [notes, setNotes] = useState('')
  const bwRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const colorRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const { customer, dealer, period, due_date, equipment } = DEMO_TOKEN_DATA

  const setReading = (id: string, field: 'bw' | 'color', value: string) => {
    setReadings(prev => ({ ...prev, [id]: { ...prev[id], [field]: value, error: undefined } }))
  }

  const allValid = equipment.every(e => {
    const r = readings[e.id]
    return !validate(r, e.last_bw, e.last_color, e.has_color)
  })

  const handleKeyDown = (e: React.KeyboardEvent, id: string, field: 'bw' | 'color', idx: number) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      const eq = equipment[idx]
      if (field === 'bw' && eq.has_color) {
        colorRefs.current[id]?.focus()
      } else {
        const nextIdx = idx + 1
        if (nextIdx < equipment.length) {
          bwRefs.current[equipment[nextIdx].id]?.focus()
        }
      }
    }
  }

  const handleSubmit = async () => {
    let hasError = false
    const validated = { ...readings }
    for (const e of equipment) {
      const err = validate(readings[e.id], e.last_bw, e.last_color, e.has_color)
      if (err) {
        validated[e.id] = { ...readings[e.id], error: err }
        hasError = true
      }
    }
    if (hasError) { setReadings(validated); return }

    setStatus('submitting')
    await new Promise(r => setTimeout(r, 1500))
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen bg-[#f6f5f2] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#16a34a]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#111827] mb-2">Readings Submitted</h1>
          <p className="text-[#6b7280] mb-1">Thank you, {customer.contact}.</p>
          <p className="text-[#6b7280] text-sm">Your meter readings for <span className="text-[#111827] font-medium">{period}</span> have been received.</p>
          <p className="text-xs text-[#9ca3af] mt-4">Questions? Contact {dealer.name} at {dealer.phone}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#2563eb] rounded-md flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#111827] tracking-tight">{dealer.name}</div>
              <div className="text-[10px] text-[#9ca3af]">Meter Reading Portal</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#9ca3af]">Due by</div>
            <div className="text-sm font-mono text-[#d97706] font-medium">{due_date}</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Customer info */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#111827] mb-1">Submit Meter Readings</h1>
          <p className="text-sm text-[#6b7280]">
            {customer.name} &nbsp;·&nbsp; {period} billing period
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 mb-6 text-sm text-[#374151] shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <p className="mb-2">Please enter the <strong className="text-[#111827]">current meter reading</strong> from the display panel on each machine. These are <strong className="text-[#111827]">cumulative totals</strong>, not monthly counts.</p>
          <p className="text-xs text-[#6b7280] flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#d97706] flex-shrink-0 mt-0.5" />
            If a reading looks wrong, enter it anyway and add a note below. We will review before billing.
          </p>
        </div>

        {/* Equipment rows */}
        <div className="space-y-3 mb-5">
          {equipment.map((e, idx) => {
            const r = readings[e.id]
            const bwNum = parseInt(r.bw, 10)
            const colorNum = parseInt(r.color, 10)
            const bwPages = !isNaN(bwNum) && bwNum >= e.last_bw ? bwNum - e.last_bw : null
            const colorPages = e.has_color && !isNaN(colorNum) && colorNum >= e.last_color ? colorNum - e.last_color : null

            return (
              <div key={e.id} className={`bg-white border rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(17,17,17,0.03)] ${r.error ? 'border-[#fecaca]' : 'border-[#e5e7eb]'}`}>
                <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center gap-3 bg-[#f9fafb]">
                  <Printer className="w-4 h-4 text-[#9ca3af] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#111827]">{e.make} {e.model}</div>
                    <div className="text-xs text-[#9ca3af]">S/N {e.serial} {e.location ? `· ${e.location}` : ''}</div>
                  </div>
                  <div className="text-right text-xs text-[#9ca3af]">
                    <div>Last read: {e.last_date}</div>
                    <div className="font-mono">{e.last_bw.toLocaleString()} BW {e.has_color ? `/ ${e.last_color.toLocaleString()} CLR` : ''}</div>
                  </div>
                </div>

                <div className="px-4 py-3">
                  <div className={`grid gap-4 ${e.has_color ? 'grid-cols-2' : 'grid-cols-1 max-w-xs'}`}>
                    <div>
                      <label className="block text-xs text-[#6b7280] mb-1.5 uppercase tracking-wider font-medium">B&W Counter</label>
                      <input
                        ref={el => { bwRefs.current[e.id] = el }}
                        type="number"
                        value={r.bw}
                        onChange={ev => setReading(e.id, 'bw', ev.target.value)}
                        onKeyDown={ev => handleKeyDown(ev, e.id, 'bw', idx)}
                        placeholder={e.last_bw.toLocaleString()}
                        className="w-full px-3 py-2.5 text-sm font-mono bg-white border border-[#e5e7eb] rounded-md text-[#111827] placeholder-[#d1d5db] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-transparent"
                      />
                      {bwPages !== null && (
                        <div className="mt-1 text-xs text-[#16a34a] font-mono">+{bwPages.toLocaleString()} pages this period</div>
                      )}
                    </div>
                    {e.has_color && (
                      <div>
                        <label className="block text-xs text-[#6b7280] mb-1.5 uppercase tracking-wider font-medium">Color Counter</label>
                        <input
                          ref={el => { colorRefs.current[e.id] = el }}
                          type="number"
                          value={r.color}
                          onChange={ev => setReading(e.id, 'color', ev.target.value)}
                          onKeyDown={ev => handleKeyDown(ev, e.id, 'color', idx)}
                          placeholder={e.last_color.toLocaleString()}
                          className="w-full px-3 py-2.5 text-sm font-mono bg-white border border-[#e5e7eb] rounded-md text-[#111827] placeholder-[#d1d5db] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-transparent"
                        />
                        {colorPages !== null && (
                          <div className="mt-1 text-xs text-[#16a34a] font-mono">+{colorPages.toLocaleString()} pages this period</div>
                        )}
                      </div>
                    )}
                  </div>
                  {r.error && (
                    <div className="mt-2 text-xs text-[#dc2626] flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      {r.error}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-xs text-[#6b7280] mb-1.5 uppercase tracking-wider font-medium">Additional Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any issues, machine offline, unusual usage, etc."
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#e5e7eb] rounded-md text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-transparent resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={status === 'submitting'}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            status === 'submitting'
              ? 'bg-[#2563eb88] text-white cursor-wait'
              : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] active:scale-[0.99]'
          }`}
        >
          {status === 'submitting' ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>Submit Meter Readings <ChevronRight className="w-4 h-4" /></>
          )}
        </button>

        <p className="text-center text-xs text-[#9ca3af] mt-4">
          By submitting, you confirm these readings were taken directly from the machine display.
        </p>
      </main>
    </div>
  )
}
