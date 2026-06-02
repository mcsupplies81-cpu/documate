'use client'
import Link from 'next/link'
import { AlertTriangle, Bell, Clock, Receipt, Gauge, X } from 'lucide-react'
import { useState } from 'react'
import { MOCK_CONTRACTS, MOCK_INVOICES, MOCK_EQUIPMENT, MOCK_METER_READINGS } from '@/lib/mock-data'
import { getDaysUntilExpiry, formatCurrency } from '@/lib/billing'

type AlertSeverity = 'critical' | 'warning' | 'info'

interface Alert {
  id: string
  severity: AlertSeverity
  icon: React.ReactNode
  title: string
  description: string
  href?: string
  action?: string
}

function buildAlerts(): Alert[] {
  const alerts: Alert[] = []
  const today = new Date('2026-06-02')

  // Expiring contracts
  MOCK_CONTRACTS.forEach(c => {
    if (!c.end_date || c.status === 'expired' || c.status === 'cancelled') return
    const days = getDaysUntilExpiry(c.end_date)
    if (days <= 14) {
      alerts.push({
        id: `contract-expiry-${c.id}`,
        severity: 'critical',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        title: `${c.customer?.name}`,
        description: `Contract expiring ${days === 0 ? 'today' : `in ${days} day${days !== 1 ? 's' : ''}`}`,
        href: `/contracts/${c.id}`,
        action: 'Renew',
      })
    } else if (days <= 45) {
      alerts.push({
        id: `contract-warn-${c.id}`,
        severity: 'warning',
        icon: <Clock className="w-3.5 h-3.5" />,
        title: `${c.customer?.name}`,
        description: `Contract expiring in ${days} days`,
        href: `/contracts/${c.id}`,
      })
    }
  })

  // Overdue invoices
  MOCK_INVOICES.filter(i => i.status === 'overdue').forEach(inv => {
    alerts.push({
      id: `overdue-${inv.id}`,
      severity: 'critical',
      icon: <Receipt className="w-3.5 h-3.5" />,
      title: `Overdue — ${inv.customer?.name}`,
      description: `${inv.invoice_number} · ${formatCurrency(inv.total)} past due`,
      href: `/invoices/${inv.id}`,
      action: 'View',
    })
  })

  // Missing meters (equipment with no reading in last 45 days)
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - 45)
  const activeEquipment = MOCK_EQUIPMENT.filter(e => e.status === 'active')
  activeEquipment.forEach(eq => {
    const readings = MOCK_METER_READINGS.filter(r => r.equipment_id === eq.id)
    const latestDate = readings.length
      ? new Date(Math.max(...readings.map(r => new Date(r.reading_date).getTime())))
      : null
    if (!latestDate || latestDate < cutoff) {
      alerts.push({
        id: `missing-meter-${eq.id}`,
        severity: 'info',
        icon: <Gauge className="w-3.5 h-3.5" />,
        title: `Missing meter — ${eq.make} ${eq.model}`,
        description: `${eq.customer?.name}`,
        href: '/meters',
      })
    }
  })

  // Sort: critical first, then warning, then info
  const order: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 }
  return alerts.sort((a, b) => order[a.severity] - order[b.severity])
}

const SEVERITY_STYLES: Record<AlertSeverity, { icon: string; bg: string; border: string }> = {
  critical: { icon: 'text-[#dc2626]', bg: 'bg-[#fff7f7]', border: 'border-[#fee2e2]' },
  warning:  { icon: 'text-[#d97706]', bg: 'bg-[#fffaf0]', border: 'border-[#fed7aa]' },
  info:     { icon: 'text-[#2563eb]', bg: 'bg-[#f8fbff]', border: 'border-[#dbeafe]' },
}

export function AlertsPanel() {
  const allAlerts = buildAlerts()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const alerts = allAlerts.filter(a => !dismissed.has(a.id))

  if (alerts.length === 0) return null

  return (
    <div id="alerts" className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden mb-4">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#64748b]" />
          <span className="text-sm font-semibold text-[#111827]">Alerts</span>
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#fee2e2] text-xs font-semibold text-[#dc2626]">
            {alerts.length}
          </span>
        </div>
        <Link href="#alerts" className="text-xs text-[#2563eb] hover:underline font-medium">
          View all alerts →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-4 pb-4">
        {alerts.slice(0, 4).map(alert => {
          const styles = SEVERITY_STYLES[alert.severity]
          const Inner = (
            <div className={`relative h-full rounded-xl border px-4 py-3 transition-colors hover:bg-white ${styles.bg} ${styles.border} group`}>
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 ${styles.icon}`}>{alert.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#111827] truncate">{alert.title}</div>
                  <div className="text-[11px] text-[#475569] truncate mt-1">{alert.description}</div>
                </div>
              </div>
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); setDismissed(prev => new Set([...prev, alert.id])) }}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-[#cbd5e1] hover:text-[#64748b] transition-all"
                aria-label="Dismiss alert"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )

          return alert.href ? (
            <Link key={alert.id} href={alert.href}>{Inner}</Link>
          ) : (
            <div key={alert.id}>{Inner}</div>
          )
        })}
      </div>
    </div>
  )
}
