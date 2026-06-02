'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MOCK_SERVICE_CALLS, MOCK_USERS } from '@/lib/mock-data'
import { Plus, Calendar, LayoutGrid, Clock, ChevronRight } from 'lucide-react'

const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2, low: 3 }
const PRIORITY_BORDER: Record<string, string> = {
  urgent: 'border-l-[#dc2626]',
  high: 'border-l-[#d97706]',
  normal: 'border-l-[#5c5fef]',
  low: 'border-l-[#d1d5db]',
}
const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-[#dc2626]',
  high: 'bg-[#d97706]',
  normal: 'bg-[#5c5fef]',
  low: 'bg-[#d1d5db]',
}

type ViewMode = 'board' | 'calendar'

const technicians = MOCK_USERS.filter(u => u.role === 'technician' || u.role === 'service_manager')

function getCallAge(openedAt: string) {
  const hours = (Date.now() - new Date(openedAt).getTime()) / 3600000
  if (hours < 4) return { label: `${Math.round(hours)}h`, color: 'text-[#16a34a]' }
  if (hours < 24) return { label: `${Math.round(hours)}h`, color: 'text-[#d97706]' }
  const days = Math.floor(hours / 24)
  return { label: `${days}d`, color: 'text-[#dc2626]' }
}

function CallCard({ call }: { call: typeof MOCK_SERVICE_CALLS[0] }) {
  const age = getCallAge(call.opened_at)
  return (
    <Link href={`/service/${call.id}`}>
      <div className={`bg-white border border-[#e5e7eb] border-l-2 ${PRIORITY_BORDER[call.priority]} rounded-lg p-3 hover:bg-[#f9fafb] hover:shadow-sm transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)]`}>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="font-mono text-[11px] text-[#5c5fef] font-medium">{call.call_number}</div>
          <div className={`text-[11px] font-semibold tabular-nums ${age.color}`}>{age.label}</div>
        </div>
        <div className="text-xs font-medium text-[#111827] mb-1 leading-snug">{call.customer?.name}</div>
        <div className="text-[11px] text-[#9ca3af] line-clamp-2 mb-2">{call.problem_description}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[call.priority]}`} />
            <span className="text-[10px] text-[#6b7280] capitalize">{call.priority}</span>
          </div>
          {call.equipment && (
            <span className="text-[10px] text-[#9ca3af] truncate max-w-[100px]">{call.equipment.make} {call.equipment.model}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function DispatchPage() {
  const [view, setView] = useState<ViewMode>('board')

  const open = MOCK_SERVICE_CALLS
    .filter(c => c.status === 'open' || c.status === 'in_progress')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  const unassigned = open.filter(c => !c.assigned_to)
  const byTech = technicians.map(tech => ({
    tech,
    calls: open.filter(c => c.assigned_to === tech.id)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
  }))

  const today = new Date('2026-06-02').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const urgentCount = open.filter(c => c.priority === 'urgent').length

  return (
    <div>
      <PageHeader
        title="Dispatch Board"
        subtitle={today}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#f3f4f6] border border-[#e5e7eb] rounded-md p-0.5">
              <button
                onClick={() => setView('board')}
                className={`flex items-center gap-1.5 px-3 h-7 rounded text-xs transition-colors ${view === 'board' ? 'bg-white text-[#111827] font-medium shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />Board
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center gap-1.5 px-3 h-7 rounded text-xs transition-colors ${view === 'calendar' ? 'bg-white text-[#111827] font-medium shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'}`}
              >
                <Calendar className="w-3.5 h-3.5" />Schedule
              </button>
            </div>
            <Link href="/service/new">
              <Button variant="primary" size="sm"><Plus className="w-3.5 h-3.5" />New Call</Button>
            </Link>
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Open Calls', value: open.length, color: 'text-[#111827]' },
          { label: 'Unassigned', value: unassigned.length, color: unassigned.length > 0 ? 'text-[#d97706]' : 'text-[#16a34a]' },
          { label: 'Urgent', value: urgentCount, color: urgentCount > 0 ? 'text-[#dc2626]' : 'text-[#16a34a]' },
          { label: 'Technicians Active', value: byTech.filter(t => t.calls.length > 0).length, color: 'text-[#5c5fef]' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e5e7eb] rounded-lg px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1">{s.label}</div>
            <div className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {view === 'board' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Unassigned column */}
          <div className="flex-shrink-0 w-64">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#d97706]" />
              <span className="text-xs font-semibold text-[#374151] uppercase tracking-wider">Unassigned</span>
              <span className="text-[11px] text-[#9ca3af] ml-auto tabular-nums">{unassigned.length}</span>
            </div>
            <div className="space-y-2">
              {unassigned.length === 0 && (
                <div className="text-xs text-[#9ca3af] text-center py-6 border border-dashed border-[#e5e7eb] rounded-lg">All assigned</div>
              )}
              {unassigned.map(c => <CallCard key={c.id} call={c} />)}
            </div>
          </div>

          {/* Per-technician columns */}
          {byTech.map(({ tech, calls }) => (
            <div key={tech.id} className="flex-shrink-0 w-64">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#f0f0ff] border border-[#5c5fef33] flex items-center justify-center text-[10px] text-[#5c5fef] font-semibold flex-shrink-0">
                  {tech.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-xs font-semibold text-[#374151] truncate">{tech.name}</span>
                <span className="text-[11px] text-[#9ca3af] ml-auto flex-shrink-0 tabular-nums">{calls.length}</span>
              </div>
              <div className="space-y-2">
                {calls.length === 0 && (
                  <div className="text-xs text-[#9ca3af] text-center py-6 border border-dashed border-[#e5e7eb] rounded-lg">Available</div>
                )}
                {calls.map(c => <CallCard key={c.id} call={c} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'calendar' && (
        <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="grid border-b border-[#e5e7eb]" style={{ gridTemplateColumns: `120px repeat(${technicians.length}, 1fr)` }}>
            <div className="px-4 py-2.5 text-xs text-[#9ca3af] uppercase tracking-wider font-medium">Time</div>
            {technicians.map(t => (
              <div key={t.id} className="px-4 py-2.5 border-l border-[#e5e7eb]">
                <div className="text-xs font-semibold text-[#111827]">{t.name.split(' ')[0]}</div>
                <div className="text-[10px] text-[#9ca3af] capitalize">{t.role.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
          {Array.from({ length: 10 }, (_, i) => {
            const hour = i + 8
            const label = hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`
            return (
              <div key={hour} className="grid border-b border-[#f3f4f6] min-h-[52px]" style={{ gridTemplateColumns: `120px repeat(${technicians.length}, 1fr)` }}>
                <div className="px-4 py-2 text-[11px] text-[#9ca3af]">{label}</div>
                {technicians.map(t => {
                  const techCalls = byTech.find(b => b.tech.id === t.id)?.calls || []
                  const slotCall = techCalls[hour === 9 ? 0 : hour === 13 ? 1 : -1]
                  return (
                    <div key={t.id} className="border-l border-[#f3f4f6] px-2 py-1.5">
                      {slotCall && (
                        <Link href={`/service/${slotCall.id}`}>
                          <div className={`rounded-md px-2 py-1.5 border-l-2 ${PRIORITY_BORDER[slotCall.priority]} bg-[#f9fafb] hover:bg-[#f0f0ff] border border-[#e5e7eb] transition-colors cursor-pointer`}>
                            <div className="text-[10px] font-mono text-[#5c5fef] font-medium">{slotCall.call_number}</div>
                            <div className="text-[11px] text-[#111827] truncate">{slotCall.customer?.name}</div>
                          </div>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* All open calls table */}
      <div className="mt-6 bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between">
          <span className="text-sm font-semibold text-[#111827]">All Open Service Calls</span>
          <span className="text-xs text-[#9ca3af]">{open.length} calls</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
            <tr>
              {['Call #', 'Customer', 'Equipment', 'Priority', 'Assigned To', 'Age', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {open.map(call => {
              const age = getCallAge(call.opened_at)
              const tech = MOCK_USERS.find(u => u.id === call.assigned_to)
              return (
                <tr key={call.id} className="h-10 hover:bg-[#f9fafb] transition-colors">
                  <td className="px-4 py-2.5"><span className="font-mono text-xs text-[#5c5fef] font-medium">{call.call_number}</span></td>
                  <td className="px-4 py-2.5 text-[#111827] font-medium">{call.customer?.name}</td>
                  <td className="px-4 py-2.5 text-xs text-[#6b7280]">{call.equipment ? `${call.equipment.make} ${call.equipment.model}` : '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[call.priority]}`} />
                      <span className="text-xs capitalize text-[#6b7280]">{call.priority}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {tech ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#f0f0ff] border border-[#5c5fef33] flex items-center justify-center text-[9px] text-[#5c5fef] font-semibold">
                          {tech.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs text-[#374151]">{tech.name.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#d97706] font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5"><span className={`text-xs font-semibold tabular-nums ${age.color}`}>{age.label}</span></td>
                  <td className="px-4 py-2.5">
                    <Link href={`/service/${call.id}`} className="text-xs text-[#5c5fef] hover:underline font-medium">
                      View <ChevronRight className="w-3 h-3 inline" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
