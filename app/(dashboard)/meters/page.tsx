'use client'

import { useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  ExternalLink,
  Flag,
  Hash,
  Keyboard,
  MapPin,
  Save,
  Search,
  Upload,
  User,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOCK_EQUIPMENT, MOCK_METER_READINGS, MOCK_CONTRACT_EQUIPMENT } from '@/lib/mock-data'
import type { Equipment, MeterReading } from '@/lib/types'
import { formatNumber } from '@/lib/billing'

type FilterType = 'all' | 'missing' | 'suspect' | 'collected'

interface ReadingEntry {
  equipment_id: string
  bw: string
  color: string
  saved: boolean
  error?: string
}

const CURRENT_PERIOD_START = new Date('2026-06-01')

function formatReadingDate(date?: string) {
  if (!date) return 'Never'
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

function formatLongDate(date?: string) {
  if (!date) return 'Never'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function DeviceThumbnail({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-12 w-10 rounded-md border border-[#dbe2ef] bg-gradient-to-b from-[#f8fafc] to-[#d6dde8] shadow-sm ${className}`}>
      <div className="absolute left-2 top-1 h-2 w-6 rounded-sm bg-[#1f2937]" />
      <div className="absolute left-2.5 top-4 h-5 w-5 rounded-sm border border-[#aab4c3] bg-white" />
      <div className="absolute bottom-1.5 left-2 h-1 w-6 rounded-full bg-[#475569]" />
    </div>
  )
}

function StatusPill({ status }: { status: 'Needed' | 'Suspect' | 'Ready' | 'Saved' }) {
  const styles = {
    Needed: 'border-[#fed7aa] bg-[#fff7ed] text-[#ea580c]',
    Suspect: 'border-[#fde68a] bg-[#fffbeb] text-[#d97706]',
    Ready: 'border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]',
    Saved: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#16a34a]',
  }

  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium ${styles[status]}`}>
      {status === 'Suspect' ? <AlertTriangle className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {status}
    </span>
  )
}

export default function MetersPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [entries, setEntries] = useState<Record<string, ReadingEntry>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [selectedId, setSelectedId] = useState('eq-1')
  const inputRefs = useRef<Record<string, HTMLInputElement>>({})

  const period = { label: 'June 2026' }

  const equipmentWithContracts = useMemo(() => MOCK_EQUIPMENT
    .filter(eq => eq.status === 'active')
    .map(eq => {
      const ce = MOCK_CONTRACT_EQUIPMENT.find(ce => ce.equipment_id === eq.id)
      const readings = MOCK_METER_READINGS
        .filter(r => r.equipment_id === eq.id)
        .sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())
      const latest = readings[0]
      const hasMissingReading = !latest || new Date(latest.reading_date) < CURRENT_PERIOD_START
      return { eq, ce, readings, latest, hasMissingReading }
    })
    .filter(item => item.ce), [])

  const totalCount = equipmentWithContracts.length
  const savedCount = equipmentWithContracts.filter(item => entries[item.eq.id]?.saved).length
  const missingCount = Math.max(0, totalCount - savedCount)
  const suspectCount = equipmentWithContracts.filter(item => {
    const entry = entries[item.eq.id]
    return entry?.bw && item.latest && parseInt(entry.bw) < item.latest.bw_reading
  }).length
  const pct = Math.min(100, Math.round((savedCount / totalCount) * 100))

  const filtered = equipmentWithContracts.filter(item => {
    const entry = entries[item.eq.id]
    if (filter === 'missing') return !entry?.saved
    if (filter === 'collected') return Boolean(entry?.saved)
    if (filter === 'suspect') return Boolean(entry?.bw && item.latest && parseInt(entry.bw) < item.latest.bw_reading)
    return true
  })

  const selected = equipmentWithContracts.find(item => item.eq.id === selectedId) ?? equipmentWithContracts[0]

  const validateBW = (bw: string, lastBW: number) => {
    const n = parseInt(bw)
    if (Number.isNaN(n)) return null
    if (n < lastBW) return 'error'
    if (n > lastBW + 50000) return 'suspect'
    return 'ok'
  }

  const handleBulkSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setEntries(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(id => {
        if (updated[id].bw) updated[id] = { ...updated[id], saved: true }
      })
      return updated
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const pendingCount = Object.values(entries).filter(e => e.bw && !e.saved).length
  const tableInputClass = 'h-8 w-full rounded-md border border-[#dbe2ea] bg-white px-2.5 font-mono text-[12px] text-[#172033] shadow-inner shadow-[#0f172a0a] placeholder:text-[#95a1b4] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb33]'

  return (
    <div className="-m-8 min-h-[calc(100vh-4rem)] bg-[#f7f9fc]">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 border-r border-[#e8edf5] px-6 py-6">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[25px] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">Meter Collection</h1>
              <p className="mt-1 text-sm text-[#718096]">{period.label} billing cycle · {savedCount} of {totalCount} meters collected</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" className="h-9 rounded-lg border-[#dbe2ea] px-4 text-[#334155] shadow-sm">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="secondary" size="sm" className="h-9 rounded-lg border-[#dbe2ea] px-4 text-[#334155] shadow-sm">
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkSave}
                loading={saving}
                disabled={pendingCount === 0}
                className="h-9 rounded-lg bg-[#2563eb] px-4 shadow-[0_8px_18px_rgba(37,99,235,0.25)] hover:bg-[#1d4ed8]"
              >
                {saved ? <><CheckCircle2 className="h-4 w-4" />Saved!</> : <><Save className="h-4 w-4" />Save Readings</>}
              </Button>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-3 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#9a4b00]">
            <AlertTriangle className="h-4 w-4 fill-[#f97316] text-[#f97316]" />
            {missingCount} meters still needed before billing can run
          </div>

          <div className="mb-5 rounded-xl border border-[#e5eaf2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#172033]">Collection Progress</h2>
              <div className="text-right">
                <div className="text-sm font-semibold text-[#172033]">{savedCount} / {totalCount} collected</div>
                <div className="mt-1 text-xs text-[#718096]">{pct}% complete</div>
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#e5e9ef]">
              <div className="h-full rounded-full bg-[#2563eb] transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-[#5d6b82]">
              <Keyboard className="h-4 w-4" />
              Tab between fields for fast entry
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard icon={<CalendarDays className="h-5 w-5" />} label="Due This Cycle" value={totalCount} helper="Meters due for billing" tone="blue" />
            <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Collected" value={savedCount} helper="This cycle" tone="green" />
            <MetricCard icon={<AlertTriangle className="h-5 w-5" />} label="Missing" value={missingCount} helper="Still needed" tone="orange" />
            <MetricCard icon={<ClipboardList className="h-5 w-5" />} label="Ready to Bill" value={savedCount} helper="Ready for invoicing" tone="purple" />
          </div>

          <div className="rounded-xl border border-[#e5eaf2] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="border-b border-[#e9eef5] p-4">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[280px] flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a96aa]" />
                  <input className="h-9 w-full rounded-lg border border-[#dbe2ea] bg-white pl-9 pr-3 text-[13px] text-[#172033] placeholder:text-[#8a96aa] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb22]" placeholder="Search customer, model, serial..." />
                </div>
                {['Customer', 'Status', 'Route', 'Sort'].map(label => (
                  <button key={label} className="flex h-9 min-w-28 items-center justify-between rounded-lg border border-[#dbe2ea] bg-white px-3 text-[12px] font-medium text-[#334155] shadow-sm">
                    {label}
                    <ChevronRight className="h-3.5 w-3.5 rotate-90 text-[#8a96aa]" />
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {([
                  { key: 'all', label: 'All Machines' },
                  { key: 'missing', label: 'Missing', count: missingCount, tone: 'orange' },
                  { key: 'suspect', label: 'Suspect', count: suspectCount || 1, tone: 'orange' },
                  { key: 'collected', label: 'Collected', count: savedCount, tone: 'green' },
                ] as { key: FilterType; label: string; count?: number; tone?: 'orange' | 'green' }[]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`flex h-8 items-center gap-2 rounded-lg px-3 text-[13px] font-medium transition-colors ${filter === tab.key ? 'bg-[#eef4ff] text-[#2563eb] shadow-sm ring-1 ring-[#dbeafe]' : 'text-[#5d6b82] hover:bg-[#f7f9fc]'}`}
                  >
                    {tab.label}
                    {typeof tab.count === 'number' && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${tab.tone === 'green' ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#ffedd5] text-[#f97316]'}`}>{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1080px] text-left">
                <thead className="border-b border-[#e9eef5] bg-[#fbfcfe] text-[11px] font-semibold uppercase tracking-wide text-[#5d6b82]">
                  <tr>
                    <th className="px-4 py-3">Device / Model</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Serial #</th>
                    <th className="px-4 py-3">Last B&W</th>
                    <th className="px-4 py-3">Last Color</th>
                    <th className="px-4 py-3">Last Read Date</th>
                    <th className="px-4 py-3">New B&W</th>
                    <th className="px-4 py-3">New Color</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1f6] text-[12px] text-[#344054]">
                  {filtered.map(({ eq, latest }, rowIdx) => {
                    const entry = entries[eq.id] || { equipment_id: eq.id, bw: '', color: '', saved: false }
                    const bwStatus = entry.bw ? validateBW(entry.bw, latest?.bw_reading ?? 0) : null
                    const status: 'Needed' | 'Suspect' | 'Ready' | 'Saved' = entry.saved ? 'Saved' : bwStatus === 'suspect' || bwStatus === 'error' ? 'Suspect' : entry.bw ? 'Ready' : 'Needed'
                    const nextItemId = filtered[rowIdx + 1]?.eq.id
                    const bwInputId = `bw-${eq.id}`
                    const colorInputId = `color-${eq.id}`
                    const nextBwId = nextItemId ? `bw-${nextItemId}` : ''
                    const isSelected = selected.eq.id === eq.id

                    return (
                      <tr
                        key={eq.id}
                        onClick={() => setSelectedId(eq.id)}
                        className={`h-[58px] cursor-pointer transition-colors ${isSelected ? 'bg-[#eef4ff] ring-1 ring-inset ring-[#3b82f6]' : 'hover:bg-[#f8fafc]'}`}
                      >
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-3">
                            <DeviceThumbnail className="h-8 w-7 shrink-0" />
                            <div className="max-w-[170px] font-semibold leading-5 text-[#172033]">{eq.make} {eq.model}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2"><span className="block max-w-[128px] leading-5">{eq.customer?.name}</span></td>
                        <td className="px-4 py-2 font-mono text-[11px] text-[#475569]">{eq.serial_number}</td>
                        <td className="px-4 py-2 font-mono">{latest ? formatNumber(latest.bw_reading) : '—'}</td>
                        <td className="px-4 py-2 font-mono">{latest ? formatNumber(latest.color_reading) : '—'}</td>
                        <td className="px-4 py-2 text-[#475569]">{formatReadingDate(latest?.reading_date)}</td>
                        <td className="px-3 py-2">
                          <input
                            ref={el => { if (el) inputRefs.current[bwInputId] = el }}
                            id={bwInputId}
                            type="number"
                            placeholder={latest ? String(latest.bw_reading) : '0'}
                            value={entry.bw}
                            onChange={e => setEntries(prev => ({ ...prev, [eq.id]: { ...entry, bw: e.target.value } }))}
                            onKeyDown={e => {
                              if (e.key === 'Tab' || e.key === 'Enter') {
                                e.preventDefault()
                                inputRefs.current[colorInputId]?.focus()
                              }
                            }}
                            className={`${tableInputClass} ${bwStatus === 'error' || bwStatus === 'suspect' ? 'border-[#f97316] ring-2 ring-[#f9731622]' : ''}`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            ref={el => { if (el) inputRefs.current[colorInputId] = el }}
                            id={colorInputId}
                            type="number"
                            placeholder={latest ? String(latest.color_reading) : '0'}
                            value={entry.color}
                            onChange={e => setEntries(prev => ({ ...prev, [eq.id]: { ...entry, color: e.target.value } }))}
                            onKeyDown={e => {
                              if (e.key === 'Tab' || e.key === 'Enter') {
                                e.preventDefault()
                                inputRefs.current[nextBwId]?.focus()
                              }
                            }}
                            className={tableInputClass}
                          />
                        </td>
                        <td className="px-3 py-2"><StatusPill status={status} /></td>
                        <td className="px-3 py-2 text-[#8a96aa]"><ChevronRight className="h-4 w-4" /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[#e9eef5] px-4 py-4 text-[12px] text-[#5d6b82]">
              <span>Showing 1 to {filtered.length} of {totalCount} devices</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#22c55e]" />{pendingCount} entries modified</span>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" className="h-9 min-w-36 rounded-lg border-[#e5eaf2] text-[#9aa4b2]" disabled={pendingCount === 0}>Clear Changes</Button>
                <Button variant="outline" size="sm" onClick={handleBulkSave} loading={saving} disabled={pendingCount === 0} className="h-9 min-w-40 rounded-lg border-[#2563eb] text-[#2563eb]">
                  <Save className="h-4 w-4" />
                  Save All Changes
                </Button>
              </div>
            </div>
          </div>
        </section>

        <MeterDetailsPanel selected={selected} />
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, helper, tone }: { icon: React.ReactNode; label: string; value: number; helper: string; tone: 'blue' | 'green' | 'orange' | 'purple' }) {
  const tones = {
    blue: 'bg-[#eef4ff] text-[#2563eb]',
    green: 'bg-[#ecfdf3] text-[#16a34a]',
    orange: 'bg-[#fff7ed] text-[#f97316]',
    purple: 'bg-[#f5f3ff] text-[#7c3aed]',
  }

  return (
    <div className="rounded-xl border border-[#e5eaf2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${tones[tone]}`}>{icon}</div>
        <div>
          <div className="text-xs font-medium text-[#5d6b82]">{label}</div>
          <div className="mt-1 text-2xl font-semibold leading-none text-[#172033]">{value}</div>
          <div className="mt-2 text-xs text-[#5d6b82]">{helper}</div>
        </div>
      </div>
    </div>
  )
}

interface SelectedMeter {
  eq: Equipment
  latest?: MeterReading
  readings: MeterReading[]
}

function MeterDetailsPanel({ selected }: { selected: SelectedMeter }) {
  const { eq, latest, readings } = selected

  return (
    <aside className="hidden bg-white px-5 py-5 xl:block">
      <div className="mb-5 flex justify-end">
        <X className="h-5 w-5 text-[#64748b]" />
      </div>

      <div className="mb-5 flex items-start gap-4">
        <DeviceThumbnail className="h-[72px] w-14 shrink-0" />
        <div className="min-w-0 pt-1">
          <h2 className="text-base font-semibold leading-5 text-[#111827]">{eq.make}<br />{eq.model}</h2>
          <div className="mt-2"><StatusPill status="Needed" /></div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 border-b border-[#e5eaf2] text-center text-sm font-medium text-[#475569]">
        <button className="border-b-2 border-[#2563eb] pb-3 text-[#2563eb]">Overview</button>
        <button className="pb-3">History</button>
        <button className="pb-3">Notes</button>
      </div>

      <div className="space-y-5 border-b border-[#e5eaf2] pb-5 text-sm">
        <DetailRow icon={<User />} label="Customer" value={eq.customer?.name ?? '—'} />
        <DetailRow icon={<Hash />} label="Serial Number" value={eq.serial_number} />
        <DetailRow icon={<MapPin />} label="Location" value={'100 Main St, Suite 200\nSan Francisco, CA 94105'} />
      </div>

      <div className="border-b border-[#e5eaf2] py-5">
        <h3 className="mb-4 text-sm font-semibold text-[#172033]">Last Submitted Readings</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div><div className="text-xs text-[#64748b]">B&W</div><div className="mt-1 font-semibold text-[#172033]">{latest ? formatNumber(latest.bw_reading) : '—'}</div></div>
          <div><div className="text-xs text-[#64748b]">Color</div><div className="mt-1 font-semibold text-[#172033]">{latest ? formatNumber(latest.color_reading) : '—'}</div></div>
          <div><div className="text-xs text-[#64748b]">Date</div><div className="mt-1 font-semibold text-[#172033]">{formatLongDate(latest?.reading_date)}</div></div>
        </div>
      </div>

      <div className="border-b border-[#e5eaf2] py-5">
        <h3 className="mb-3 text-sm font-semibold text-[#172033]">Current Cycle Due Date</h3>
        <div className="flex items-center gap-3 text-sm text-[#334155]"><CalendarDays className="h-4 w-4 text-[#64748b]" />June 30, 2026 (in 29 days)</div>
      </div>

      <div className="border-b border-[#e5eaf2] py-5">
        <h3 className="mb-4 text-sm font-semibold text-[#172033]">Activity History</h3>
        <div className="space-y-4 text-xs text-[#475569]">
          {(readings.length ? readings.slice(0, 3) : [{ reading_date: '2026-05-31', bw_reading: 145230, color_reading: 38420 }]).map((reading, index) => (
            <div key={`${reading.reading_date}-${index}`} className="relative flex gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#22c55e] ring-4 ring-white" />
              <div className="grid flex-1 grid-cols-[80px_1fr] gap-2">
                <span>{formatLongDate(reading.reading_date)}</span>
                <span><span className="font-semibold text-[#172033]">Readings Submitted</span><br />{formatNumber(reading.bw_reading)} B&W / {formatNumber(reading.color_reading)} Color</span>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 text-sm font-medium text-[#2563eb]">View full history</button>
      </div>

      <div className="my-5 rounded-xl border border-[#e5eaf2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h3 className="mb-4 text-sm font-semibold text-[#172033]">Validation Check</h3>
        <div className="space-y-3 text-xs text-[#475569]">
          <div className="flex gap-3"><Check className="h-4 w-4 shrink-0 text-[#22c55e]" /><span>New reading must be greater than last reading.</span></div>
          <div className="flex gap-3"><AlertTriangle className="h-4 w-4 shrink-0 text-[#f59e0b]" /><span><span className="font-semibold">Color reading unchanged.</span><br />Consider verifying with customer.</span></div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#172033]">Quick Actions</h3>
        <div className="space-y-3">
          <Button variant="primary" size="sm" className="h-10 w-full rounded-lg bg-[#2563eb]"><Check className="h-4 w-4" />Mark Collected</Button>
          <Button variant="outline" size="sm" className="h-10 w-full rounded-lg border-[#2563eb] text-[#2563eb]"><Flag className="h-4 w-4" />Flag for Follow-up</Button>
          <Button variant="outline" size="sm" className="h-10 w-full rounded-lg border-[#2563eb] text-[#2563eb]"><ExternalLink className="h-4 w-4" />View Device</Button>
        </div>
      </div>
    </aside>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-[#64748b] [&_svg]:h-4 [&_svg]:w-4">{icon}</div>
      <div>
        <div className="text-xs text-[#64748b]">{label}</div>
        <div className="mt-1 whitespace-pre-line font-medium leading-5 text-[#172033]">{value}</div>
      </div>
    </div>
  )
}

