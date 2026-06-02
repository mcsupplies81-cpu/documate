-- DealerOS Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TENANTS
-- ============================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  logo_url TEXT,
  billing_email TEXT,
  invoice_prefix TEXT DEFAULT 'INV',
  default_payment_terms INTEGER DEFAULT 30, -- days
  tax_rate DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'service_manager', 'technician', 'billing')),
  avatar_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_tenant ON customers(tenant_id);

-- ============================================================
-- LOCATIONS
-- ============================================================
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_customer ON locations(customer_id);

-- ============================================================
-- EQUIPMENT
-- ============================================================
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  install_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'removed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_tenant ON equipment(tenant_id);
CREATE INDEX idx_equipment_customer ON equipment(customer_id);
CREATE UNIQUE INDEX idx_equipment_serial ON equipment(tenant_id, serial_number);

-- ============================================================
-- METER READINGS
-- ============================================================
CREATE TABLE meter_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bw_reading BIGINT NOT NULL DEFAULT 0,
  color_reading BIGINT NOT NULL DEFAULT 0,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'customer', 'dca')),
  entered_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_suspect BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meter_readings_equipment ON meter_readings(equipment_id);
CREATE INDEX idx_meter_readings_date ON meter_readings(equipment_id, reading_date DESC);

-- Prevent duplicate readings on the same day for the same machine
CREATE UNIQUE INDEX idx_meter_readings_unique_day ON meter_readings(equipment_id, reading_date);

-- ============================================================
-- CONTRACTS
-- ============================================================
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  contract_number TEXT NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('cpc', 'flat_rate', 'block', 'equipment_only')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expiring', 'expired', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT FALSE,
  renewal_term_months INTEGER DEFAULT 12,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  base_rate DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX idx_contracts_customer ON contracts(customer_id);
CREATE INDEX idx_contracts_status ON contracts(tenant_id, status);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);

-- ============================================================
-- CONTRACT EQUIPMENT (meter groups)
-- ============================================================
CREATE TABLE contract_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  included_bw BIGINT DEFAULT 0,
  included_color BIGINT DEFAULT 0,
  bw_overage_rate DECIMAL(10,5) DEFAULT 0,
  color_overage_rate DECIMAL(10,5) DEFAULT 0,
  last_billed_bw BIGINT DEFAULT 0,
  last_billed_color BIGINT DEFAULT 0,
  last_billed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contract_equipment_contract ON contract_equipment(contract_id);
CREATE INDEX idx_contract_equipment_equipment ON contract_equipment(equipment_id);

-- ============================================================
-- SERVICE CALLS
-- ============================================================
CREATE TABLE service_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  call_number TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  problem_description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  billable BOOLEAN DEFAULT FALSE,
  parts_cost DECIMAL(10,2) DEFAULT 0,
  labor_hours DECIMAL(5,2) DEFAULT 0,
  labor_rate DECIMAL(10,2) DEFAULT 85,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_calls_tenant ON service_calls(tenant_id);
CREATE INDEX idx_service_calls_customer ON service_calls(customer_id);
CREATE INDEX idx_service_calls_status ON service_calls(tenant_id, status);
CREATE INDEX idx_service_calls_assigned ON service_calls(assigned_to);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void')),
  billing_period_start DATE,
  billing_period_end DATE,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  paid_amount DECIMAL(10,2),
  notes TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(tenant_id, status);

-- ============================================================
-- INVOICE LINE ITEMS
-- ============================================================
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,5) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  line_type TEXT CHECK (line_type IN ('base', 'bw_overage', 'color_overage', 'service', 'parts', 'other')),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_line_items_invoice ON invoice_line_items(invoice_id);

-- ============================================================
-- METER SUBMISSION TOKENS (for public portal)
-- ============================================================
CREATE TABLE meter_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_tokens ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Users can only see their own tenant's data
CREATE POLICY "tenant_isolation" ON customers
  FOR ALL USING (tenant_id = get_tenant_id());

CREATE POLICY "tenant_isolation" ON locations
  FOR ALL USING (tenant_id = get_tenant_id());

CREATE POLICY "tenant_isolation" ON equipment
  FOR ALL USING (tenant_id = get_tenant_id());

CREATE POLICY "tenant_isolation" ON meter_readings
  FOR ALL USING (tenant_id = get_tenant_id());

CREATE POLICY "tenant_isolation" ON contracts
  FOR ALL USING (tenant_id = get_tenant_id());

CREATE POLICY "tenant_isolation" ON service_calls
  FOR ALL USING (tenant_id = get_tenant_id());

CREATE POLICY "tenant_isolation" ON invoices
  FOR ALL USING (tenant_id = get_tenant_id());

CREATE POLICY "user_own_tenant" ON users
  FOR ALL USING (tenant_id = get_tenant_id());

-- Contract equipment and line items inherit from parent
CREATE POLICY "via_contract" ON contract_equipment
  FOR ALL USING (
    contract_id IN (SELECT id FROM contracts WHERE tenant_id = get_tenant_id())
  );

CREATE POLICY "via_invoice" ON invoice_line_items
  FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE tenant_id = get_tenant_id())
  );

-- Meter tokens: public read by token, tenant write
CREATE POLICY "public_read_by_token" ON meter_tokens
  FOR SELECT USING (expires_at > NOW() AND used_at IS NULL);

CREATE POLICY "tenant_manage" ON meter_tokens
  FOR ALL USING (tenant_id = get_tenant_id());

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_calls_updated_at
  BEFORE UPDATE ON service_calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function: get latest meter reading for equipment
CREATE OR REPLACE FUNCTION get_latest_meter(p_equipment_id UUID)
RETURNS TABLE(bw_reading BIGINT, color_reading BIGINT, reading_date DATE) AS $$
  SELECT bw_reading, color_reading, reading_date
  FROM meter_readings
  WHERE equipment_id = p_equipment_id
  ORDER BY reading_date DESC
  LIMIT 1
$$ LANGUAGE SQL;

-- Function: auto-update contract status based on end date
CREATE OR REPLACE FUNCTION refresh_contract_statuses()
RETURNS void AS $$
BEGIN
  -- Mark expired
  UPDATE contracts
  SET status = 'expired'
  WHERE end_date < CURRENT_DATE
    AND status NOT IN ('cancelled', 'expired');

  -- Mark expiring (within 60 days)
  UPDATE contracts
  SET status = 'expiring'
  WHERE end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SAMPLE SEED DATA (optional - for testing)
-- Run this after schema creation if you want demo data
-- ============================================================

-- To seed: uncomment and run the INSERT statements in supabase/seed.sql
