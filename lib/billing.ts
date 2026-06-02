import { Contract, ContractEquipment, MeterReading, BillingPreviewItem, Customer } from './types'

export function calculateBilling(
  contract: Contract & { contract_equipment?: ContractEquipment[] },
  customer: Customer,
  currentReadings: Record<string, MeterReading>,
  periodStart: string,
  periodEnd: string
): BillingPreviewItem {
  const items = (contract.contract_equipment || []).map(ce => {
    const reading = currentReadings[ce.equipment_id]
    const current_bw = reading?.bw_reading ?? ce.last_billed_bw
    const current_color = reading?.color_reading ?? ce.last_billed_color

    const bw_used = Math.max(0, current_bw - ce.last_billed_bw)
    const color_used = Math.max(0, current_color - ce.last_billed_color)

    const bw_overage = Math.max(0, bw_used - ce.included_bw)
    const color_overage = Math.max(0, color_used - ce.included_color)

    const bw_overage_charge = bw_overage * ce.bw_overage_rate
    const color_overage_charge = color_overage * ce.color_overage_rate

    return {
      equipment: ce.equipment!,
      contract_equipment: ce,
      current_bw,
      current_color,
      bw_used,
      color_used,
      bw_overage,
      color_overage,
      bw_overage_charge,
      color_overage_charge,
    }
  })

  const base_charge = contract.contract_type === 'flat_rate' || contract.contract_type === 'cpc' || contract.contract_type === 'block'
    ? contract.base_rate
    : 0

  const total_overage = items.reduce(
    (sum, item) => sum + item.bw_overage_charge + item.color_overage_charge, 0
  )

  return {
    contract,
    customer,
    equipment_items: items,
    base_charge,
    total_overage,
    total: base_charge + total_overage,
    period_start: periodStart,
    period_end: periodEnd,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function getCurrentPeriod(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export function getDaysUntilExpiry(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
