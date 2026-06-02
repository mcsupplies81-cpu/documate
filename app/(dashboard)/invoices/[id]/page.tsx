'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, Send, CheckCircle2, Clock } from 'lucide-react'
import { MOCK_INVOICES, MOCK_CUSTOMERS, MOCK_TENANT } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { useToastStore } from '@/lib/store'

const LINE_TYPE_LABELS: Record<string, string> = {
  base: 'Base Service',
  bw_overage: 'B&W Overage',
  color_overage: 'Color Overage',
  service: 'Service Call',
  misc: 'Miscellaneous',
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const toast = useToastStore()
  const [marking, setMarking] = useState(false)

  const invoice = MOCK_INVOICES.find(i => i.id === id)
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-[#6b7280] text-sm">Invoice not found</div>
        <Link href="/invoices" className="text-xs text-[#5c5fef] hover:underline">Back to invoices</Link>
      </div>
    )
  }

  const customer = MOCK_CUSTOMERS.find(c => c.id === invoice.customer_id)
  const dealer = MOCK_TENANT

  const handlePrint = () => window.print()

  const handleMarkPaid = async () => {
    setMarking(true)
    await new Promise(r => setTimeout(r, 800))
    setMarking(false)
    toast.success('Invoice marked as paid', `${invoice.invoice_number} — ${formatCurrency(invoice.total)}`)
  }

  const handleSendEmail = async () => {
    toast.info('Email queued', `Invoice will be sent to ${customer?.email}`)
  }

  const lineItems = invoice.line_items || [
    { id: 'gen-base', invoice_id: invoice.id, description: `Base Service — ${invoice.billing_period_start} to ${invoice.billing_period_end}`, quantity: 1, unit_price: invoice.subtotal, total: invoice.subtotal, line_type: 'base' as const },
  ]

  return (
    <div>
      {/* Screen-only header */}
      <div className="print:hidden">
        <PageHeader
          title={invoice.invoice_number}
          breadcrumb={[{ label: 'Invoices', href: '/invoices' }, { label: invoice.invoice_number }]}
          actions={
            <div className="flex items-center gap-2">
              {invoice.status !== 'paid' && (
                <Button variant="ghost" size="sm" onClick={handleSendEmail}>
                  <Send className="w-3.5 h-3.5" />Email Invoice
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5" />Print / PDF
              </Button>
              {invoice.status !== 'paid' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkPaid}
                  disabled={marking}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {marking ? 'Saving...' : 'Mark Paid'}
                </Button>
              )}
            </div>
          }
        >
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={
              invoice.status === 'paid' ? 'success' :
              invoice.status === 'overdue' ? 'danger' :
              invoice.status === 'sent' ? 'info' : 'muted'
            }>{invoice.status}</Badge>
            <span className="text-xs text-[#9ca3af]">{customer?.name} · {invoice.billing_period_start} – {invoice.billing_period_end}</span>
          </div>
        </PageHeader>
      </div>

      {/* Invoice Document — visible on screen and print */}
      <div className="bg-white print:bg-white border border-[#e5e7eb] print:border-0 rounded-xl overflow-hidden print:shadow-none max-w-3xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {/* Invoice Header */}
        <div className="px-8 py-8 border-b border-[#e5e7eb]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-bold text-[#5c5fef] tracking-tight mb-1">{dealer.name}</div>
              <div className="text-xs text-[#6b7280] space-y-0.5">
                <div>service@pacificoffice.com</div>
                <div>(415) 555-9000</div>
                <div>San Francisco, CA</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-[#111827]">INVOICE</div>
              <div className="text-sm font-mono text-[#5c5fef] mt-1">{invoice.invoice_number}</div>
              <div className="text-xs text-[#6b7280] mt-2">
                <div>Issued: {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : '—'}</div>
                <div className={`font-medium ${invoice.status === 'overdue' ? 'text-[#dc2626]' : 'text-[#374151]'}`}>
                  Due: {invoice.due_date || '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To + Period */}
        <div className="px-8 py-6 grid grid-cols-2 gap-8 border-b border-[#e5e7eb]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#9ca3af] mb-2">Bill To</div>
            <div className="text-sm font-semibold text-[#111827]">{customer?.name}</div>
            {customer?.billing_address && (
              <div className="text-xs text-[#6b7280] mt-1 space-y-0.5">
                <div>{customer.billing_address.street}</div>
                <div>{customer.billing_address.city}, {customer.billing_address.state} {customer.billing_address.zip}</div>
              </div>
            )}
            {customer?.email && <div className="text-xs text-[#6b7280] mt-1">{customer.email}</div>}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#9ca3af] mb-2">Billing Period</div>
            <div className="text-sm text-[#111827] font-mono">
              {invoice.billing_period_start}
            </div>
            <div className="text-xs text-[#6b7280]">through</div>
            <div className="text-sm text-[#111827] font-mono">
              {invoice.billing_period_end}
            </div>
            {invoice.status === 'paid' && invoice.paid_at && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#16a34a]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Paid {new Date(invoice.paid_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Line items */}
        <div className="px-8 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                <th className="py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Description</th>
                <th className="py-2.5 text-right text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider w-20">Qty</th>
                <th className="py-2.5 text-right text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider w-24">Rate</th>
                <th className="py-2.5 text-right text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider w-24">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {lineItems.map(item => (
                <tr key={item.id}>
                  <td className="py-3">
                    <div className="text-[#111827]">{item.description}</div>
                    <div className="text-[10px] text-[#9ca3af] mt-0.5 uppercase tracking-wide">
                      {LINE_TYPE_LABELS[item.line_type] || item.line_type}
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono text-xs text-[#6b7280]">
                    {item.quantity > 1 ? item.quantity.toLocaleString() : '1'}
                  </td>
                  <td className="py-3 text-right font-mono text-xs text-[#6b7280]">
                    {item.quantity > 1 ? `$${item.unit_price.toFixed(4)}` : '—'}
                  </td>
                  <td className="py-3 text-right font-mono text-sm text-[#111827] font-medium">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-8 py-5 border-t border-[#e5e7eb]">
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-12 text-sm">
              <span className="text-[#6b7280]">Subtotal</span>
              <span className="font-mono text-[#374151] w-24 text-right">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex items-center gap-12 text-sm">
                <span className="text-[#6b7280]">Tax</span>
                <span className="font-mono text-[#374151] w-24 text-right">{formatCurrency(invoice.tax)}</span>
              </div>
            )}
            <div className="flex items-center gap-12 text-base font-semibold pt-2 border-t border-[#e5e7eb] mt-1 w-48">
              <span className="text-[#111827]">Total Due</span>
              <span className="font-mono text-[#5c5fef] w-24 text-right text-lg">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes + Footer */}
        <div className="px-8 py-5 border-t border-[#e5e7eb] bg-[#f9fafb]">
          {invoice.notes && (
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-[#9ca3af] mb-1">Notes</div>
              <p className="text-xs text-[#6b7280]">{invoice.notes}</p>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-[#9ca3af]">
            <div>Payment terms: Net 30 days · Make checks payable to {dealer.name}</div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Generated by DealerOS
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
