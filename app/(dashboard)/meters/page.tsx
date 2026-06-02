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
    .filter(item => item.ce) // Only equipment on contracts

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

  const handleKeyDown = (e: React.KeyboardEvent, nextId: string) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      const next = inputRefs.current[nextId]
      if (next) { e.preventDefault(); next.focus() }
    }
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
      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-4 mb-5">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#00d4ff]" />
            <span className="font-medium text-[#e8e8e8]">Collection Progress</span>
          </div>
          <span className="font-mono text-[#888]">{collectedCount}/{totalCount} ({pct}%)</span>
        </div>
        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? '#22c55e' : pct > 70 ? '#00d4ff' : '#f59e0b'
            }}
          />
        </div>
        {pct < 100 && (
          <p className="text-xs text-[#444] mt-2">
            {totalCount - collectedCount} meter{totalCount - collectedCount !== 1 ? 's' : ''} still needed for billing.
            Tab between fields for fast entry.
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#111] border border-[#1e1e1e] rounded-md mb-4 w-fit">
        {([
          { key: 'all', label: 'All Machines' },
          { key: 'missing', label: `Missing (${equipmentWithContracts.filter(e => e.hasMissingReading).length})` },
          { key: 'suspect', label: 'Suspect' },
        ] as { key: FilterType; label: string }[]).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${filter === f.key ? 'bg-[#1e1e1e] text-[#e8e8e8]' : 'text-[#555] hover:text-[#888]'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bulk entry table */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1e1e1e]">
            <tr>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#555] uppercase tracking-wider">Customer</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#555] uppercase tracking-wider">Make / Model</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#555] uppercase tracking-wider">Serial #</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#555] uppercase tracking-wider">Last B&W</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#555] uppercase tracking-wider">Last Color</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#555] uppercase tracking-wider">Last Date</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#00d4ff] uppercase tracking-wider">New B&W</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#00d4ff] uppercase tracking-wider">New Color</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#555] uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-12 text-center text-[#444] text-sm">No equipment to display</td>
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
                <tr key={eq.id} className={`transition-colors ${isSaved ? 'bg-[#22c55e08]' : hasMissingReading && !entry.bw ? 'bg-[#f59e0b05]' : ''}`}>
                  <td className="px-3 py-2.5 text-xs text-[#888]">{eq.customer?.name}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-sm text-[#e8e8e8]">{eq.make} {eq.model}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-xs text-[#555]">{eq.serial_number}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-xs text-[#666]">{latest ? formatNumber(latest.bw_reading) : <span className="text-[#333]">—</span>}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-xs text-[#666]">{latest ? formatNumber(latest.color_reading) : <span className="text-[#333]">—</span>}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs ${hasMissingReading && !hasCurrentReading ? 'text-[#f59e0b]' : 'text-[#555]'}`}>
                      {latest?.reading_date || <span className="text-[#ef4444]">Never</span>}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    {isSaved || hasCurrentReading
                      ? (
                        <span className="font-mono text-xs text-[#22c55e]">
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
                              w-32 px-2 py-1.5 text-xs font-mono rounded
                              bg-[#0d0d0d] border text-[#e8e8e8] placeholder-[#333]
                              focus:outline-none focus:ring-1
                              ${bwStatus === 'error' ? 'border-[#ef4444] focus:ring-[#ef4444]' :
                                bwStatus === 'suspect' ? 'border-[#f59e0b] focus:ring-[#f59e0b]' :
                                bwStatus === 'ok' ? 'border-[#22c55e] focus:ring-[#22c55e]' :
                                'border-[#2a2a2a] focus:ring-[#00d4ff]'}
                            `}
                          />
                          {bwStatus === 'error' && (
                            <AlertTriangle className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#ef4444]" />
                          )}
                        </div>
                      )
                    }
                  </td>
                  <td className="px-3 py-1.5">
                    {isSaved || hasCurrentReading
                      ? (
                        <span className="font-mono text-xs text-[#22c55e]">
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
                          className="w-32 px-2 py-1.5 text-xs font-mono rounded bg-[#0d0d0d] border border-[#2a2a2a] text-[#e8e8e8] placeholder-[#333] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                        />
                      )
                    }
                  </td>
                  <td className="px-3 py-2.5">
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
        <div className="flex items-center justify-between mt-4 bg-[#00d4ff0d] border border-[#00d4ff22] rounded-lg px-4 py-3">
          <span className="text-sm text-[#00d4ff]">
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
