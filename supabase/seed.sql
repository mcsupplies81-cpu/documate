-- DealerOS Seed Data
-- Run this after schema.sql to populate a fresh Supabase project with demo data.
-- Matches the mock data in lib/mock-data.ts exactly.

-- =====================================================================
-- TENANT
-- =====================================================================
INSERT INTO tenants (id, name, subdomain) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Pacific Office Solutions', 'pacific')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- USERS (auth.users must exist first — create via Supabase Auth API)
-- These rows go in public.users; link to auth.users via id
-- =====================================================================
-- User IDs must match auth.users IDs you create via Supabase dashboard or Auth API.
-- Placeholder UUIDs used here — replace with real auth user IDs after setup.
INSERT INTO users (id, tenant_id, email, name, role) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'admin@pacificoffice.com',   'Jordan Martinez', 'admin'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'service@pacificoffice.com', 'Alex Chen',        'service_manager'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'tech1@pacificoffice.com',   'Marcus Johnson',   'technician'),
  ('aaaaaaaa-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'tech2@pacificoffice.com',   'Priya Patel',      'technician'),
  ('aaaaaaaa-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'billing@pacificoffice.com', 'Sam Rivera',       'billing')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- CUSTOMERS
-- =====================================================================
INSERT INTO customers (id, tenant_id, name, email, phone, billing_address, notes) VALUES
  ('cccccccc-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Meridian Law Group',
    'billing@meridianlaw.com', '(415) 555-0101',
    '{"street":"555 Market St","city":"San Francisco","state":"CA","zip":"94105"}',
    'Net 30 terms. Contact Lisa in accounting for billing questions.'),
  ('cccccccc-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Brightside Medical Clinic',
    'admin@brightsidemedical.com', '(415) 555-0202',
    '{"street":"1200 Howard St","city":"San Francisco","state":"CA","zip":"94103"}',
    'HIPAA-compliant environment. Techs must sign NDA before onsite visits.'),
  ('cccccccc-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Oakland Unified School District',
    'procurement@ousd.org', '(510) 555-0303',
    '{"street":"1000 Broadway","city":"Oakland","state":"CA","zip":"94607"}',
    'Multiple sites. Use location field on each equipment record.'),
  ('cccccccc-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Golden Gate Realty',
    'ops@ggRealty.com', '(415) 555-0404',
    '{"street":"88 Kearny St","city":"San Francisco","state":"CA","zip":"94108"}',
    NULL),
  ('cccccccc-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'Bay Area Accounting Partners',
    'office@baap.cpa', '(415) 555-0505',
    '{"street":"44 Montgomery St","city":"San Francisco","state":"CA","zip":"94104"}',
    'Peak usage Jan–Apr (tax season). Expect higher meter reads.'),
  ('cccccccc-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000001', 'Embarcadero Tech',
    'finance@embarcaderotech.io', '(415) 555-0606',
    '{"street":"100 Pine St Ste 400","city":"San Francisco","state":"CA","zip":"94111"}',
    'High volume color printing. Check toner levels monthly.'),
  ('cccccccc-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000001', 'North Bay Insurance Group',
    'admin@northbayins.com', '(707) 555-0707',
    '{"street":"500 Fourth St","city":"Santa Rosa","state":"CA","zip":"95404"}',
    NULL)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- EQUIPMENT
-- =====================================================================
INSERT INTO equipment (id, tenant_id, customer_id, make, model, serial_number, install_date, status, notes) VALUES
  ('eeeeeeee-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'Konica Minolta', 'bizhub C360i',                  'A1234567', '2023-03-15', 'active',   NULL),
  ('eeeeeeee-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'Kyocera',        'ECOSYS M8130cidn',               'B2345678', '2023-06-01', 'active',   'Floor 3 copy room'),
  ('eeeeeeee-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', 'Ricoh',          'IM C3000',                       'C3456789', '2023-01-10', 'active',   'Reception area'),
  ('eeeeeeee-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', 'Canon',          'imageRUNNER ADVANCE DX 6765i',   'D4567890', '2022-11-01', 'active',   'Main print room - high vol'),
  ('eeeeeeee-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', 'Xerox',          'VersaLink C405',                 'E5678901', '2023-08-20', 'active',   NULL),
  ('eeeeeeee-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', 'HP',             'LaserJet MFP E72430dn',          'F6789012', '2023-09-01', 'active',   'Teacher workroom'),
  ('eeeeeeee-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000004', 'Konica Minolta', 'bizhub 4750i',                   'G7890123', '2023-04-12', 'active',   NULL),
  ('eeeeeeee-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', 'Sharp',          'MX-3071',                        'H8901234', '2022-12-01', 'active',   'Heavy use during tax season'),
  ('eeeeeeee-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000006', 'Ricoh',          'IM C6000',                       'I9012345', '2024-01-15', 'active',   'Design team - high color volume'),
  ('eeeeeeee-0000-0000-0000-000000000010', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000007', 'Kyocera',        'TASKalfa 3253ci',                'J0123456', '2023-07-01', 'active',   NULL),
  ('eeeeeeee-0000-0000-0000-000000000011', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', 'Toshiba',        'e-STUDIO 5018A',                 'K1234567', '2023-05-01', 'inactive', 'Awaiting parts - offline')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- CONTRACTS
-- =====================================================================
INSERT INTO contracts (id, tenant_id, customer_id, contract_number, contract_type, status, start_date, end_date, auto_renew, billing_cycle, base_rate, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'CON-2024-001', 'cpc',       'active',   '2024-01-01', '2026-12-31', true,  'monthly', 185.00, '2 machines'),
  ('00000000-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', 'CON-2024-002', 'cpc',       'active',   '2024-01-15', '2026-07-31', false, 'monthly', 320.00, 'High volume medical'),
  ('00000000-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', 'CON-2024-003', 'flat_rate', 'active',   '2024-02-01', '2027-01-31', true,  'monthly', 450.00, 'District-wide flat rate'),
  ('00000000-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000004', 'CON-2024-004', 'cpc',       'expiring', '2024-03-01', '2026-06-30', false, 'monthly',  95.00, NULL),
  ('00000000-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', 'CON-2024-005', 'cpc',       'expiring', '2023-12-01', '2026-06-15', true,  'monthly', 275.00, 'High usage in tax season'),
  ('00000000-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000006', 'CON-2024-006', 'cpc',       'active',   '2024-01-15', '2027-01-14', true,  'monthly', 210.00, 'High color volume'),
  ('00000000-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000007', 'CON-2024-007', 'cpc',       'expired',  '2023-07-01', '2026-05-15', false, 'monthly', 155.00, 'Need to renew')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- CONTRACT EQUIPMENT
-- =====================================================================
INSERT INTO contract_equipment (id, contract_id, equipment_id, included_bw, included_color, bw_overage_rate, color_overage_rate, last_billed_bw, last_billed_color, last_billed_date) VALUES
  ('cece0001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001', 2000, 500,   0.0080, 0.0650, 138180, 36100, '2026-04-30'),
  ('cece0001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000002', 1500, 300,   0.0080, 0.0650,  84200, 11200, '2026-04-30'),
  ('cece0001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'eeeeeeee-0000-0000-0000-000000000003', 5000, 2000,  0.0065, 0.0550, 211230, 79100, '2026-04-30'),
  ('cece0001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'eeeeeeee-0000-0000-0000-000000000004',10000,    0,  0.0055, 0,      518700,     0, '2026-04-30'),
  ('cece0001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'eeeeeeee-0000-0000-0000-000000000007', 3000,    0,  0.0090, 0,      109800,     0, '2026-04-30'),
  ('cece0001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'eeeeeeee-0000-0000-0000-000000000008', 8000, 3000,  0.0070, 0.0600, 318200, 91400, '2026-04-30'),
  ('cece0001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', 'eeeeeeee-0000-0000-0000-000000000009', 2000, 5000,  0.0085, 0.0580,  41200, 83100, '2026-04-30'),
  ('cece0001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000007', 'eeeeeeee-0000-0000-0000-000000000010', 4000, 1000,  0.0075, 0.0620,  94800, 29800, '2026-04-30')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- METER READINGS
-- =====================================================================
INSERT INTO meter_readings (id, tenant_id, equipment_id, reading_date, bw_reading, color_reading, source, entered_by, is_suspect, notes) VALUES
  ('mmmmmmmm-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001', '2026-05-31', 145230,  38420, 'manual',   'aaaaaaaa-0000-0000-0000-000000000001', false, NULL),
  ('mmmmmmmm-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001', '2026-04-30', 138180,  36100, 'manual',   'aaaaaaaa-0000-0000-0000-000000000001', false, NULL),
  ('mmmmmmmm-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000002', '2026-05-31',  89540,  12340, 'customer', NULL,                                   false, NULL),
  ('mmmmmmmm-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000002', '2026-04-30',  84200,  11200, 'customer', NULL,                                   false, NULL),
  ('mmmmmmmm-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000003', '2026-05-31', 220450,  84320, 'manual',   'aaaaaaaa-0000-0000-0000-000000000003', false, NULL),
  ('mmmmmmmm-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000003', '2026-04-30', 211230,  79100, 'manual',   'aaaaaaaa-0000-0000-0000-000000000003', false, NULL),
  ('mmmmmmmm-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000004', '2026-04-30', 518700,      0, 'dca',      NULL,                                   false, NULL),
  ('mmmmmmmm-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000005', '2026-05-28',  67340,  22180, 'customer', NULL,                                   false, NULL),
  ('mmmmmmmm-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000007', '2026-05-31', 112400,      0, 'manual',   'aaaaaaaa-0000-0000-0000-000000000001', false, NULL),
  ('mmmmmmmm-0000-0000-0000-000000000010', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000008', '2026-05-31', 335600,  98200, 'manual',   'aaaaaaaa-0000-0000-0000-000000000005', false, 'Higher than normal - tax season crunch'),
  ('mmmmmmmm-0000-0000-0000-000000000011', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000009', '2026-05-31',  44100,  88750, 'manual',   'aaaaaaaa-0000-0000-0000-000000000001', false, NULL),
  ('mmmmmmmm-0000-0000-0000-000000000012', '11111111-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000010', '2026-05-31',  98200,  31500, 'dca',      NULL,                                   false, NULL)
ON CONFLICT (id) DO NOTHING;
