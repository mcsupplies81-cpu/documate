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

// ── Parts & Inventory ─────────────────────────────────────────────────────
export type PartCategory = 'toner' | 'drum' | 'fuser' | 'feed_roller' | 'maintenance_kit' | 'belt' | 'other'

export interface Part {
  id: string
  tenant_id: string
  part_number: string
  description: string
  category: PartCategory
  make_compatibility: string[]
  unit_cost: number
  unit_price: number
  quantity_on_hand: number
  reorder_point: number
  reorder_quantity: number
  vendor_id: string | null
  notes: string | null
  created_at: string
  vendor?: Vendor
}

export interface PartUsage {
  id: string
  tenant_id: string
  service_call_id: string
  part_id: string
  quantity: number
  unit_cost: number
  unit_price: number
  total: number
  notes: string | null
  created_at: string
  part?: Part
}

// ── Vendors & Accounts Payable ────────────────────────────────────────────
export type PaymentTerms = 'net15' | 'net30' | 'net45' | 'cod' | 'prepaid'
export type POStatus = 'draft' | 'sent' | 'partial' | 'received' | 'cancelled'

export interface Vendor {
  id: string
  tenant_id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: Address | null
  account_number: string | null
  payment_terms: PaymentTerms | null
  notes: string | null
  created_at: string
}

export interface PurchaseOrder {
  id: string
  tenant_id: string
  vendor_id: string
  po_number: string
  status: POStatus
  order_date: string
  expected_date: string | null
  received_date: string | null
  subtotal: number
  total: number
  notes: string | null
  created_at: string
  vendor?: Vendor
  line_items?: POLineItem[]
}

export interface POLineItem {
  id: string
  po_id: string
  part_id: string | null
  description: string
  quantity_ordered: number
  quantity_received: number
  unit_cost: number
  total: number
  part?: Part
}

// ── Customer Portal ───────────────────────────────────────────────────────
export interface CustomerPortalToken {
  id: string
  tenant_id: string
  customer_id: string
  token: string
  expires_at: string
  created_at: string
}

// ── Credit Memos ─────────────────────────────────────────────────────────
export interface CreditMemo {
  id: string
  tenant_id: string
  customer_id: string
  invoice_id: string | null
  credit_number: string
  amount: number
  reason: string
  applied_at: string | null
  created_at: string
  customer?: Customer
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
