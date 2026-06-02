'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, Plus, Printer, FileText, Wrench, MapPin, Phone, Mail } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  MOCK_CUSTOMERS, MOCK_EQUIPMENT, MOCK_CONTRACTS, MOCK_SERVICE_CALLS, MOCK_INVOICES
} from '@/lib/mock-data'
import { formatCurrency, getDaysUntilExpiry } from '@/lib/billing'

function contractStatusBadge(status: string, endDate?: string | null) {
  if (status === 'expired') return <Badge variant="danger">Expired</Badge>
  if (status === 'expiring') return <Badge variant="warning">Expiring</Badge>
  if (status === 'cancelled') return <Badge variant="muted">Cancelled</Badge>
  if (endDate) {
    const days = getDaysUntilExpiry(endDate)
    if (days <= 30) return <Badge variant="danger">Active – {days}d left</Badge>
    if (days <= 60) return <Badge variant="warning">Active – {days}d left</Badge>
  }
  return <Badge variant="success">Active</Badge>
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [editOpen, setEditOpen] = useState(false)

  const customer = MOCK_CUSTOMERS.find(c => c.id === id)
  if (!customer) return (
    <div className="text-[#555] py-20 text-center">Customer not found. <Link href="/customers" className="text-[#00d4ff]">Back to list</Link></div>
  )

  const equipment = MOCK_EQUIPMENT.filter(e => e.customer_id === id)
  const contracts = MOCK_CONTRACTS.filter(c => c.customer_id === id)
  const serviceCalls = MOCK_SERVICE_CALLS.filter(c => c.customer_id === id).slice(0, 5)
  const invoices = MOCK_INVOICES.filter(i => i.customer_id === id).slice(0, 5)

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/customers" className="text-[#555] hover:text-[#888] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-[#333]">/</span>
        <span className="text-sm text-[#555]">Customers</span>
        <span className="text-[#333]">/</span>
        <span className="text-sm text-[#888]">{customer.name}</span>
      </div>

      <PageHeader
        title={customer.name}
        actions={
          <>
            <Link href={`/service/new?customer=${id}`}>
              <Button variant="secondary" size="sm">
                <Wrench className="w-3.5 h-3.5" />
                New Service Call
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-4 mt-2">
          {customer.email && (
            <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#888]">
              <Mail className="w-3 h-3" />{customer.email}
            </a>
          )}
          {customer.phone && (
            <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#888]">
              <Phone className="w-3 h-3" />{customer.phone}
            </a>
          )}
          {customer.billing_address && (
            <span className="flex items-center gap-1.5 text-xs text-[#555]">
              <MapPin className="w-3 h-3" />
              {customer.billing_address.street}, {customer.billing_address.city}, {customer.billing_address.state} {customer.billing_address.zip}
            </span>
          )}
        </div>
        {customer.notes && (
          <div className="mt-2 text-xs text-[#555] bg-[#111] border border-[#1a1a1a] rounded px-3 py-2 max-w-xl">
            {customer.notes}
          </div>
        )}
      </PageHeader>

      {/* Summary tiles */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Equipment', value: equipment.length, icon: Printer, href: `/equipment?customer=${id}` },
          { label: 'Contracts', value: contracts.length, icon: FileText, href: `/contracts?customer=${id}` },
          { label: 'Open Calls', value: serviceCalls.filter(s => s.status === 'open' || s.status === 'in_progress').length, icon: Wrench, href: `/service?customer=${id}` },
          { label: 'Outstanding', value: formatCurrency(invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.total, 0)), icon: FileText, href: `/invoices?customer=${id}` },
        ].map(tile => (
          <Link key={tile.label} href={tile.href} className="bg-[#111] border border-[#1e1e1e] rounded-lg p-3 hover:border-[#2a2a2a] transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <tile.icon className="w-3.5 h-3.5 text-[#444]" />
              <span className="text-xs text-[#555] uppercase tracking-wide">{tile.label}</span>
            </div>
            <div className="text-xl font-mono font-semibold text-[#e8e8e8]">{tile.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Equipment */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
            <span className="text-sm font-medium">Equipment</span>
            <Link href={`/equipment/new?customer=${id}`}>
              <Button variant="ghost" size="sm"><Plus className="w-3 h-3" />Add</Button>
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {equipment.length === 0 && <div className="px-4 py-8 text-sm text-[#444] text-center">No equipment assigned</div>}
            {equipment.map(eq => (
              <Link key={eq.id} href={`/equipment/${eq.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#141414] transition-colors">
                <div>
                  <div className="text-sm text-[#e8e8e8]">{eq.make} {eq.model}</div>
                  <div className="text-xs text-[#555] font-mono">S/N: {eq.serial_number}</div>
                </div>
                <Badge variant={eq.status === 'active' ? 'success' : eq.status === 'inactive' ? 'warning' : 'muted'}>
                  {eq.status}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Contracts */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
            <span className="text-sm font-medium">Contracts</span>
            <Link href={`/contracts/new?customer=${id}`}>
              <Button variant="ghost" size="sm"><Plus className="w-3 h-3" />Add</Button>
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {contracts.length === 0 && <div className="px-4 py-8 text-sm text-[#444] text-center">No contracts</div>}
            {contracts.map(con => (
              <Link key={con.id} href={`/contracts/${con.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#141414] transition-colors">
                <div>
                  <div className="text-sm text-[#e8e8e8] font-mono">{con.contract_number}</div>
                  <div className="text-xs text-[#555]">{formatCurrency(con.base_rate)}/mo · {con.contract_type.replace('_', ' ')}</div>
                </div>
                {contractStatusBadge(con.status, con.end_date)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Service Calls */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
          <span className="text-sm font-medium">Recent Service Calls</span>
          <Link href={`/service?customer=${id}`} className="text-xs text-[#00d4ff] hover:underline">View all →</Link>
        </div>
        <Table>
          <Thead>
            <tr>
              <Th>Call #</Th>
              <Th>Equipment</Th>
              <Th>Problem</Th>
              <Th>Tech</Th>
              <Th>Status</Th>
            </tr>
          </Thead>
          <Tbody>
            {serviceCalls.length === 0 && <EmptyRow cols={5} message="No service history" />}
            {serviceCalls.map(call => (
              <Tr key={call.id} onClick={() => window.location.href = `/service/${call.id}`}>
                <Td><span className="font-mono text-xs text-[#00d4ff]">{call.call_number}</span></Td>
                <Td><span className="text-xs">{call.equipment?.model || '—'}</span></Td>
                <Td><span className="text-xs text-[#888] truncate block max-w-[200px]">{call.problem_description}</span></Td>
                <Td><span className="text-xs">{call.technician?.name || <span className="text-[#444]">Unassigned</span>}</span></Td>
                <Td>
                  <Badge variant={
                    call.status === 'open' ? 'danger' : call.status === 'in_progress' ? 'warning' :
                    call.status === 'completed' ? 'success' : 'muted'
                  }>{call.status.replace('_', ' ')}</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${customer.name}`} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" defaultValue={customer.name} className="col-span-2" />
          <Input label="Email" type="email" defaultValue={customer.email || ''} />
          <Input label="Phone" defaultValue={customer.phone || ''} />
          <Input label="Street" defaultValue={customer.billing_address?.street || ''} className="col-span-2" />
          <Input label="City" defaultValue={customer.billing_address?.city || ''} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="State" defaultValue={customer.billing_address?.state || ''} />
            <Input label="ZIP" defaultValue={customer.billing_address?.zip || ''} />
          </div>
          <Textarea label="Notes" defaultValue={customer.notes || ''} rows={3} className="col-span-2" />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => setEditOpen(false)}>Save Changes</Button>
        </div>
      </Modal>
    </div>
  )
}
