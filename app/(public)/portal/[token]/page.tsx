'use client'
import { useState } from 'react'
import { Zap, FileText, Printer, Wrench, Download, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { MOCK_CUSTOMERS, MOCK_INVOICES, MOCK_EQUIPMENT, MOCK_SERVICE_CALLS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'

const PORTAL_DATA = {
  customer: MOCK_CUSTOMERS[0],
  dealer: { name: 'Pacific Office Solutions', phone: '(415) 555-9000', email: 'service@pacificoffice.com' },
}

type Tab = 'invoices' | 'equipment' | 'service'

export default function CustomerPortalPage({ params }: { params: { token: string } }) {
  const [tab, setTab] = useState<Tab>('invoices')
  const { customer, dealer } = PORTAL_DATA

  const invoices = MOCK_INVOICES.filter(i => i.customer_id === customer.id)
  const equipment = MOCK_EQUIPMENT.filter(e => e.customer_id === customer.id)
  const serviceCalls = MOCK_SERVICE_CALLS.filter(sc => sc.customer_id === customer.id)
    .sort((a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime())

  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue')
  const outstandingTotal = outstanding.reduce((s, i) => s + i.total, 0)

  return (
    <div className="min-h-screen bg-[#f6f5f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#2563eb] rounded-md flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#111827] tracking-tight">{dealer.name}</div>
              <div className="text-[10px] text-[#9ca3af]">Customer Portal</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-[#111827]">{customer.name}</div>
            <div className="text-[10px] text-[#9ca3af]">{customer.email}</div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Outstanding alert */}
        {outstandingTotal > 0 && (
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#d97706]" />
              <span className="text-sm text-[#92400e]">{outstanding.length} outstanding invoice{outstanding.length !== 1 ? 's' : ''} — {formatCurrency(outstandingTotal)} due</span>
            </div>
            <button className="text-xs font-medium text-white bg-[#d97706] px-3 py-1.5 rounded-md hover:bg-[#b45309] transition-colors">
              Pay Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Equipment', value: equipment.length, icon: <Printer className="w-4 h-4" /> },
            { label: 'Open Service Calls', value: serviceCalls.filter(sc => sc.status !== 'closed' && sc.status !== 'completed').length, icon: <Wrench className="w-4 h-4" /> },
            { label: 'Outstanding', value: formatCurrency(outstandingTotal), icon: <FileText className="w-4 h-4" /> },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#e5e7eb] rounded-lg p-4 flex items-center gap-3 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
              <div className="text-[#9ca3af]">{s.icon}</div>
              <div>
                <div className="text-xs text-[#6b7280]">{s.label}</div>
                <div className="text-lg font-mono font-bold text-[#111827]">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 p-0.5 bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg mb-5 w-fit">
          {([
            { key: 'invoices', label: 'Invoices', icon: <FileText className="w-3.5 h-3.5" /> },
            { key: 'equipment', label: 'Equipment', icon: <Printer className="w-3.5 h-3.5" /> },
            { key: 'service', label: 'Service History', icon: <Wrench className="w-3.5 h-3.5" /> },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 h-8 rounded-md text-sm transition-colors ${tab === t.key ? 'bg-white text-[#111827] font-medium shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'}`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Invoices tab */}
        {tab === 'invoices' && (
          <div className="space-y-2">
            {invoices.length === 0 && <p className="text-sm text-[#9ca3af] py-8 text-center">No invoices yet</p>}
            {invoices.map(inv => {
              const overdue = inv.status === 'overdue'
              const paid = inv.status === 'paid'
              return (
                <div key={inv.id} className={`bg-white border rounded-lg p-4 flex items-center justify-between shadow-[0_1px_2px_rgba(17,17,17,0.03)] ${overdue ? 'border-[#fecaca]' : 'border-[#e5e7eb]'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-[#2563eb] font-medium">{inv.invoice_number}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                        paid ? 'bg-[#f0fdf4] text-[#16a34a]' :
                        overdue ? 'bg-[#fef2f2] text-[#dc2626]' :
                        'bg-[#fffbeb] text-[#d97706]'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#6b7280]">
                      Period: {inv.billing_period_start} – {inv.billing_period_end}
                      {inv.due_date && ` · Due ${inv.due_date}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono font-semibold text-[#111827]">{formatCurrency(inv.total)}</div>
                      {paid && inv.paid_at && (
                        <div className="text-[11px] text-[#16a34a] flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3" />Paid {new Date(inv.paid_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-[#6b7280] hover:text-[#374151] transition-colors flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />PDF
                      </button>
                      {!paid && (
                        <button className="text-xs font-medium text-white bg-[#2563eb] px-3 py-1.5 rounded hover:bg-[#1d4ed8] transition-colors">
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Equipment tab */}
        {tab === 'equipment' && (
          <div className="space-y-2">
            {equipment.map(eq => (
              <div key={eq.id} className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-[#111827]">{eq.make} {eq.model}</div>
                    <div className="text-xs text-[#6b7280] mt-0.5">S/N {eq.serial_number}</div>
                    {eq.notes && <div className="text-xs text-[#9ca3af] mt-1">{eq.notes}</div>}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${eq.status === 'active' ? 'bg-[#f0fdf4] text-[#16a34a]' : 'bg-[#fef2f2] text-[#dc2626]'}`}>
                      {eq.status}
                    </span>
                    {eq.install_date && (
                      <div className="text-[11px] text-[#9ca3af] mt-1">Installed {eq.install_date}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service history tab */}
        {tab === 'service' && (
          <div className="space-y-2">
            {serviceCalls.length === 0 && <p className="text-sm text-[#9ca3af] py-8 text-center">No service history</p>}
            {serviceCalls.map(sc => {
              const open = sc.status === 'open' || sc.status === 'in_progress'
              return (
                <div key={sc.id} className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-[#2563eb] font-medium">{sc.call_number}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${open ? 'bg-[#eff6ff] text-[#2563eb]' : 'bg-[#f0fdf4] text-[#16a34a]'}`}>
                        {sc.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#9ca3af]">
                      <Clock className="w-3 h-3" />
                      {new Date(sc.opened_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-[#374151]">{sc.problem_description}</p>
                  {sc.resolution_notes && (
                    <div className="mt-2 pt-2 border-t border-[#f3f4f6]">
                      <p className="text-xs text-[#6b7280]"><span className="text-[#9ca3af]">Resolution: </span>{sc.resolution_notes}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-[#e5e7eb] text-center">
          <p className="text-xs text-[#9ca3af]">Questions? Contact {dealer.name} at {dealer.phone} · {dealer.email}</p>
        </div>
      </main>
    </div>
  )
}
