-- ========================================================
-- Quick2B: Supabase Database Schema
-- Owner / Lead Auditor: CA Kanhaiya Soni (omizala9471@gmail.com)
-- App: Quick2B — AI & Automated GST Reconciliation Platform
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLIENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.quick2b_clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    trade_name TEXT DEFAULT '',
    gstin TEXT NOT NULL,
    email TEXT DEFAULT 'omizala9471@gmail.com',
    fy TEXT DEFAULT '2025-26',
    contact_person TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT FALSE,
    owner_email TEXT DEFAULT 'omizala9471@gmail.com'
);

-- Index for rapid lookup by GSTIN & Owner
CREATE INDEX IF NOT EXISTS idx_quick2b_clients_gstin ON public.quick2b_clients(gstin);
CREATE INDEX IF NOT EXISTS idx_quick2b_clients_owner ON public.quick2b_clients(owner_email);

-- 2. RECONCILIATION SUMMARY STATE TABLE
CREATE TABLE IF NOT EXISTS public.quick2b_reconciliations (
    client_id TEXT PRIMARY KEY REFERENCES public.quick2b_clients(id) ON DELETE CASCADE,
    total_records INTEGER DEFAULT 0,
    kpis JSONB DEFAULT '{}'::jsonb,
    summary_matrix JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    owner_email TEXT DEFAULT 'omizala9471@gmail.com'
);

-- 3. RECONCILIATION TRANSACTION ITEMS (AUDIT LEDGER)
CREATE TABLE IF NOT EXISTS public.quick2b_reconciliation_items (
    id BIGSERIAL PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES public.quick2b_clients(id) ON DELETE CASCADE,
    row_id INTEGER NOT NULL,
    source TEXT NOT NULL, -- 'Books' or '2B'
    supplier TEXT,
    gstin TEXT,
    doc_type TEXT,
    doc_no TEXT,
    doc_date TEXT,
    doc_amount NUMERIC(15,2) DEFAULT 0.00,
    taxable_val NUMERIC(15,2) DEFAULT 0.00,
    igst NUMERIC(15,2) DEFAULT 0.00,
    cgst NUMERIC(15,2) DEFAULT 0.00,
    sgst NUMERIC(15,2) DEFAULT 0.00,
    diff NUMERIC(15,2) DEFAULT 0.00,
    status TEXT NOT NULL, -- 'Matched', 'Not found in Books', 'Not found in 2B', 'Mismatch'
    month_2b TEXT,
    txn_month TEXT,
    claimed_month_3b TEXT,
    reversal_4b2 NUMERIC(15,2) DEFAULT 0.00,
    reclaim_4d1 NUMERIC(15,2) DEFAULT 0.00,
    manual_knock_off TEXT,
    special_remark TEXT,
    fy TEXT DEFAULT '2025-26',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reco_items_client_id ON public.quick2b_reconciliation_items(client_id);
CREATE INDEX IF NOT EXISTS idx_reco_items_status ON public.quick2b_reconciliation_items(status);
CREATE INDEX IF NOT EXISTS idx_reco_items_gstin ON public.quick2b_reconciliation_items(gstin);
CREATE INDEX IF NOT EXISTS idx_reco_items_month2b ON public.quick2b_reconciliation_items(month_2b);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.quick2b_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick2b_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick2b_reconciliation_items ENABLE ROW LEVEL SECURITY;

-- Allow read/write for all users (or authenticated via Supabase Auth)
CREATE POLICY "Allow public read access to clients" 
ON public.quick2b_clients FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to clients" 
ON public.quick2b_clients FOR ALL USING (true);

CREATE POLICY "Allow public access to reconciliations" 
ON public.quick2b_reconciliations FOR ALL USING (true);

CREATE POLICY "Allow public access to reconciliation_items" 
ON public.quick2b_reconciliation_items FOR ALL USING (true);

-- 5. INITIAL SEED CLIENT PROFILES
INSERT INTO public.quick2b_clients (id, name, trade_name, gstin, email, fy, contact_person, phone, is_active, owner_email)
VALUES 
    ('client-1', 'Shri Mahadev Automobiles', 'Shri Mahadev Automobiles', '08AAACM0000A1Z5', 'omizala9471@gmail.com', '2025-26', 'Mahadev Sharma', '+91 98290 12345', true, 'omizala9471@gmail.com'),
    ('client-2', 'Mahadev Spare Parts & Services', 'Mahadev Spare Parts', '08AAIFI6732P1ZQ', 'omizala9471@gmail.com', '2025-26', 'Kanhaiya Soni', '+91 94280 67890', false, 'omizala9471@gmail.com'),
    ('client-3', 'Rajasthan Auto Spares Ltd', 'Rajasthan Auto Spares', '08ABSPA0764C1ZW', 'omizala9471@gmail.com', '2025-26', 'Rajesh Kumar', '+91 98299 54321', false, 'omizala9471@gmail.com')
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, owner_email = EXCLUDED.owner_email;

-- Output confirmation
SELECT 'Quick2B Supabase Schema successfully deployed for omizala9471@gmail.com' as status;
