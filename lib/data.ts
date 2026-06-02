/**
 * Data access layer — switches between mock data (DEMO_MODE=true)
 * and real Supabase queries. Components import from here, never directly
 * from mock-data.ts or Supabase.
 */
import type {
  Customer, Equipment, Contract, MeterReading, ServiceCall,
  Invoice, ContractEquipment, Location, User, DashboardMetrics
} from './types'
import {
  MOCK_CUSTOMERS, MOCK_EQUIPMENT, MOCK_CONTRACTS, MOCK_METER_READINGS,
  MOCK_SERVICE_CALLS, MOCK_INVOICES, MOCK_USERS, MOCK_LOCATIONS,
  MOCK_CONTRACT_EQUIPMENT, MOCK_METRICS, getEquipmentWithReadings,
  getContractWithEquipment
} from './mock-data'

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// ─────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────

export async function getCustomers(tenantId?: string): Promise<Customer[]> {
  if (DEMO) return MOCK_CUSTOMERS
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase
    .from('customers')
    .select('*')
    .order('name')
  return data ?? []
}

export async function getCustomer(id: string): Promise<Customer | null> {
  if (DEMO) return MOCK_CUSTOMERS.find(c => c.id === id) ?? null
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('customers').select('*').eq('id', id).single()
  return data
}

export async function createCustomer(customer: Partial<Customer>): Promise<Customer | null> {
  if (DEMO) {
    const newCustomer = { ...customer, id: `cust-${Date.now()}`, tenant_id: 'tenant-1', created_at: new Date().toISOString() } as Customer
    MOCK_CUSTOMERS.push(newCustomer)
    return newCustomer
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('customers').insert(customer).select().single()
  return data
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  if (DEMO) {
    const idx = MOCK_CUSTOMERS.findIndex(c => c.id === id)
    if (idx >= 0) MOCK_CUSTOMERS[idx] = { ...MOCK_CUSTOMERS[idx], ...updates }
    return MOCK_CUSTOMERS[idx] ?? null
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('customers').update(updates).eq('id', id).select().single()
  return data
}

// ─────────────────────────────────────────────
// EQUIPMENT
// ─────────────────────────────────────────────

export async function getEquipment(filters?: { customer_id?: string; status?: string }): Promise<Equipment[]> {
  if (DEMO) {
    let eq = getEquipmentWithReadings()
    if (filters?.customer_id) eq = eq.filter(e => e.customer_id === filters.customer_id)
    if (filters?.status) eq = eq.filter(e => e.status === filters.status)
    return eq
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  let query = supabase.from('equipment').select('*, customer:customers(name), location:locations(name, address)')
  if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id)
  if (filters?.status) query = query.eq('status', filters.status)
  const { data } = await query.order('make')
  return data ?? []
}

export async function getEquipmentById(id: string): Promise<Equipment | null> {
  if (DEMO) return getEquipmentWithReadings().find(e => e.id === id) ?? null
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('equipment').select('*, customer:customers(name)').eq('id', id).single()
  return data
}

export async function createEquipment(equipment: Partial<Equipment>): Promise<Equipment | null> {
  if (DEMO) {
    const newEq = { ...equipment, id: `eq-${Date.now()}`, tenant_id: 'tenant-1', created_at: new Date().toISOString() } as Equipment
    MOCK_EQUIPMENT.push(newEq)
    return newEq
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('equipment').insert(equipment).select().single()
  return data
}

// ─────────────────────────────────────────────
// METER READINGS
// ─────────────────────────────────────────────

export async function getMeterReadings(equipmentId: string): Promise<MeterReading[]> {
  if (DEMO) return MOCK_METER_READINGS.filter(r => r.equipment_id === equipmentId).sort((a,b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('meter_readings').select('*').eq('equipment_id', equipmentId).order('reading_date', { ascending: false })
  return data ?? []
}

export async function addMeterReading(reading: Partial<MeterReading>): Promise<MeterReading | null> {
  if (DEMO) {
    const newReading = { ...reading, id: `mr-${Date.now()}`, tenant_id: 'tenant-1', is_suspect: false, created_at: new Date().toISOString() } as MeterReading
    MOCK_METER_READINGS.push(newReading)
    return newReading
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('meter_readings').insert(reading).select().single()
  return data
}

// ─────────────────────────────────────────────
// CONTRACTS
// ─────────────────────────────────────────────

export async function getContracts(filters?: { status?: string; customer_id?: string }): Promise<Contract[]> {
  if (DEMO) {
    let contracts = MOCK_CONTRACTS
    if (filters?.status) contracts = contracts.filter(c => c.status === filters.status)
    if (filters?.customer_id) contracts = contracts.filter(c => c.customer_id === filters.customer_id)
    return contracts
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  let query = supabase.from('contracts').select('*, customer:customers(name, email)')
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id)
  const { data } = await query.order('created_at', { ascending: false })
  return data ?? []
}

export async function getContract(id: string) {
  if (DEMO) return getContractWithEquipment(id)
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('contracts').select('*, customer:customers(*), contract_equipment(*, equipment:equipment(*))').eq('id', id).single()
  return data
}

// ─────────────────────────────────────────────
// SERVICE CALLS
// ─────────────────────────────────────────────

export async function getServiceCalls(filters?: { status?: string; customer_id?: string; assigned_to?: string }): Promise<ServiceCall[]> {
  if (DEMO) {
    let calls = MOCK_SERVICE_CALLS
    if (filters?.status) calls = calls.filter(c => c.status === filters.status)
    if (filters?.customer_id) calls = calls.filter(c => c.customer_id === filters.customer_id)
    if (filters?.assigned_to) calls = calls.filter(c => c.assigned_to === filters.assigned_to)
    return calls
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  let query = supabase.from('service_calls').select('*, customer:customers(name), equipment:equipment(make, model, serial_number), technician:users(name, role)')
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id)
  const { data } = await query.order('opened_at', { ascending: false })
  return data ?? []
}

export async function getServiceCall(id: string): Promise<ServiceCall | null> {
  if (DEMO) return MOCK_SERVICE_CALLS.find(c => c.id === id) ?? null
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('service_calls').select('*, customer:customers(*), equipment:equipment(*), technician:users(name, role)').eq('id', id).single()
  return data
}

export async function updateServiceCall(id: string, updates: Partial<ServiceCall>): Promise<ServiceCall | null> {
  if (DEMO) {
    const idx = MOCK_SERVICE_CALLS.findIndex(c => c.id === id)
    if (idx >= 0) MOCK_SERVICE_CALLS[idx] = { ...MOCK_SERVICE_CALLS[idx], ...updates }
    return MOCK_SERVICE_CALLS[idx] ?? null
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('service_calls').update(updates).eq('id', id).select().single()
  return data
}

// ─────────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────────

export async function getInvoices(filters?: { status?: string; customer_id?: string }): Promise<Invoice[]> {
  if (DEMO) {
    let invoices = MOCK_INVOICES
    if (filters?.status) invoices = invoices.filter(i => i.status === filters.status)
    if (filters?.customer_id) invoices = invoices.filter(i => i.customer_id === filters.customer_id)
    return invoices
  }
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  let query = supabase.from('invoices').select('*, customer:customers(name), contract:contracts(contract_number), line_items:invoice_line_items(*)')
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id)
  const { data } = await query.order('created_at', { ascending: false })
  return data ?? []
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  if (DEMO) return MOCK_INVOICES.find(i => i.id === id) ?? null
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('invoices').select('*, customer:customers(*), contract:contracts(*), line_items:invoice_line_items(*)').eq('id', id).single()
  return data
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (DEMO) return MOCK_METRICS
  // Real implementation would run aggregation queries
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const [contracts, calls, invoices] = await Promise.all([
    supabase.from('contracts').select('id, status, base_rate, end_date'),
    supabase.from('service_calls').select('id, status'),
    supabase.from('invoices').select('id, status, total'),
  ])

  const activeContracts = (contracts.data ?? []).filter(c => c.status === 'active')
  const mrr = activeContracts.reduce((sum: number, c: { base_rate: number }) => sum + (c.base_rate || 0), 0)
  const openCalls = (calls.data ?? []).filter((c: { status: string }) => c.status === 'open' || c.status === 'in_progress').length
  const outstanding = (invoices.data ?? []).filter((i: { status: string }) => i.status === 'sent' || i.status === 'overdue')

  return {
    monthly_recurring_revenue: mrr,
    open_service_calls: openCalls,
    meters_due: 0, meters_collected: 0,
    contracts_expiring_30: 0, contracts_expiring_60: 0, contracts_expiring_90: 0,
    invoices_outstanding_count: outstanding.length,
    invoices_outstanding_amount: outstanding.reduce((s: number, i: { total: number }) => s + (i.total || 0), 0),
    active_contracts: activeContracts.length,
    active_equipment: 0,
    active_customers: 0,
  }
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  if (DEMO) return MOCK_USERS
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('*').eq('active', true).order('name')
  return data ?? []
}
