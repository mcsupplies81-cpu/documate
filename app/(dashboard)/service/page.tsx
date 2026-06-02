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
  if (hours < 1) return { label: `${Math.round(hours * 60)}m`, color: 'text-[#16a34a]' }
  if (hours < 4) return { label: `${Math.round(hours)}h`, color: 'text-[#16a34a]' }
  if (hours < 24) return { label: `${Math.round(hours)}h`, color: 'text-[#d97706]' }
  const d = Math.floor(hours / 24)
  const h = Math.round(hours % 24)
  return { label: `${d}d ${h}h`, color: 'text-[#dc2626]' }
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search calls..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-9 text-sm bg-white border border-[#e5e7eb] rounded-md text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#5c5fef] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-0.5 p-0.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-md">
          {(['all', 'open', 'in_progress', 'completed', 'closed'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 h-7 text-xs rounded transition-colors ${statusFilter === s ? 'bg-white text-[#111827] font-medium shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 p-0.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-md">
          {(['all', 'urgent', 'high', 'normal', 'low'] as PriorityFilter[]).map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 h-7 text-xs rounded transition-colors capitalize ${priorityFilter === p ? 'bg-white text-[#111827] font-medium shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
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
                  <Td><span className="font-mono text-xs text-[#5c5fef] font-medium">{sc.call_number}</span></Td>
                  <Td>
                    <Link href={`/customers/${sc.customer_id}`} onClick={e => e.stopPropagation()} className="text-[#111827] font-medium hover:text-[#5c5fef] transition-colors">
                      {sc.customer?.name}
                    </Link>
                  </Td>
                  <Td><span className="text-xs text-[#6b7280]">{sc.equipment?.make} {sc.equipment?.model}</span></Td>
                  <Td>
                    <span className="text-xs text-[#6b7280] block truncate max-w-[220px]" title={sc.problem_description || ''}>
                      {sc.problem_description}
                    </span>
                  </Td>
                  <Td>
                    <span className={`text-xs font-medium ${sc.assigned_to ? 'text-[#374151]' : 'text-[#dc2626]'}`}>
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
                      : <span className="text-xs text-[#9ca3af]">{sc.closed_at ? new Date(sc.closed_at).toLocaleDateString() : '—'}</span>
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
                    <span className={`text-xs font-medium ${sc.billable ? 'text-[#d97706]' : 'text-[#9ca3af]'}`}>
                      {sc.billable ? 'Yes' : 'No'}
                    </span>
                  </Td>
                  <Td>
                    <Link href={`/service/${sc.id}`} onClick={e => e.stopPropagation()} className="text-xs text-[#5c5fef] hover:underline font-medium">
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
