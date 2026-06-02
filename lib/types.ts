export type Role = 'admin' | 'service_manager' | 'technician' | 'billing'
export type ContractType = 'cpc' | 'flat_rate' | 'block' | 'equipment_only'
export type ContractStatus = 'active' | 'expiring' | 'expired' | 'cancelled'
export type BillingCycle = 'monthly' | 'quarterly' | 'annual'
export type EquipmentStatus = 'active' | 'inactive' | 'removed'
export type MeterSource = 'manual' | 'customer' | 'dca'
export type ServiceCallStatus = 'open' | 'in_progress' | 'completed' | 'closed'
export type ServiceCallPriority = 'low' | 'normal' | 'high' | 'urgent'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
export type LineType = 'base' | 'bw_overage' | 'color_overage' | 'service' | 'parts' | 'other'

export interface Tenant {
  id: string
  name: string
  subdomain: string | null
  created_at: string
}

export interface User {
  id: string
  tenant_id: string
  email: string
  name: string
  role: Role
  created_at: string
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country?: string
}

export interface Customer {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  billing_address: Address | null
  notes: string | null
  created_at: string
  // Computed/joined
  equipment_count?: number
  active_contracts?: number
}

export interface Location {
  id: string
  customer_id: string
  tenant_id: string
  name: string
  address: Address | null
}

export interface Equipment {
  id: string
  tenant_id: string
  customer_id: string
  location_id: string | null
  make: string
  model: string
  serial_number: string
  install_date: string | null
  status: EquipmentStatus
  notes: string | null
  created_at: string
  // Joined
  customer?: Customer
  location?: Location
  latest_reading?: MeterReading
  contract_equipment?: ContractEquipment & { contract?: Contract }
}

export interface MeterReading {
  id: string
  tenant_id: string
  equipment_id: string
  reading_date: string
  bw_reading: number
  color_reading: number
  source: MeterSource
  entered_by: string | null
  is_suspect: boolean
  notes: string | null
  created_at: string
  // Joined
  equipment?: Equipment
}

export interface Contract {
  id: string
  tenant_id: string
  customer_id: string
  contract_number: string
  contract_type: ContractType
  status: ContractStatus
  start_date: string
  end_date: string | null
  auto_renew: boolean
  billing_cycle: BillingCycle
  base_rate: number
  notes: string | null
  created_at: string
  // Joined
  customer?: Customer
  contract_equipment?: ContractEquipment[]
}

export interface ContractEquipment {
  id: string
  contract_id: string
  equipment_id: string
  included_bw: number
  included_color: number
  bw_overage_rate: number
  color_overage_rate: number
  last_billed_bw: number
  last_billed_color: number
  last_billed_date: string | null
  // Joined
  equipment?: Equipment
}

export interface ServiceCall {
  id: string
  tenant_id: string
  customer_id: string
  equipment_id: string | null
  call_number: string
  status: ServiceCallStatus
  priority: ServiceCallPriority
  problem_description: string | null
  assigned_to: string | null
  opened_at: string
  closed_at: string | null
  resolution_notes: string | null
  billable: boolean
  created_at: string
  // Joined
  customer?: Customer
  equipment?: Equipment
  technician?: User
}

export interface Invoice {
  id: string
  tenant_id: string
  customer_id: string
  contract_id: string | null
  invoice_number: string
  status: InvoiceStatus
  billing_period_start: string | null
  billing_period_end: string | null
  subtotal: number
  tax: number
  total: number
  due_date: string | null
  paid_at: string | null
  notes: string | null
  created_at: string
  // Joined
  customer?: Customer
  contract?: Contract
  line_items?: InvoiceLineItem[]
}

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  line_type: LineType
}

export interface BillingPreviewItem {
  contract: Contract
  customer: Customer
  equipment_items: {
    equipment: Equipment
    contract_equipment: ContractEquipment
    current_bw: number
    current_color: number
    bw_used: number
    color_used: number
    bw_overage: number
    color_overage: number
    bw_overage_charge: number
    color_overage_charge: number
  }[]
  base_charge: number
  total_overage: number
  total: number
  period_start: string
  period_end: string
}

export interface DashboardMetrics {
  monthly_recurring_revenue: number
  open_service_calls: number
  meters_due: number
  meters_collected: number
  contracts_expiring_30: number
  contracts_expiring_60: number
  contracts_expiring_90: number
  invoices_outstanding_count: number
  invoices_outstanding_amount: number
  active_contracts: number
  active_equipment: number
  active_customers: number
}
