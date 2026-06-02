'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Clock, X, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { FilterTabs } from '@/components/ui/filter-tabs'
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

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-[#dc2626]',
  high: 'bg-[#d97706]',
  normal: 'bg-[#2563eb]',
  low: 'bg-[#d1d5db]',
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

  const statusCounts = {
    all: MOCK_SERVICE_CALLS.length,
    open: MOCK_SERVICE_CALLS.filter(s => s.status === 'open').length,
    in_progress: MOCK_SERVICE_CALLS.filter(s => s.status === 'in_progress').length,
    completed: MOCK_SERVICE_CALLS.filter(s => s.status === 'completed').length,
    closed: MOCK_SERVICE_CALLS.filter(s => s.status === 'closed').length,
  }

  const priorityCounts = {
    all: MOCK_SERVICE_CALLS.length,
    urgent: MOCK_SERVICE_CALLS.filter(s => s.priority === 'urgent').length,
    high: MOCK_SERVICE_CALLS.filter(s => s.priority === 'high').length,
    normal: MOCK_SERVICE_CALLS.filter(s => s.priority === 'normal').length,
    low: MOCK_SERVICE_CALLS.filter(s => s.priority === 'low').length,
  }

  return (
    <div>
      <PageHeader
        title="Service Calls"
        subtitle={`${statusCounts.open} open · ${statusCounts.in_progress} in progress`}
        actions={
          <Link href="/service/new">
            <Button variant="primary" size="sm"><Plus className="w-3.5 h-3.5" />New Service Call</Button>
          </Link>
        }
      />

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search calls..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 h-9 text-sm bg-white border border-[#e5e7eb] rounded-lg text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <FilterTabs
          options={[
            { key: 'all' as StatusFilter, label: 'All', count: statusCounts.all },
            { key: 'open' as StatusFilter, label: 'Open', count: statusCounts.open },
            { key: 'in_progress' as StatusFilter, label: 'In Progress', count: statusCounts.in_progress },
            { key: 'completed' as StatusFilter, label: 'Completed', count: statusCounts.completed },
            { key: 'closed' as StatusFilter, label: 'Closed', count: statusCounts.closed },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        <FilterTabs
          options={[
            { key: 'all' as PriorityFilter, label: 'All Priority' },
            { key: 'urgent' as PriorityFilter, label: 'Urgent', count: priorityCounts.urgent },
            { key: 'high' as PriorityFilter, label: 'High', count: priorityCounts.high },
            { key: 'normal' as PriorityFilter, label: 'Normal', count: priorityCounts.normal },
            { key: 'low' as PriorityFilter, label: 'Low', count: priorityCounts.low },
          ]}
          value={priorityFilter}
          onChange={setPriorityFilter}
        />
      </div>

      <div className="bg-white border border-[#e7e5e1] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
        <Table>
          <Thead>
            <tr>
              <Th></Th>
              <Th>Call #</Th>
              <Th>Customer</Th>
              <Th>Equipment</Th>
              <Th>Problem</Th>
              <Th>Tech</Th>
              <Th>Age</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <EmptyRow cols={9} message="No service calls match your filters" icon={Wrench} />}
            {filtered.map(sc => {
              const age = getAge(sc.opened_at)
              const isOpen = sc.status === 'open' || sc.status === 'in_progress'
              return (
                <Tr key={sc.id} onClick={() => window.location.href = `/service/${sc.id}`}>
                  <Td className="w-1 pr-0 pl-5">
                    <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_COLORS[sc.priority] || 'bg-[#d1d5db]'}`} />
                  </Td>
                  <Td><span className="font-mono text-xs text-[#2563eb] font-semibold">{sc.call_number}</span></Td>
                  <Td>
                    <Link href={`/customers/${sc.customer_id}`} onClick={e => e.stopPropagation()} className="text-[#111827] font-medium hover:text-[#2563eb] transition-colors">
                      {sc.customer?.name}
                    </Link>
                  </Td>
                  <Td><span className="text-xs text-[#6b7280]">{sc.equipment?.make} {sc.equipment?.model}</span></Td>
                  <Td>
                    <span className="text-xs text-[#6b7280] block truncate max-w-[200px]" title={sc.problem_description || ''}>
                      {sc.problem_description}
                    </span>
                  </Td>
                  <Td>
                    <span className={`text-xs font-medium ${sc.assigned_to ? 'text-[#374151]' : 'text-[#dc2626]'}`}>
                      {sc.technician?.name || 'Unassigned'}
                    </span>
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
                    <Link href={`/service/${sc.id}`} onClick={e => e.stopPropagation()} className="text-xs text-[#2563eb] hover:underline font-medium">
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
