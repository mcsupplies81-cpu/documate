'use client'
import Link from 'next/link'
import { AlertTriangle, Clock, Receipt, Gauge, X } from 'lucide-react'
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
        title: `${c.customer?.name} contract expiring`,
        description: `${c.contract_number} · ${days === 0 ? 'Today' : `${days} day${days !== 1 ? 's' : ''}`}`,
        href: `/contracts/${c.id}`,
        action: 'Renew',
      })
    } else if (days <= 45) {
      alerts.push({
        id: `contract-warn-${c.id}`,
        severity: 'warning',
        icon: <Clock className="w-3.5 h-3.5" />,
        title: `${c.customer?.name} contract in ${days}d`,
        description: `${c.contract_number} · Auto-renew ${c.auto_renew ? 'on' : 'off'}`,
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
        description: `${eq.customer?.name} · ${latestDate ? `Last: ${latestDate.toLocaleDateString()}` : 'Never read'}`,
        href: '/meters',
      })
    }
  })

  // Sort: critical first, then warning, then info
  const order: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 }
  return alerts.sort((a, b) => order[a.severity] - order[b.severity])
}

const SEVERITY_STYLES: Record<AlertSeverity, { dot: string; icon: string; label: string }> = {
  critical: { dot: 'bg-[#dc2626]', icon: 'text-[#dc2626]', label: 'text-[#dc2626]' },
  warning:  { dot: 'bg-[#d97706]', icon: 'text-[#d97706]', label: 'text-[#d97706]' },
  info:     { dot: 'bg-[#9ca3af]', icon: 'text-[#6b7280]',  label: 'text-[#6b7280]' },
}

export function AlertsPanel() {
  const allAlerts = buildAlerts()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const alerts = allAlerts.filter(a => !dismissed.has(a.id))

  const criticalCount = alerts.filter(a => a.severity === 'critical').length

  if (alerts.length === 0) return null

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden mb-5">
      <div className="px-4 py-2.5 border-b border-[#f3f4f6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#111827]">Alerts</span>
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#dc2626]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
              {criticalCount} critical
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#9ca3af]">{alerts.length} total</span>
      </div>
      <div className="divide-y divide-[#f9fafb]">
        {alerts.slice(0, 8).map(alert => {
          const styles = SEVERITY_STYLES[alert.severity]
          const Inner = (
            <div className={`flex items-start gap-3 px-4 py-2.5 hover:bg-[#f9fafb] transition-colors group ${alert.href ? 'cursor-pointer' : ''}`}>
              <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>{alert.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#111827] truncate">{alert.title}</div>
                <div className="text-[11px] text-[#9ca3af] truncate mt-0.5">{alert.description}</div>
              </div>
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); setDismissed(prev => new Set([...prev, alert.id])) }}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-[#d1d5db] hover:text-[#6b7280] transition-all"
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
