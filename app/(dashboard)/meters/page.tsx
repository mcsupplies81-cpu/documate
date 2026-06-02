'use client'
import { useState, useRef } from 'react'
import { CheckCircle2, AlertTriangle, Gauge, Download, Save } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MOCK_EQUIPMENT, MOCK_METER_READINGS, MOCK_CONTRACT_EQUIPMENT } from '@/lib/mock-data'
import { formatNumber } from '@/lib/billing'

type FilterType = 'all' | 'missing' | 'suspect'

interface ReadingEntry {
  equipment_id: string
  bw: string
  color: string
  saved: boolean
  error?: string
}

export default function MetersPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [entries, setEntries] = useState<Record<string, ReadingEntry>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRefs = useRef<Record<string, HTMLInputElement>>({})

  const period = { start: '2026-06-01', end: '2026-06-30', label: 'June 2026' }

  const equipmentWithContracts = MOCK_EQUIPMENT
    .filter(eq => eq.status === 'active')
    .map(eq => {
      const ce = MOCK_CONTRACT_EQUIPMENT.find(ce => ce.equipment_id === eq.id)
      const readings = MOCK_METER_READINGS
        .filter(r => r.equipment_id === eq.id)
        .sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())
      const latest = readings[0]
      const hasMissingReading = !latest || new Date(latest.reading_date) < new Date('2026-06-01')
      return { eq, ce, latest, hasMissingReading }
    })
    .filter(item => item.ce)

  const filtered = equipmentWithContracts.filter(item => {
    if (filter === 'missing') return item.hasMissingReading && !entries[item.eq.id]?.bw
    if (filter === 'suspect') {
      const entry = entries[item.eq.id]
      if (!entry?.bw || !item.latest) return false
      return parseInt(entry.bw) < item.latest.bw_reading
    }
    return true
  })

  const collectedCount = equipmentWithContracts.filter(item =>
    item.latest && new Date(item.latest.reading_date) >= new Date('2026-06-01')
      || entries[item.eq.id]?.saved
  ).length + Object.values(entries).filter(e => e.saved).length

  const totalCount = equipmentWithContracts.length
  const pct = Math.min(100, Math.round((collectedCount / totalCount) * 100))

  const validateBW = (bw: string, lastBW: number) => {
    const n = parseInt(bw)
    if (isNaN(n)) return null
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

  return (
    <div>
      <PageHeader
        title="Meter Collection"
        subtitle={`${period.label} billing cycle · ${collectedCount} of ${totalCount} meters collected`}
        actions={
          <>
            <Button variant="ghost" size="sm">
              <Download className="w-3.5 h-3.5" />Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBulkSave}
              loading={saving}
              disabled={pendingCount === 0}
            >
              {saved
                ? <><CheckCircle2 className="w-3.5 h-3.5" />Saved!</>
                : <><Save className="w-3.5 h-3.5" />Save {pendingCount > 0 ? `${pendingCount} ` : ''}Readings</>
              }
            </Button>
          </>
        }
      />

      {/* Progress */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#5c5fef]" />
            <span className="font-semibold text-[#111827]">Collection Progress</span>
          </div>
          <span className="text-[#6b7280] tabular-nums text-sm">{collectedCount}/{totalCount} ({pct}%)</span>
        </div>
        <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? '#16a34a' : pct > 70 ? '#5c5fef' : '#d97706'
            }}
          />
        </div>
        {pct < 100 && (
          <p className="text-xs text-[#9ca3af] mt-2">
            {totalCount - collectedCount} meter{totalCount - collectedCount !== 1 ? 's' : ''} still needed for billing.
            Tab between fields for fast entry.
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0.5 p-0.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-md mb-4 w-fit">
        {([
          { key: 'all', label: 'All Machines' },
          { key: 'missing', label: `Missing (${equipmentWithContracts.filter(e => e.hasMissingReading).length})` },
          { key: 'suspect', label: 'Suspect' },
        ] as { key: FilterType; label: string }[]).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 h-7 text-xs rounded transition-colors ${filter === f.key ? 'bg-white text-[#111827] font-medium shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bulk entry table */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[#f0f0f0]">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Customer</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Make / Model</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Serial #</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Last B&W</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Last Color</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Last Date</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#5c5fef] uppercase tracking-wider">New B&W</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#5c5fef] uppercase tracking-wider">New Color</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[#9ca3af] text-sm">No equipment to display</td>
              </tr>
            )}
            {filtered.map(({ eq, latest, hasMissingReading }, rowIdx) => {
              const entry = entries[eq.id] || { equipment_id: eq.id, bw: '', color: '', saved: false }
              const bwStatus = entry.bw ? validateBW(entry.bw, latest?.bw_reading ?? 0) : null
              const hasCurrentReading = latest && new Date(latest.reading_date) >= new Date('2026-06-01')
              const isSaved = entry.saved

              const nextItemId = filtered[rowIdx + 1]?.eq.id
              const bwInputId = `bw-${eq.id}`
              const colorInputId = `color-${eq.id}`
              const nextBwId = nextItemId ? `bw-${nextItemId}` : ''

              return (
                <tr key={eq.id} className={`h-10 transition-colors ${isSaved ? 'bg-[#f0fdf4]' : hasMissingReading && !entry.bw ? 'bg-[#fffbeb]' : 'hover:bg-[#f9fafb]'}`}>
                  <td className="px-4 py-2.5 text-xs text-[#6b7280]">{eq.customer?.name}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-sm text-[#111827] font-medium">{eq.make} {eq.model}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-[#6b7280]">{eq.serial_number}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-[#374151]">{latest ? formatNumber(latest.bw_reading) : <span className="text-[#9ca3af]">—</span>}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-[#374151]">{latest ? formatNumber(latest.color_reading) : <span className="text-[#9ca3af]">—</span>}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs ${hasMissingReading && !hasCurrentReading ? 'text-[#d97706] font-medium' : 'text-[#6b7280]'}`}>
                      {latest?.reading_date || <span className="text-[#dc2626] font-medium">Never</span>}
                    </span>
                  </td>
                  <td className="px-4 py-1.5">
                    {isSaved || hasCurrentReading
                      ? (
                        <span className="font-mono text-xs text-[#16a34a] font-medium">
                          {formatNumber(parseInt(entry.bw) || latest?.bw_reading || 0)}
                        </span>
                      )
                      : (
                        <div className="relative">
                          <input
                            ref={el => { if (el) inputRefs.current[bwInputId] = el }}
                            id={bwInputId}
                            type="number"
                            placeholder={latest ? String(latest.bw_reading) : '0'}
                            value={entry.bw}
                            onChange={e => setEntries(prev => ({
                              ...prev,
                              [eq.id]: { ...entry, bw: e.target.value }
                            }))}
                            onKeyDown={e => {
                              if (e.key === 'Tab' || e.key === 'Enter') {
                                e.preventDefault()
                                const next = inputRefs.current[colorInputId]
                                if (next) next.focus()
                              }
                            }}
                            className={`
                              w-32 px-2 h-7 text-xs font-mono rounded
                              bg-white border text-[#111827] placeholder-[#9ca3af]
                              focus:outline-none focus:ring-1
                              ${bwStatus === 'error' ? 'border-[#dc2626] focus:ring-[#dc2626]' :
                                bwStatus === 'suspect' ? 'border-[#d97706] focus:ring-[#d97706]' :
                                bwStatus === 'ok' ? 'border-[#16a34a] focus:ring-[#16a34a]' :
                                'border-[#e5e7eb] focus:ring-[#5c5fef]'}
                            `}
                          />
                          {bwStatus === 'error' && (
                            <AlertTriangle className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#dc2626]" />
                          )}
                        </div>
                      )
                    }
                  </td>
                  <td className="px-4 py-1.5">
                    {isSaved || hasCurrentReading
                      ? (
                        <span className="font-mono text-xs text-[#16a34a] font-medium">
                          {formatNumber(parseInt(entry.color) || latest?.color_reading || 0)}
                        </span>
                      )
                      : (
                        <input
                          ref={el => { if (el) inputRefs.current[colorInputId] = el }}
                          id={colorInputId}
                          type="number"
                          placeholder={latest ? String(latest.color_reading) : '0'}
                          value={entry.color}
                          onChange={e => setEntries(prev => ({
                            ...prev,
                            [eq.id]: { ...entry, color: e.target.value }
                          }))}
                          onKeyDown={e => {
                            if (e.key === 'Tab' || e.key === 'Enter') {
                              e.preventDefault()
                              const next = inputRefs.current[nextBwId]
                              if (next) next.focus()
                            }
                          }}
                          className="w-32 px-2 h-7 text-xs font-mono rounded bg-white border border-[#e5e7eb] text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#5c5fef]"
                        />
                      )
                    }
                  </td>
                  <td className="px-4 py-2.5">
                    {isSaved
                      ? <Badge variant="success"><CheckCircle2 className="w-2.5 h-2.5" />Saved</Badge>
                      : hasCurrentReading
                      ? <Badge variant="success">Current</Badge>
                      : entry.bw
                      ? bwStatus === 'error'
                        ? <Badge variant="danger"><AlertTriangle className="w-2.5 h-2.5" />Error</Badge>
                        : bwStatus === 'suspect'
                        ? <Badge variant="warning"><AlertTriangle className="w-2.5 h-2.5" />Suspect</Badge>
                        : <Badge variant="info">Ready</Badge>
                      : <Badge variant="warning">Needed</Badge>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center justify-between mt-4 bg-[#f0f0ff] border border-[#5c5fef33] rounded-lg px-4 py-3">
          <span className="text-sm text-[#5c5fef] font-medium">
            {pendingCount} reading{pendingCount !== 1 ? 's' : ''} ready to save
          </span>
          <Button variant="primary" size="sm" onClick={handleBulkSave} loading={saving}>
            <Save className="w-3.5 h-3.5" />
            Save All Readings
          </Button>
        </div>
      )}
    </div>
  )
}
