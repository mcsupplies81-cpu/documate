'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MOCK_SERVICE_CALLS, MOCK_USERS, MOCK_PART_USAGE } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { Package, Plus, Trash2 } from 'lucide-react'

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
  const partsUsed = MOCK_PART_USAGE.filter(u => u.service_call_id === id)
  const partsTotal = partsUsed.reduce((s, u) => s + u.total, 0)

  if (!sc) return (
    <div className="text-[#6b7280] py-20 text-center">
      Call not found. <Link href="/service" className="text-[#5c5fef]">Back to list</Link>
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
      <PageHeader
        title={sc.call_number}
        breadcrumb={[
          { label: 'Service', href: '/service' },
          { label: sc.call_number },
        ]}
        actions={
          <>
            {(status === 'open' || status === 'in_progress') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClose}
                loading={saving}
                className="text-[#16a34a] border-[#bbf7d0] hover:bg-[#f0fdf4]"
              >
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
          <span className="text-xs text-[#6b7280] flex items-center gap-1">
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
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Call Details</h3>

          <div>
            <div className="text-xs text-[#9ca3af] mb-0.5">Customer</div>
            <Link href={`/customers/${sc.customer_id}`} className="text-sm text-[#5c5fef] hover:underline font-medium">
              {sc.customer?.name}
            </Link>
          </div>

          {sc.equipment && (
            <div>
              <div className="text-xs text-[#9ca3af] mb-0.5">Equipment</div>
              <Link href={`/equipment/${sc.equipment_id}`} className="text-sm text-[#5c5fef] hover:underline font-medium">
                {sc.equipment.make} {sc.equipment.model}
              </Link>
              <div className="text-xs text-[#6b7280] font-mono mt-0.5">S/N: {sc.equipment.serial_number}</div>
            </div>
          )}

          <div>
            <div className="text-xs text-[#9ca3af] mb-0.5">Problem Description</div>
            <p className="text-sm text-[#374151] leading-relaxed">{sc.problem_description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-[#9ca3af] mb-0.5">Opened</div>
              <div className="text-xs text-[#6b7280] font-mono">{new Date(sc.opened_at).toLocaleString()}</div>
            </div>
            {sc.closed_at && (
              <div>
                <div className="text-xs text-[#9ca3af] mb-0.5">Closed</div>
                <div className="text-xs text-[#6b7280] font-mono">{new Date(sc.closed_at).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Update Panel */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Update Call</h3>

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
            <div className="flex items-start gap-2 bg-[#fffbeb] border border-[#fde68a] rounded px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#d97706] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#92400e]">Add resolution notes before closing so there&apos;s a record of what was done.</p>
            </div>
          )}
        </div>
      </div>

      {sc.resolution_notes && (
        <div className="bg-white border border-[#bbf7d0] rounded-lg p-4 mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
            <span className="text-sm font-semibold text-[#16a34a]">Resolution</span>
          </div>
          <p className="text-sm text-[#374151] leading-relaxed">{sc.resolution_notes}</p>
        </div>
      )}

      {/* Parts Used */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#9ca3af]" />
            <span className="text-sm font-semibold text-[#111827]">Parts Used</span>
            {partsTotal > 0 && <span className="text-xs font-semibold text-[#16a34a] ml-1">{formatCurrency(partsTotal)}</span>}
          </div>
          <button className="text-xs text-[#5c5fef] hover:underline font-medium flex items-center gap-1">
            <Plus className="w-3 h-3" />Add Part
          </button>
        </div>
        {partsUsed.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-[#9ca3af]">No parts used on this call</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <tr>
                {['Part #', 'Description', 'Qty', 'Unit Price', 'Total', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {partsUsed.map(u => (
                <tr key={u.id} className="h-10 hover:bg-[#f9fafb] transition-colors">
                  <td className="px-4 py-2.5">
                    <a href={`/parts/${u.part_id}`} className="font-mono text-xs text-[#5c5fef] hover:underline font-medium">
                      {u.part?.part_number || u.part_id}
                    </a>
                  </td>
                  <td className="px-4 py-2.5 text-[#374151]">{u.part?.description || '—'}</td>
                  <td className="px-4 py-2.5 tabular-nums">{u.quantity}</td>
                  <td className="px-4 py-2.5 tabular-nums text-xs">{formatCurrency(u.unit_price)}</td>
                  <td className="px-4 py-2.5 font-semibold text-[#16a34a] tabular-nums">{formatCurrency(u.total)}</td>
                  <td className="px-4 py-2.5">
                    <button className="text-[#d1d5db] hover:text-[#dc2626] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
