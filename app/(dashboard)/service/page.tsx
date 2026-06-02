'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Clock } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { MOCK_SERVICE_CALLS } from '@/lib/mock-data'

type StatusFilter = 'all' | 'open' | 'in_progress' | 'completed' | 'closed'
type PriorityFilter = 'all' | 'urgent' | 'high' | 'normal' | 'low'

function getAge(openedAt: string) {
  const ms = Date.now() - new Date(openedAt).getTime()
  const hours = ms / 3600000
  if (hours < 1) return { label: `${Math.round(hours * 60)}m`, color: 'text-[#22c55e]' }
  if (hours < 4) return { label: `${Math.round(hours)}h`, color: 'text-[#22c55e]' }
  if (hours < 24) return { label: `${Math.round(hours)}h`, color: 'text-[#f59e0b]' }
  const d = Math.floor(hours / 24)
  const h = Math.round(hours % 24)
  return { label: `${d}d ${h}h`, color: 'text-[#ef4444]' }
}

export default function ServicePage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')

  const filtered = MOCK_SERVICE_CALLS.filter(sc => {
    const matchSearch = sc.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      sc.call_number.toLowerCase().includes(search.toLowerCase()) ||
      sc.problem_description?.toLowerCase().includes(search.toLowerCase()) ||
      sc.equipment?.model?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || sc.status === statusFilter
    const matchPriority = priorityFilter === 'all' || sc.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  const counts = {
    open: MOCK_SERVICE_CALLS.filter(s => s.status === 'open').length,
    in_progress: MOCK_SERVICE_CALLS.filter(s => s.status === 'in_progress').length,
  }

  return (
    <div>
      <PageHeader
        title="Service Calls"
        subtitle={`${counts.open} open · ${counts.in_progress} in progress`}
        actions={
          <Link href="/service/new">
            <Button variant="primary" size="sm"><Plus className="w-3.5 h-3.5" />New Service Call</Button>
          </Link>
        }
      />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
          <input
            type="text"
            placeholder="Search calls..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#111] border border-[#222] rounded-md text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#111] border border-[#1e1e1e] rounded-md">
          {(['all', 'open', 'in_progress', 'completed', 'closed'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded transition-colors ${statusFilter === s ? 'bg-[#1e1e1e] text-[#e8e8e8]' : 'text-[#555] hover:text-[#888]'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#111] border border-[#1e1e1e] rounded-md">
          {(['all', 'urgent', 'high', 'normal', 'low'] as PriorityFilter[]).map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 text-xs rounded transition-colors capitalize ${priorityFilter === p ? 'bg-[#1e1e1e] text-[#e8e8e8]' : 'text-[#555] hover:text-[#888]'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
        <Table>
          <Thead>
            <tr>
              <Th>Call #</Th>
              <Th>Customer</Th>
              <Th>Equipment</Th>
              <Th>Problem</Th>
              <Th>Tech</Th>
              <Th>Priority</Th>
              <Th>Age</Th>
              <Th>Status</Th>
              <Th>Billable</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <EmptyRow cols={10} message="No service calls found" />}
            {filtered.map(sc => {
              const age = getAge(sc.opened_at)
              const isOpen = sc.status === 'open' || sc.status === 'in_progress'
              return (
                <Tr key={sc.id} onClick={() => window.location.href = `/service/${sc.id}`}>
                  <Td><span className="font-mono text-xs text-[#00d4ff]">{sc.call_number}</span></Td>
                  <Td>
                    <Link href={`/customers/${sc.customer_id}`} onClick={e => e.stopPropagation()} className="text-[#e8e8e8] hover:text-[#00d4ff] transition-colors">
                      {sc.customer?.name}
                    </Link>
                  </Td>
                  <Td><span className="text-xs text-[#666]">{sc.equipment?.make} {sc.equipment?.model}</span></Td>
                  <Td>
                    <span className="text-xs text-[#888] block truncate max-w-[220px]" title={sc.problem_description || ''}>
                      {sc.problem_description}
                    </span>
                  </Td>
                  <Td>
                    <span className={`text-xs ${sc.assigned_to ? 'text-[#888]' : 'text-[#ef4444]'}`}>
                      {sc.technician?.name || 'Unassigned'}
                    </span>
                  </Td>
                  <Td>
                    <Badge variant={
                      sc.priority === 'urgent' ? 'danger' :
                      sc.priority === 'high' ? 'warning' :
                      sc.priority === 'normal' ? 'default' : 'muted'
                    }>
                      {sc.priority}
                    </Badge>
                  </Td>
                  <Td>
                    {isOpen
                      ? <span className={`text-xs font-mono flex items-center gap-1 ${age.color}`}><Clock className="w-3 h-3" />{age.label}</span>
                      : <span className="text-xs text-[#444]">{sc.closed_at ? new Date(sc.closed_at).toLocaleDateString() : '—'}</span>
                    }
                  </Td>
                  <Td>
                    <Badge variant={
                      sc.status === 'open' ? 'danger' :
                      sc.status === 'in_progress' ? 'warning' :
                      sc.status === 'completed' ? 'success' : 'muted'
                    }>
                      {sc.status.replace('_', ' ')}
                    </Badge>
                  </Td>
                  <Td>
                    <span className={`text-xs ${sc.billable ? 'text-[#f59e0b]' : 'text-[#333]'}`}>
                      {sc.billable ? 'Yes' : 'No'}
                    </span>
                  </Td>
                  <Td>
                    <Link href={`/service/${sc.id}`} onClick={e => e.stopPropagation()} className="text-xs text-[#555] hover:text-[#00d4ff]">
                      View →
                    </Link>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </div>
    </div>
  )
}
