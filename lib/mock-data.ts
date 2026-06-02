import {
  Tenant, User, Customer, Location, Equipment, MeterReading,
  Contract, ContractEquipment, ServiceCall, Invoice, InvoiceLineItem,
  DashboardMetrics, Part, PartUsage, Vendor, PurchaseOrder, POLineItem, CreditMemo
} from './types'

export const MOCK_TENANT: Tenant = {
  id: 'tenant-1',
  name: 'Pacific Office Solutions',
  subdomain: 'pacific',
  created_at: '2024-01-01T00:00:00Z'
}

export const MOCK_USER: User = {
  id: 'user-1',
  tenant_id: 'tenant-1',
  email: 'admin@pacificoffice.com',
  name: 'Jordan Martinez',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z'
}

export const MOCK_USERS: User[] = [
  MOCK_USER,
  { id: 'user-2', tenant_id: 'tenant-1', email: 'service@pacificoffice.com', name: 'Alex Chen', role: 'service_manager', created_at: '2024-01-15T00:00:00Z' },
  { id: 'user-3', tenant_id: 'tenant-1', email: 'tech1@pacificoffice.com', name: 'Marcus Johnson', role: 'technician', created_at: '2024-02-01T00:00:00Z' },
  { id: 'user-4', tenant_id: 'tenant-1', email: 'tech2@pacificoffice.com', name: 'Priya Patel', role: 'technician', created_at: '2024-02-15T00:00:00Z' },
  { id: 'user-5', tenant_id: 'tenant-1', email: 'billing@pacificoffice.com', name: 'Sam Rivera', role: 'billing', created_at: '2024-03-01T00:00:00Z' },
]

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1', tenant_id: 'tenant-1', name: 'Meridian Law Group',
    email: 'billing@meridianlaw.com', phone: '(415) 555-0101',
    billing_address: { street: '555 Market St', city: 'San Francisco', state: 'CA', zip: '94105' },
    notes: 'Net 30 terms. Contact Lisa in accounting for billing questions.',
    created_at: '2024-01-10T00:00:00Z', equipment_count: 4, active_contracts: 2
  },
  {
    id: 'cust-2', tenant_id: 'tenant-1', name: 'Brightside Medical Clinic',
    email: 'admin@brightsidemedical.com', phone: '(415) 555-0202',
    billing_address: { street: '1200 Howard St', city: 'San Francisco', state: 'CA', zip: '94103' },
    notes: 'HIPAA-compliant environment. Techs must sign NDA before onsite visits.',
    created_at: '2024-01-15T00:00:00Z', equipment_count: 6, active_contracts: 3
  },
  {
    id: 'cust-3', tenant_id: 'tenant-1', name: 'Oakland Unified School District',
    email: 'procurement@ousd.org', phone: '(510) 555-0303',
    billing_address: { street: '1000 Broadway', city: 'Oakland', state: 'CA', zip: '94607' },
    notes: 'Multiple sites. Use location field on each equipment record.',
    created_at: '2024-01-20T00:00:00Z', equipment_count: 12, active_contracts: 4
  },
  {
    id: 'cust-4', tenant_id: 'tenant-1', name: 'Golden Gate Realty',
    email: 'ops@ggRealty.com', phone: '(415) 555-0404',
    billing_address: { street: '88 Kearny St', city: 'San Francisco', state: 'CA', zip: '94108' },
    notes: null, created_at: '2024-02-01T00:00:00Z', equipment_count: 2, active_contracts: 1
  },
  {
    id: 'cust-5', tenant_id: 'tenant-1', name: 'Bay Area Accounting Partners',
    email: 'office@baap.cpa', phone: '(415) 555-0505',
    billing_address: { street: '44 Montgomery St', city: 'San Francisco', state: 'CA', zip: '94104' },
    notes: 'Peak usage Jan–Apr (tax season). Expect higher meter reads.',
    created_at: '2024-02-10T00:00:00Z', equipment_count: 3, active_contracts: 2
  },
  {
    id: 'cust-6', tenant_id: 'tenant-1', name: 'Embarcadero Tech',
    email: 'finance@embarcaderotech.io', phone: '(415) 555-0606',
    billing_address: { street: '100 Pine St Ste 400', city: 'San Francisco', state: 'CA', zip: '94111' },
    notes: 'High volume color printing. Check toner levels monthly.',
    created_at: '2024-03-01T00:00:00Z', equipment_count: 2, active_contracts: 1
  },
  {
    id: 'cust-7', tenant_id: 'tenant-1', name: 'North Bay Insurance Group',
    email: 'admin@northbayins.com', phone: '(707) 555-0707',
    billing_address: { street: '500 Fourth St', city: 'Santa Rosa', state: 'CA', zip: '95404' },
    notes: null, created_at: '2024-03-15T00:00:00Z', equipment_count: 3, active_contracts: 2
  },
]

export const MOCK_LOCATIONS: Location[] = [
  { id: 'loc-1', customer_id: 'cust-1', tenant_id: 'tenant-1', name: 'Main Office', address: { street: '555 Market St', city: 'San Francisco', state: 'CA', zip: '94105' } },
  { id: 'loc-2', customer_id: 'cust-2', tenant_id: 'tenant-1', name: 'Main Clinic', address: { street: '1200 Howard St', city: 'San Francisco', state: 'CA', zip: '94103' } },
  { id: 'loc-3', customer_id: 'cust-3', tenant_id: 'tenant-1', name: 'District Office', address: { street: '1000 Broadway', city: 'Oakland', state: 'CA', zip: '94607' } },
  { id: 'loc-4', customer_id: 'cust-3', tenant_id: 'tenant-1', name: 'Jefferson Elementary', address: { street: '1500 Park St', city: 'Oakland', state: 'CA', zip: '94606' } },
  { id: 'loc-5', customer_id: 'cust-3', tenant_id: 'tenant-1', name: 'Oakland High School', address: { street: '1023 MacArthur Blvd', city: 'Oakland', state: 'CA', zip: '94610' } },
]

export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-1', tenant_id: 'tenant-1', customer_id: 'cust-1', location_id: 'loc-1',
    make: 'Konica Minolta', model: 'bizhub C360i', serial_number: 'A1234567',
    install_date: '2023-03-15', status: 'active', notes: null, created_at: '2023-03-15T00:00:00Z',
    customer: MOCK_CUSTOMERS[0],
  },
  {
    id: 'eq-2', tenant_id: 'tenant-1', customer_id: 'cust-1', location_id: 'loc-1',
    make: 'Kyocera', model: 'ECOSYS M8130cidn', serial_number: 'B2345678',
    install_date: '2023-06-01', status: 'active', notes: 'Floor 3 copy room', created_at: '2023-06-01T00:00:00Z',
    customer: MOCK_CUSTOMERS[0],
  },
  {
    id: 'eq-3', tenant_id: 'tenant-1', customer_id: 'cust-2', location_id: 'loc-2',
    make: 'Ricoh', model: 'IM C3000', serial_number: 'C3456789',
    install_date: '2023-01-10', status: 'active', notes: 'Reception area', created_at: '2023-01-10T00:00:00Z',
    customer: MOCK_CUSTOMERS[1],
  },
  {
    id: 'eq-4', tenant_id: 'tenant-1', customer_id: 'cust-2', location_id: 'loc-2',
    make: 'Canon', model: 'imageRUNNER ADVANCE DX 6765i', serial_number: 'D4567890',
    install_date: '2022-11-01', status: 'active', notes: 'Main print room - high vol', created_at: '2022-11-01T00:00:00Z',
    customer: MOCK_CUSTOMERS[1],
  },
  {
    id: 'eq-5', tenant_id: 'tenant-1', customer_id: 'cust-3', location_id: 'loc-3',
    make: 'Xerox', model: 'VersaLink C405', serial_number: 'E5678901',
    install_date: '2023-08-20', status: 'active', notes: null, created_at: '2023-08-20T00:00:00Z',
    customer: MOCK_CUSTOMERS[2],
  },
  {
    id: 'eq-6', tenant_id: 'tenant-1', customer_id: 'cust-3', location_id: 'loc-4',
    make: 'HP', model: 'LaserJet MFP E72430dn', serial_number: 'F6789012',
    install_date: '2023-09-01', status: 'active', notes: 'Teacher workroom', created_at: '2023-09-01T00:00:00Z',
    customer: MOCK_CUSTOMERS[2],
  },
  {
    id: 'eq-7', tenant_id: 'tenant-1', customer_id: 'cust-4', location_id: null,
    make: 'Konica Minolta', model: 'bizhub 4750i', serial_number: 'G7890123',
    install_date: '2023-04-12', status: 'active', notes: null, created_at: '2023-04-12T00:00:00Z',
    customer: MOCK_CUSTOMERS[3],
  },
  {
    id: 'eq-8', tenant_id: 'tenant-1', customer_id: 'cust-5', location_id: null,
    make: 'Sharp', model: 'MX-3071', serial_number: 'H8901234',
    install_date: '2022-12-01', status: 'active', notes: 'Heavy use during tax season', created_at: '2022-12-01T00:00:00Z',
    customer: MOCK_CUSTOMERS[4],
  },
  {
    id: 'eq-9', tenant_id: 'tenant-1', customer_id: 'cust-6', location_id: null,
    make: 'Ricoh', model: 'IM C6000', serial_number: 'I9012345',
    install_date: '2024-01-15', status: 'active', notes: 'Design team - high color volume', created_at: '2024-01-15T00:00:00Z',
    customer: MOCK_CUSTOMERS[5],
  },
  {
    id: 'eq-10', tenant_id: 'tenant-1', customer_id: 'cust-7', location_id: null,
    make: 'Kyocera', model: 'TASKalfa 3253ci', serial_number: 'J0123456',
    install_date: '2023-07-01', status: 'active', notes: null, created_at: '2023-07-01T00:00:00Z',
    customer: MOCK_CUSTOMERS[6],
  },
  {
    id: 'eq-11', tenant_id: 'tenant-1', customer_id: 'cust-2', location_id: 'loc-2',
    make: 'Toshiba', model: 'e-STUDIO 5018A', serial_number: 'K1234567',
    install_date: '2023-05-01', status: 'inactive', notes: 'Awaiting parts - offline', created_at: '2023-05-01T00:00:00Z',
    customer: MOCK_CUSTOMERS[1],
  },
]

export const MOCK_METER_READINGS: MeterReading[] = [
  { id: 'mr-1', tenant_id: 'tenant-1', equipment_id: 'eq-1', reading_date: '2026-05-31', bw_reading: 145230, color_reading: 38420, source: 'manual', entered_by: 'user-1', is_suspect: false, notes: null, created_at: '2026-05-31T10:00:00Z' },
  { id: 'mr-2', tenant_id: 'tenant-1', equipment_id: 'eq-1', reading_date: '2026-04-30', bw_reading: 138180, color_reading: 36100, source: 'manual', entered_by: 'user-1', is_suspect: false, notes: null, created_at: '2026-04-30T10:00:00Z' },
  { id: 'mr-3', tenant_id: 'tenant-1', equipment_id: 'eq-2', reading_date: '2026-05-31', bw_reading: 89540, color_reading: 12340, source: 'customer', entered_by: null, is_suspect: false, notes: null, created_at: '2026-05-31T14:00:00Z' },
  { id: 'mr-4', tenant_id: 'tenant-1', equipment_id: 'eq-2', reading_date: '2026-04-30', bw_reading: 84200, color_reading: 11200, source: 'customer', entered_by: null, is_suspect: false, notes: null, created_at: '2026-04-30T14:00:00Z' },
  { id: 'mr-5', tenant_id: 'tenant-1', equipment_id: 'eq-3', reading_date: '2026-05-31', bw_reading: 220450, color_reading: 84320, source: 'manual', entered_by: 'user-3', is_suspect: false, notes: null, created_at: '2026-05-31T09:00:00Z' },
  { id: 'mr-6', tenant_id: 'tenant-1', equipment_id: 'eq-3', reading_date: '2026-04-30', bw_reading: 211230, color_reading: 79100, source: 'manual', entered_by: 'user-3', is_suspect: false, notes: null, created_at: '2026-04-30T09:00:00Z' },
  { id: 'mr-7', tenant_id: 'tenant-1', equipment_id: 'eq-4', reading_date: '2026-04-30', bw_reading: 518700, color_reading: 0, source: 'dca', entered_by: null, is_suspect: false, notes: null, created_at: '2026-04-30T00:01:00Z' },
  { id: 'mr-8', tenant_id: 'tenant-1', equipment_id: 'eq-5', reading_date: '2026-05-28', bw_reading: 67340, color_reading: 22180, source: 'customer', entered_by: null, is_suspect: false, notes: null, created_at: '2026-05-28T16:00:00Z' },
  { id: 'mr-9', tenant_id: 'tenant-1', equipment_id: 'eq-7', reading_date: '2026-05-31', bw_reading: 112400, color_reading: 0, source: 'manual', entered_by: 'user-1', is_suspect: false, notes: null, created_at: '2026-05-31T11:00:00Z' },
  { id: 'mr-10', tenant_id: 'tenant-1', equipment_id: 'eq-8', reading_date: '2026-05-31', bw_reading: 335600, color_reading: 98200, source: 'manual', entered_by: 'user-5', is_suspect: false, notes: 'Higher than normal - tax season crunch', created_at: '2026-05-31T12:00:00Z' },
  { id: 'mr-11', tenant_id: 'tenant-1', equipment_id: 'eq-9', reading_date: '2026-05-31', bw_reading: 44100, color_reading: 88750, source: 'manual', entered_by: 'user-1', is_suspect: false, notes: null, created_at: '2026-05-31T13:00:00Z' },
  { id: 'mr-12', tenant_id: 'tenant-1', equipment_id: 'eq-10', reading_date: '2026-05-31', bw_reading: 98200, color_reading: 31500, source: 'dca', entered_by: null, is_suspect: false, notes: null, created_at: '2026-05-31T00:01:00Z' },
]

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'con-1', tenant_id: 'tenant-1', customer_id: 'cust-1', contract_number: 'CON-2024-001',
    contract_type: 'cpc', status: 'active', start_date: '2024-01-01', end_date: '2026-12-31',
    auto_renew: true, billing_cycle: 'monthly', base_rate: 185.00, notes: '2 machines',
    created_at: '2024-01-01T00:00:00Z', customer: MOCK_CUSTOMERS[0],
  },
  {
    id: 'con-2', tenant_id: 'tenant-1', customer_id: 'cust-2', contract_number: 'CON-2024-002',
    contract_type: 'cpc', status: 'active', start_date: '2024-01-15', end_date: '2026-07-31',
    auto_renew: false, billing_cycle: 'monthly', base_rate: 320.00, notes: 'High volume medical',
    created_at: '2024-01-15T00:00:00Z', customer: MOCK_CUSTOMERS[1],
  },
  {
    id: 'con-3', tenant_id: 'tenant-1', customer_id: 'cust-3', contract_number: 'CON-2024-003',
    contract_type: 'flat_rate', status: 'active', start_date: '2024-02-01', end_date: '2027-01-31',
    auto_renew: true, billing_cycle: 'monthly', base_rate: 450.00, notes: 'District-wide flat rate',
    created_at: '2024-02-01T00:00:00Z', customer: MOCK_CUSTOMERS[2],
  },
  {
    id: 'con-4', tenant_id: 'tenant-1', customer_id: 'cust-4', contract_number: 'CON-2024-004',
    contract_type: 'cpc', status: 'expiring', start_date: '2024-03-01', end_date: '2026-06-30',
    auto_renew: false, billing_cycle: 'monthly', base_rate: 95.00, notes: null,
    created_at: '2024-03-01T00:00:00Z', customer: MOCK_CUSTOMERS[3],
  },
  {
    id: 'con-5', tenant_id: 'tenant-1', customer_id: 'cust-5', contract_number: 'CON-2024-005',
    contract_type: 'cpc', status: 'expiring', start_date: '2023-12-01', end_date: '2026-06-15',
    auto_renew: true, billing_cycle: 'monthly', base_rate: 275.00, notes: 'High usage in tax season',
    created_at: '2023-12-01T00:00:00Z', customer: MOCK_CUSTOMERS[4],
  },
  {
    id: 'con-6', tenant_id: 'tenant-1', customer_id: 'cust-6', contract_number: 'CON-2024-006',
    contract_type: 'cpc', status: 'active', start_date: '2024-01-15', end_date: '2027-01-14',
    auto_renew: true, billing_cycle: 'monthly', base_rate: 210.00, notes: 'High color volume',
    created_at: '2024-01-15T00:00:00Z', customer: MOCK_CUSTOMERS[5],
  },
  {
    id: 'con-7', tenant_id: 'tenant-1', customer_id: 'cust-7', contract_number: 'CON-2024-007',
    contract_type: 'cpc', status: 'expired', start_date: '2023-07-01', end_date: '2026-05-15',
    auto_renew: false, billing_cycle: 'monthly', base_rate: 155.00, notes: 'Need to renew',
    created_at: '2023-07-01T00:00:00Z', customer: MOCK_CUSTOMERS[6],
  },
]

export const MOCK_CONTRACT_EQUIPMENT: ContractEquipment[] = [
  { id: 'ce-1', contract_id: 'con-1', equipment_id: 'eq-1', included_bw: 2000, included_color: 500, bw_overage_rate: 0.0080, color_overage_rate: 0.0650, last_billed_bw: 138180, last_billed_color: 36100, last_billed_date: '2026-04-30' },
  { id: 'ce-2', contract_id: 'con-1', equipment_id: 'eq-2', included_bw: 1500, included_color: 300, bw_overage_rate: 0.0080, color_overage_rate: 0.0650, last_billed_bw: 84200, last_billed_color: 11200, last_billed_date: '2026-04-30' },
  { id: 'ce-3', contract_id: 'con-2', equipment_id: 'eq-3', included_bw: 5000, included_color: 2000, bw_overage_rate: 0.0065, color_overage_rate: 0.0550, last_billed_bw: 211230, last_billed_color: 79100, last_billed_date: '2026-04-30' },
  { id: 'ce-4', contract_id: 'con-2', equipment_id: 'eq-4', included_bw: 10000, included_color: 0, bw_overage_rate: 0.0055, color_overage_rate: 0, last_billed_bw: 518700, last_billed_color: 0, last_billed_date: '2026-04-30' },
  { id: 'ce-5', contract_id: 'con-4', equipment_id: 'eq-7', included_bw: 3000, included_color: 0, bw_overage_rate: 0.0090, color_overage_rate: 0, last_billed_bw: 109800, last_billed_color: 0, last_billed_date: '2026-04-30' },
  { id: 'ce-6', contract_id: 'con-5', equipment_id: 'eq-8', included_bw: 8000, included_color: 3000, bw_overage_rate: 0.0070, color_overage_rate: 0.0600, last_billed_bw: 318200, last_billed_color: 91400, last_billed_date: '2026-04-30' },
  { id: 'ce-7', contract_id: 'con-6', equipment_id: 'eq-9', included_bw: 2000, included_color: 5000, bw_overage_rate: 0.0085, color_overage_rate: 0.0580, last_billed_bw: 41200, last_billed_color: 83100, last_billed_date: '2026-04-30' },
  { id: 'ce-8', contract_id: 'con-7', equipment_id: 'eq-10', included_bw: 4000, included_color: 1000, bw_overage_rate: 0.0075, color_overage_rate: 0.0620, last_billed_bw: 94800, last_billed_color: 29800, last_billed_date: '2026-04-30' },
]

export const MOCK_SERVICE_CALLS: ServiceCall[] = [
  {
    id: 'sc-1', tenant_id: 'tenant-1', customer_id: 'cust-2', equipment_id: 'eq-4',
    call_number: 'SC-2026-0312', status: 'open', priority: 'urgent',
    problem_description: 'Paper jam in fuser unit. Machine displaying error code C-E04.',
    assigned_to: 'user-3', opened_at: '2026-06-01T07:45:00Z', closed_at: null,
    resolution_notes: null, billable: false, created_at: '2026-06-01T07:45:00Z',
    customer: MOCK_CUSTOMERS[1], equipment: MOCK_EQUIPMENT[3],
    technician: MOCK_USERS[2],
  },
  {
    id: 'sc-2', tenant_id: 'tenant-1', customer_id: 'cust-1', equipment_id: 'eq-1',
    call_number: 'SC-2026-0311', status: 'in_progress', priority: 'high',
    problem_description: 'Color quality issues - magenta streaks on output.',
    assigned_to: 'user-4', opened_at: '2026-05-31T14:20:00Z', closed_at: null,
    resolution_notes: null, billable: false, created_at: '2026-05-31T14:20:00Z',
    customer: MOCK_CUSTOMERS[0], equipment: MOCK_EQUIPMENT[0],
    technician: MOCK_USERS[3],
  },
  {
    id: 'sc-3', tenant_id: 'tenant-1', customer_id: 'cust-5', equipment_id: 'eq-8',
    call_number: 'SC-2026-0310', status: 'in_progress', priority: 'normal',
    problem_description: 'Slow scanning speed. Customer reporting 10+ min per job.',
    assigned_to: 'user-3', opened_at: '2026-05-31T10:00:00Z', closed_at: null,
    resolution_notes: null, billable: false, created_at: '2026-05-31T10:00:00Z',
    customer: MOCK_CUSTOMERS[4], equipment: MOCK_EQUIPMENT[7],
    technician: MOCK_USERS[2],
  },
  {
    id: 'sc-4', tenant_id: 'tenant-1', customer_id: 'cust-3', equipment_id: 'eq-6',
    call_number: 'SC-2026-0309', status: 'open', priority: 'normal',
    problem_description: 'Network connectivity lost. Machine not showing on print queue.',
    assigned_to: null, opened_at: '2026-05-30T15:30:00Z', closed_at: null,
    resolution_notes: null, billable: false, created_at: '2026-05-30T15:30:00Z',
    customer: MOCK_CUSTOMERS[2], equipment: MOCK_EQUIPMENT[5],
    technician: undefined,
  },
  {
    id: 'sc-5', tenant_id: 'tenant-1', customer_id: 'cust-6', equipment_id: 'eq-9',
    call_number: 'SC-2026-0308', status: 'open', priority: 'low',
    problem_description: 'Toner low alert - black. Replacement requested.',
    assigned_to: 'user-4', opened_at: '2026-05-29T11:00:00Z', closed_at: null,
    resolution_notes: null, billable: true, created_at: '2026-05-29T11:00:00Z',
    customer: MOCK_CUSTOMERS[5], equipment: MOCK_EQUIPMENT[8],
    technician: MOCK_USERS[3],
  },
  {
    id: 'sc-6', tenant_id: 'tenant-1', customer_id: 'cust-7', equipment_id: 'eq-10',
    call_number: 'SC-2026-0307', status: 'completed', priority: 'high',
    problem_description: 'Machine offline after power surge.',
    assigned_to: 'user-3', opened_at: '2026-05-28T09:00:00Z', closed_at: '2026-05-28T13:30:00Z',
    resolution_notes: 'Replaced blown fuse and reset power management board. Machine operational.',
    billable: false, created_at: '2026-05-28T09:00:00Z',
    customer: MOCK_CUSTOMERS[6], equipment: MOCK_EQUIPMENT[9],
    technician: MOCK_USERS[2],
  },
]

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1', tenant_id: 'tenant-1', customer_id: 'cust-1', contract_id: 'con-1',
    invoice_number: 'INV-2026-0051', status: 'sent', billing_period_start: '2026-05-01', billing_period_end: '2026-05-31',
    subtotal: 271.68, tax: 0, total: 271.68, due_date: '2026-06-15', paid_at: null, notes: null, created_at: '2026-06-01T08:00:00Z',
    customer: MOCK_CUSTOMERS[0],
    line_items: [
      { id: 'li-1', invoice_id: 'inv-1', description: 'Base Service - May 2026', quantity: 1, unit_price: 185.00, total: 185.00, line_type: 'base' },
      { id: 'li-2', invoice_id: 'inv-1', description: 'B&W Overage - bizhub C360i (5,050 pages over)', quantity: 5050, unit_price: 0.0080, total: 40.40, line_type: 'bw_overage' },
      { id: 'li-3', invoice_id: 'inv-1', description: 'Color Overage - bizhub C360i (2,320 pages over)', quantity: 2320, unit_price: 0.0650, total: 150.80, line_type: 'color_overage' },
    ]
  },
  {
    id: 'inv-2', tenant_id: 'tenant-1', customer_id: 'cust-2', contract_id: 'con-2',
    invoice_number: 'INV-2026-0050', status: 'overdue', billing_period_start: '2026-05-01', billing_period_end: '2026-05-31',
    subtotal: 380.35, tax: 0, total: 380.35, due_date: '2026-06-01', paid_at: null, notes: 'Second notice sent', created_at: '2026-06-01T08:00:00Z',
    customer: MOCK_CUSTOMERS[1],
  },
  {
    id: 'inv-3', tenant_id: 'tenant-1', customer_id: 'cust-3', contract_id: 'con-3',
    invoice_number: 'INV-2026-0049', status: 'paid', billing_period_start: '2026-05-01', billing_period_end: '2026-05-31',
    subtotal: 450.00, tax: 0, total: 450.00, due_date: '2026-06-01', paid_at: '2026-05-28T00:00:00Z', notes: null, created_at: '2026-06-01T08:00:00Z',
    customer: MOCK_CUSTOMERS[2],
  },
  {
    id: 'inv-4', tenant_id: 'tenant-1', customer_id: 'cust-4', contract_id: 'con-4',
    invoice_number: 'INV-2026-0048', status: 'paid', billing_period_start: '2026-05-01', billing_period_end: '2026-05-31',
    subtotal: 117.40, tax: 0, total: 117.40, due_date: '2026-06-01', paid_at: '2026-05-30T00:00:00Z', notes: null, created_at: '2026-06-01T08:00:00Z',
    customer: MOCK_CUSTOMERS[3],
  },
  {
    id: 'inv-5', tenant_id: 'tenant-1', customer_id: 'cust-5', contract_id: 'con-5',
    invoice_number: 'INV-2026-0047', status: 'sent', billing_period_start: '2026-05-01', billing_period_end: '2026-05-31',
    subtotal: 486.20, tax: 0, total: 486.20, due_date: '2026-06-15', paid_at: null, notes: null, created_at: '2026-06-01T08:00:00Z',
    customer: MOCK_CUSTOMERS[4],
  },
]

export const MOCK_METRICS: DashboardMetrics = {
  monthly_recurring_revenue: 1490.00,
  open_service_calls: 4,
  meters_due: 10,
  meters_collected: 7,
  contracts_expiring_30: 2,
  contracts_expiring_60: 0,
  contracts_expiring_90: 1,
  invoices_outstanding_count: 2,
  invoices_outstanding_amount: 651.03,
  active_contracts: 6,
  active_equipment: 10,
  active_customers: 7,
}

// ── VENDORS ───────────────────────────────────────────────────────────────
export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'ven-1', tenant_id: 'tenant-1', name: 'Konica Minolta Business Solutions',
    contact_name: 'Derek Walsh', email: 'dwalsh@kmbs.konicaminolta.us', phone: '(800) 456-5664',
    address: { street: '100 Williams Dr', city: 'Ramsey', state: 'NJ', zip: '07446' },
    account_number: 'ACCT-88231', payment_terms: 'net30', notes: 'Primary toner supplier',
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'ven-2', tenant_id: 'tenant-1', name: 'Kyocera Document Solutions',
    contact_name: 'Maria Santos', email: 'msantos@kyocera.com', phone: '(800) 255-6482',
    address: { street: '225 Sand Road', city: 'Fairfield', state: 'NJ', zip: '07004' },
    account_number: 'KYO-4421', payment_terms: 'net30', notes: null,
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'ven-3', tenant_id: 'tenant-1', name: 'Ricoh USA',
    contact_name: 'Tom Huang', email: 'thuang@ricoh-usa.com', phone: '(888) 742-6471',
    address: { street: '300 Eagleview Blvd', city: 'Exton', state: 'PA', zip: '19341' },
    account_number: 'RIC-9902', payment_terms: 'net45', notes: 'Net 45 — pay early for 2% discount',
    created_at: '2023-02-01T00:00:00Z',
  },
  {
    id: 'ven-4', tenant_id: 'tenant-1', name: 'Parts Express Pro',
    contact_name: 'Chris Nguyen', email: 'orders@partsexpresspro.com', phone: '(415) 555-7700',
    address: { street: '2200 Industrial Blvd', city: 'Hayward', state: 'CA', zip: '94545' },
    account_number: 'PEP-1140', payment_terms: 'cod', notes: 'Local supplier. Next-day delivery in Bay Area.',
    created_at: '2023-03-01T00:00:00Z',
  },
]

// ── PARTS ─────────────────────────────────────────────────────────────────
export const MOCK_PARTS: Part[] = [
  {
    id: 'part-1', tenant_id: 'tenant-1', part_number: 'TNP-50M', description: 'Konica Minolta Toner — Magenta (bizhub C360i)',
    category: 'toner', make_compatibility: ['Konica Minolta'], unit_cost: 42.00, unit_price: 89.00,
    quantity_on_hand: 8, reorder_point: 3, reorder_quantity: 6, vendor_id: 'ven-1', notes: null,
    created_at: '2024-01-01T00:00:00Z', vendor: MOCK_VENDORS[0],
  },
  {
    id: 'part-2', tenant_id: 'tenant-1', part_number: 'TNP-50C', description: 'Konica Minolta Toner — Cyan (bizhub C360i)',
    category: 'toner', make_compatibility: ['Konica Minolta'], unit_cost: 42.00, unit_price: 89.00,
    quantity_on_hand: 5, reorder_point: 3, reorder_quantity: 6, vendor_id: 'ven-1', notes: null,
    created_at: '2024-01-01T00:00:00Z', vendor: MOCK_VENDORS[0],
  },
  {
    id: 'part-3', tenant_id: 'tenant-1', part_number: 'TNP-50Y', description: 'Konica Minolta Toner — Yellow (bizhub C360i)',
    category: 'toner', make_compatibility: ['Konica Minolta'], unit_cost: 42.00, unit_price: 89.00,
    quantity_on_hand: 2, reorder_point: 3, reorder_quantity: 6, vendor_id: 'ven-1', notes: 'LOW STOCK',
    created_at: '2024-01-01T00:00:00Z', vendor: MOCK_VENDORS[0],
  },
  {
    id: 'part-4', tenant_id: 'tenant-1', part_number: 'TNP-50K', description: 'Konica Minolta Toner — Black (bizhub C360i)',
    category: 'toner', make_compatibility: ['Konica Minolta'], unit_cost: 38.00, unit_price: 79.00,
    quantity_on_hand: 12, reorder_point: 4, reorder_quantity: 8, vendor_id: 'ven-1', notes: null,
    created_at: '2024-01-01T00:00:00Z', vendor: MOCK_VENDORS[0],
  },
  {
    id: 'part-5', tenant_id: 'tenant-1', part_number: 'DR-512', description: 'Konica Minolta Drum Unit — C/M/Y',
    category: 'drum', make_compatibility: ['Konica Minolta'], unit_cost: 95.00, unit_price: 185.00,
    quantity_on_hand: 3, reorder_point: 2, reorder_quantity: 4, vendor_id: 'ven-1', notes: null,
    created_at: '2024-01-01T00:00:00Z', vendor: MOCK_VENDORS[0],
  },
  {
    id: 'part-6', tenant_id: 'tenant-1', part_number: 'FK-512', description: 'Konica Minolta Fuser Unit (bizhub C360i)',
    category: 'fuser', make_compatibility: ['Konica Minolta'], unit_cost: 145.00, unit_price: 295.00,
    quantity_on_hand: 1, reorder_point: 1, reorder_quantity: 2, vendor_id: 'ven-1', notes: null,
    created_at: '2024-01-01T00:00:00Z', vendor: MOCK_VENDORS[0],
  },
  {
    id: 'part-7', tenant_id: 'tenant-1', part_number: 'TK-8337M', description: 'Kyocera Toner — Magenta (ECOSYS M8130)',
    category: 'toner', make_compatibility: ['Kyocera'], unit_cost: 38.00, unit_price: 79.00,
    quantity_on_hand: 6, reorder_point: 2, reorder_quantity: 4, vendor_id: 'ven-2', notes: null,
    created_at: '2024-01-01T00:00:00Z', vendor: MOCK_VENDORS[1],
  },
  {
    id: 'part-8', tenant_id: 'tenant-1', part_number: 'MK-8335A', description: 'Kyocera Maintenance Kit (ECOSYS M8130)',
    category: 'maintenance_kit', make_compatibility: ['Kyocera'], unit_cost: 210.00, unit_price: 399.00,
    quantity_on_hand: 2, reorder_point: 1, reorder_quantity: 2, vendor_id: 'ven-2', notes: '200k page yield',
    created_at: '2024-01-01T00:00:00Z', vendor: MOCK_VENDORS[1],
  },
  {
    id: 'part-9', tenant_id: 'tenant-1', part_number: 'IMC3000-TM', description: 'Ricoh Toner — Magenta (IM C3000)',
    category: 'toner', make_compatibility: ['Ricoh'], unit_cost: 45.00, unit_price: 92.00,
    quantity_on_hand: 0, reorder_point: 2, reorder_quantity: 4, vendor_id: 'ven-3', notes: 'OUT OF STOCK',
    created_at: '2024-01-01T00:00:00Z', vendor: MOCK_VENDORS[2],
  },
  {
    id: 'part-10', tenant_id: 'tenant-1', part_number: 'FEED-ROLL-UNI', description: 'Universal Feed Roller Kit',
    category: 'feed_roller', make_compatibility: ['Konica Minolta', 'Kyocera', 'Ricoh', 'Sharp'],
    unit_cost: 18.00, unit_price: 45.00, quantity_on_hand: 15, reorder_point: 5, reorder_quantity: 10,
    vendor_id: 'ven-4', notes: 'Universal fit for most A3 MFPs', created_at: '2024-01-01T00:00:00Z',
    vendor: MOCK_VENDORS[3],
  },
]

// ── PART USAGE ────────────────────────────────────────────────────────────
export const MOCK_PART_USAGE: PartUsage[] = [
  {
    id: 'pu-1', tenant_id: 'tenant-1', service_call_id: 'sc-1', part_id: 'part-6',
    quantity: 1, unit_cost: 145.00, unit_price: 295.00, total: 295.00,
    notes: 'Fuser replaced at 180k pages', created_at: '2026-05-16T14:00:00Z',
    part: MOCK_PARTS[5],
  },
  {
    id: 'pu-2', tenant_id: 'tenant-1', service_call_id: 'sc-3', part_id: 'part-10',
    quantity: 2, unit_cost: 18.00, unit_price: 45.00, total: 90.00,
    notes: null, created_at: '2026-05-20T11:00:00Z',
    part: MOCK_PARTS[9],
  },
]

// ── PURCHASE ORDERS ───────────────────────────────────────────────────────
export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1', tenant_id: 'tenant-1', vendor_id: 'ven-1', po_number: 'PO-2026-0041',
    status: 'received', order_date: '2026-05-01', expected_date: '2026-05-08', received_date: '2026-05-07',
    subtotal: 504.00, total: 504.00, notes: null, created_at: '2026-05-01T00:00:00Z',
    vendor: MOCK_VENDORS[0],
    line_items: [
      { id: 'pli-1', po_id: 'po-1', part_id: 'part-1', description: 'TNP-50M Magenta Toner x6', quantity_ordered: 6, quantity_received: 6, unit_cost: 42.00, total: 252.00, part: MOCK_PARTS[0] },
      { id: 'pli-2', po_id: 'po-1', part_id: 'part-2', description: 'TNP-50C Cyan Toner x6', quantity_ordered: 6, quantity_received: 6, unit_cost: 42.00, total: 252.00, part: MOCK_PARTS[1] },
    ],
  },
  {
    id: 'po-2', tenant_id: 'tenant-1', vendor_id: 'ven-1', po_number: 'PO-2026-0042',
    status: 'sent', order_date: '2026-05-28', expected_date: '2026-06-04', received_date: null,
    subtotal: 628.00, total: 628.00, notes: 'Urgent — low stock on yellow toner', created_at: '2026-05-28T00:00:00Z',
    vendor: MOCK_VENDORS[0],
    line_items: [
      { id: 'pli-3', po_id: 'po-2', part_id: 'part-3', description: 'TNP-50Y Yellow Toner x6', quantity_ordered: 6, quantity_received: 0, unit_cost: 42.00, total: 252.00, part: MOCK_PARTS[2] },
      { id: 'pli-4', po_id: 'po-2', part_id: 'part-5', description: 'DR-512 Drum Unit x4', quantity_ordered: 4, quantity_received: 0, unit_cost: 95.00, total: 380.00, part: MOCK_PARTS[4] },
    ],
  },
  {
    id: 'po-3', tenant_id: 'tenant-1', vendor_id: 'ven-3', po_number: 'PO-2026-0043',
    status: 'draft', order_date: '2026-06-01', expected_date: null, received_date: null,
    subtotal: 180.00, total: 180.00, notes: null, created_at: '2026-06-01T00:00:00Z',
    vendor: MOCK_VENDORS[2],
    line_items: [
      { id: 'pli-5', po_id: 'po-3', part_id: 'part-9', description: 'IMC3000-TM Ricoh Magenta x4', quantity_ordered: 4, quantity_received: 0, unit_cost: 45.00, total: 180.00, part: MOCK_PARTS[8] },
    ],
  },
]

// ── CREDIT MEMOS ─────────────────────────────────────────────────────────
export const MOCK_CREDIT_MEMOS: CreditMemo[] = [
  {
    id: 'cm-1', tenant_id: 'tenant-1', customer_id: 'cust-2', invoice_id: 'inv-2',
    credit_number: 'CM-2026-001', amount: 45.00, reason: 'Service call response time exceeded SLA',
    applied_at: null, created_at: '2026-05-20T00:00:00Z',
    customer: MOCK_CUSTOMERS[1],
  },
]

export const getEquipmentWithReadings = () => {
  return MOCK_EQUIPMENT.map(eq => {
    const readings = MOCK_METER_READINGS.filter(r => r.equipment_id === eq.id)
      .sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())
    return { ...eq, latest_reading: readings[0] }
  })
}

export const getContractWithEquipment = (contractId: string) => {
  const contract = MOCK_CONTRACTS.find(c => c.id === contractId)
  if (!contract) return null
  const ces = MOCK_CONTRACT_EQUIPMENT.filter(ce => ce.contract_id === contractId)
    .map(ce => ({
      ...ce,
      equipment: MOCK_EQUIPMENT.find(e => e.id === ce.equipment_id)
    }))
  return { ...contract, contract_equipment: ces }
}
