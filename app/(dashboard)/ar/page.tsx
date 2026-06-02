'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { MOCK_INVOICES, MOCK_CUSTOMERS } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/billing'
import { Download, Send, ChevronDown, ChevronRight } from 'lucide-react'
import { useToastStore } from '@/lib/store'

const TODAY = new Date('2026-06-02')

function ageDays(dueDateStr: string | null): number {
  if (!dueDateStr) return 0
  const due = new Date(dueDateStr)
  return Math.floor((TODAY.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

function ageBucket(days: number): '0-30' | '31-60' | '61-90' | '90+' | 'current' {
  if (days <= 0) return 'current'
  if (days <= 30) return '0-30'
  if (days <= 60) return '31-60'
  if (days <= 90) return '61-90'
  return '90+'
}

const BUCKET_COLOR: Record<string, string> = {
  current: 'text-[#16a34a]',
  '0-30': 'text-[#d97706]',
  '31-60': 'text-[#ea580c]',
  '61-90': 'text-[#dc2626]',
  '90+': 'text-[#991b1b]',
}

const BUCKET_BORDER: Record<string, string> = {
  current: 'border-[#bbf7d0]',
  '0-30': 'border-[#fde68a]',
  '31-60': 'border-[#fed7aa]',
  '61-90': 'border-[#fecaca]',
  '90+': 'border-[#fecaca]',
}

const BUCKET_BG: Record<string, string> = {
  current: 'bg-[#f0fdf4]',
  '0-30': 'bg-[#fffbeb]',
  '31-60': 'bg-[#fff7ed]',
  '61-90': 'bg-[#fef2f2]',
  '90+': 'bg-[#fef2f2]',
}

export default function ARAgingPage() {
  const toast = useToastStore()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const openInvoices = MOCK_INVOICES.filter(i => i.status === 'sent' || i.status === 'overdue')

  const customerAging = MOCK_CUSTOMERS.map(cust => {
    const custInvoices = openInvoices.filter(i => i.customer_id === cust.id)
    if (!custInvoices.length) return null
    const byBucket = { current: 0, '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
    custInvoices.forEach(inv => {
      const days = ageDays(inv.due_date)
      byBucket[ageBucket(days)] += inv.total
    })
    return { customer: cust, invoices: custInvoices, total: custInvoices.reduce((s, i) => s + i.total, 0), ...byBucket }
  }).filter(Boolean) as NonNullable<ReturnType<typeof MOCK_CUSTOMERS.map>[0]>[]

  const bucketTotals = { current: 0, '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
  openInvoices.forEach(inv => { bucketTotals[ageBucket(ageDays(inv.due_date))] += inv.total })
  const grandTotal = Object.values(bucketTotals).reduce((s, v) => s + v, 0)

  const toggleExpand = (id: string) => setExpanded(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const sendStatements = () => {
    toast.success('Statements queued', `${customerAging.length} customer statements will be emailed`)
  }

  const exportCSV = () => {
    const rows = [
      ['Customer', 'Invoice #', 'Amount', 'Due Date', 'Days Overdue', 'Bucket'],
      ...openInvoices.map(i => [
        i.customer?.name || '', i.invoice_number, i.total.toString(),
        i.due_date || '', Math.max(0, ageDays(i.due_date)).toString(), ageBucket(ageDays(i.due_date)),
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'ar-aging.csv'; a.click()
  }

  return (
    <div>
      <PageHeader
        title="Accounts Receivable"
        subtitle="Aging report — all open invoices"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={exportCSV}><Download className="w-3.5 h-3.5" />Export</Button>
            <Button variant="ghost" size="sm" onClick={sendStatements}><Send className="w-3.5 h-3.5" />Send Statements</Button>
          </div>
        }
      />

      {/* Aging buckets summary */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {(['current', '0-30', '31-60', '61-90', '90+'] as const).map(bucket => {
          const amount = bucketTotals[bucket]
          const pct = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0
          return (
            <div key={bucket} className={`rounded-lg border p-4 shadow-[0_1px_2px_rgba(17,17,17,0.03)] ${amount > 0 ? `${BUCKET_BG[bucket]} ${BUCKET_BORDER[bucket]}` : 'bg-white border-[#e5e7eb]'}`}>
              <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">
                {bucket === 'current' ? 'Current' : `${bucket} days`}
              </div>
              <div className={`text-xl font-semibold tabular-nums ${amount > 0 ? BUCKET_COLOR[bucket] : 'text-[#9ca3af]'}`}>
                {formatCurrency(amount)}
              </div>
              <div className="text-[11px] text-[#9ca3af] mt-0.5 tabular-nums">{pct}% of AR</div>
            </div>
          )
        })}
      </div>

      {/* Total bar */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 mb-5 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#111827]">Total Open AR</span>
          <span className="text-xl font-semibold text-[#2563eb] tabular-nums">{formatCurrency(grandTotal)}</span>
        </div>
        <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden flex">
          {(['current', '0-30', '31-60', '61-90', '90+'] as const).map(bucket => {
            const pct = grandTotal > 0 ? (bucketTotals[bucket] / grandTotal) * 100 : 0
            const colors: Record<string, string> = {
              current: '#16a34a', '0-30': '#d97706', '31-60': '#ea580c', '61-90': '#dc2626', '90+': '#991b1b'
            }
            return pct > 0 ? (
              <div key={bucket} className="h-full transition-all" style={{ width: `${pct}%`, background: colors[bucket] }} />
            ) : null
          })}
        </div>
        <div className="flex items-center gap-4 mt-2">
          {(['current', '0-30', '31-60', '61-90', '90+'] as const).map(bucket => (
            <div key={bucket} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: { current: '#16a34a', '0-30': '#d97706', '31-60': '#ea580c', '61-90': '#dc2626', '90+': '#991b1b' }[bucket] }} />
              <span className="text-[11px] text-[#9ca3af]">{bucket === 'current' ? 'Current' : `${bucket}d`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer aging table */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
        <div className="px-4 py-3 border-b border-[#f3f4f6]">
          <span className="text-sm font-semibold text-[#111827]">Customer Aging Detail</span>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-[#e7e5e1]">
            <tr>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider w-8"></th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Customer</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Current</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">1-30 Days</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">31-60 Days</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">61-90 Days</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">90+ Days</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Total</th>
              <th className="px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider w-20"></th>
            </tr>
          </thead>
          <tbody>
            {customerAging.map((row: any) => {
              const isOpen = expanded.has(row.customer.id)
              return (
                <React.Fragment key={row.customer.id}>
                  <tr
                    className="h-10 border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors cursor-pointer"
                    onClick={() => toggleExpand(row.customer.id)}
                  >
                    <td className="px-4 py-2.5">
                      {isOpen
                        ? <ChevronDown className="w-3.5 h-3.5 text-[#9ca3af]" />
                        : <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
                      }
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-[#111827]">{row.customer.name}</div>
                      <div className="text-xs text-[#9ca3af]">{row.invoices.length} open invoice{row.invoices.length !== 1 ? 's' : ''}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-sm">{row.current > 0 ? formatCurrency(row.current) : <span className="text-[#d1d5db]">—</span>}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-sm">{row['0-30'] > 0 ? <span className="text-[#d97706] font-medium">{formatCurrency(row['0-30'])}</span> : <span className="text-[#d1d5db]">—</span>}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-sm">{row['31-60'] > 0 ? <span className="text-[#ea580c] font-medium">{formatCurrency(row['31-60'])}</span> : <span className="text-[#d1d5db]">—</span>}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-sm">{row['61-90'] > 0 ? <span className="text-[#dc2626] font-medium">{formatCurrency(row['61-90'])}</span> : <span className="text-[#d1d5db]">—</span>}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-sm">{row['90+'] > 0 ? <span className="text-[#991b1b] font-bold">{formatCurrency(row['90+'])}</span> : <span className="text-[#d1d5db]">—</span>}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[#111827]">{formatCurrency(row.total)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        className="text-[10px] text-[#6b7280] hover:text-[#2563eb] transition-colors uppercase tracking-wider px-2 py-1 border border-[#e5e7eb] rounded hover:border-[#2563eb44] font-medium"
                        onClick={e => { e.stopPropagation(); toast.info('Statement queued', `Statement sent to ${row.customer.email}`) }}
                      >
                        Stmt
                      </button>
                    </td>
                  </tr>
                  {isOpen && row.invoices.map((inv: any) => {
                    const days = ageDays(inv.due_date)
                    const bucket = ageBucket(days)
                    return (
                      <tr key={inv.id} className="border-b border-[#f9fafb] bg-[#f9fafb]">
                        <td className="px-4 py-2" />
                        <td className="px-4 py-2 pl-8">
                          <Link href={`/invoices/${inv.id}`} className="font-mono text-xs text-[#2563eb] hover:underline font-medium">{inv.invoice_number}</Link>
                          <div className="text-[11px] text-[#9ca3af]">{inv.billing_period_start} – {inv.billing_period_end}</div>
                        </td>
                        <td className="px-4 py-2 text-right text-xs text-[#6b7280]" colSpan={5}>
                          Due {inv.due_date || '—'}
                          {days > 0 && <span className={`ml-2 font-semibold ${BUCKET_COLOR[bucket]}`}>{days}d overdue</span>}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-sm tabular-nums">{formatCurrency(inv.total)}</td>
                        <td className="px-4 py-2" />
                      </tr>
                    )
                  })}
                </React.Fragment>
              )
            })}
            {/* Grand total row */}
            <tr className="bg-[#f9fafb] border-t border-[#e5e7eb]">
              <td colSpan={2} className="px-4 py-3 text-xs font-semibold text-[#374151] uppercase tracking-wider">Total AR</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatCurrency(bucketTotals.current)}</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#d97706]">{formatCurrency(bucketTotals['0-30'])}</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#ea580c]">{formatCurrency(bucketTotals['31-60'])}</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#dc2626]">{formatCurrency(bucketTotals['61-90'])}</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#991b1b]">{formatCurrency(bucketTotals['90+'])}</td>
              <td className="px-4 py-3 text-right font-bold text-base text-[#2563eb] tabular-nums">{formatCurrency(grandTotal)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
