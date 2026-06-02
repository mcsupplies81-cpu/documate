'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MOCK_SERVICE_CALLS, MOCK_USERS } from '@/lib/mock-data'

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'default'> = {
  open: 'danger', in_progress: 'warning', completed: 'success', closed: 'muted'
}
const priorityColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'default'> = {
  urgent: 'danger', high: 'warning', normal: 'default', low: 'muted'
}

export default function ServiceCallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const sc = MOCK_SERVICE_CALLS.find(s => s.id === id)
  const [status, setStatus] = useState<import('@/lib/types').ServiceCallStatus>(sc?.status || 'open')
  const [assignedTo, setAssignedTo] = useState(sc?.assigned_to || '')
  const [resolution, setResolution] = useState(sc?.resolution_notes || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!sc) return (
    <div className="text-[#555] py-20 text-center">
      Call not found. <Link href="/service" className="text-[#00d4ff]">Back to list</Link>
    </div>
  )

  const technicians = MOCK_USERS.filter(u => u.role === 'technician' || u.role === 'service_manager')

  const hoursOpen = sc.closed_at
    ? (new Date(sc.closed_at).getTime() - new Date(sc.opened_at).getTime()) / 3600000
    : (Date.now() - new Date(sc.opened_at).getTime()) / 3600000

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClose = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    setStatus('completed')
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/service" className="text-[#555] hover:text-[#888]"><ArrowLeft className="w-4 h-4" /></Link>
        <span className="text-[#333]">/</span>
        <Link href="/service" className="text-sm text-[#555]">Service</Link>
        <span className="text-[#333]">/</span>
        <span className="text-sm text-[#888]">{sc.call_number}</span>
      </div>

      <PageHeader
        title={sc.call_number}
        actions={
          <>
            {(status === 'open' || status === 'in_progress') && (
              <Button variant="secondary" size="sm" onClick={handleClose} loading={saving}
                className="bg-[#22c55e1a] text-[#22c55e] border border-[#22c55e33] hover:bg-[#22c55e33]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Complete
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 mt-1">
          <Badge variant={statusColors[status]}>{status.replace('_', ' ')}</Badge>
          <Badge variant={priorityColors[sc.priority]}>{sc.priority}</Badge>
          {sc.billable && <Badge variant="warning">Billable</Badge>}
          <span className="text-xs text-[#555] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {hoursOpen < 24
              ? `${Math.round(hoursOpen)}h open`
              : `${Math.floor(hoursOpen / 24)}d ${Math.round(hoursOpen % 24)}h open`
            }
          </span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Call Info */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-4 space-y-3">
          <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider">Call Details</h3>

          <div>
            <div className="text-xs text-[#444] mb-0.5">Customer</div>
            <Link href={`/customers/${sc.customer_id}`} className="text-sm text-[#00d4ff] hover:underline">
              {sc.customer?.name}
            </Link>
          </div>

          {sc.equipment && (
            <div>
              <div className="text-xs text-[#444] mb-0.5">Equipment</div>
              <Link href={`/equipment/${sc.equipment_id}`} className="text-sm text-[#00d4ff] hover:underline">
                {sc.equipment.make} {sc.equipment.model}
              </Link>
              <div className="text-xs text-[#555] font-mono mt-0.5">S/N: {sc.equipment.serial_number}</div>
            </div>
          )}

          <div>
            <div className="text-xs text-[#444] mb-0.5">Problem Description</div>
            <p className="text-sm text-[#888] leading-relaxed">{sc.problem_description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-[#444] mb-0.5">Opened</div>
              <div className="text-xs text-[#666] font-mono">{new Date(sc.opened_at).toLocaleString()}</div>
            </div>
            {sc.closed_at && (
              <div>
                <div className="text-xs text-[#444] mb-0.5">Closed</div>
                <div className="text-xs text-[#666] font-mono">{new Date(sc.closed_at).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Update Panel */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-4 space-y-4">
          <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider">Update Call</h3>

          <Select
            label="Status"
            value={status}
            onChange={e => setStatus(e.target.value as import('@/lib/types').ServiceCallStatus)}
            options={[
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'closed', label: 'Closed' },
            ]}
          />

          <Select
            label="Assigned Technician"
            value={assignedTo}
            onChange={e => setAssignedTo(e.target.value)}
            options={technicians.map(t => ({ value: t.id, label: `${t.name} (${t.role.replace('_', ' ')})` }))}
            placeholder="Unassigned"
          />

          <Textarea
            label="Resolution Notes"
            value={resolution}
            onChange={e => setResolution(e.target.value)}
            placeholder="Describe what was done to resolve the issue..."
            rows={4}
          />

          {(status === 'completed' || status === 'closed') && !resolution && (
            <div className="flex items-start gap-2 bg-[#f59e0b0d] border border-[#f59e0b33] rounded px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#f59e0b]">Add resolution notes before closing so there's a record of what was done.</p>
            </div>
          )}
        </div>
      </div>

      {sc.resolution_notes && (
        <div className="bg-[#111] border border-[#22c55e22] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
            <span className="text-sm font-medium text-[#22c55e]">Resolution</span>
          </div>
          <p className="text-sm text-[#888] leading-relaxed">{sc.resolution_notes}</p>
        </div>
      )}
    </div>
  )
}
