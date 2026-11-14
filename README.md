# Quick2B — AI & Automated GST Reconciliation Platform

**Product Name:** Quick2B  
**Lead Auditor / Owner:** CA Kanhaiya Soni & Associates (`omizala9471@gmail.com`)  
**Version:** v2.4 Enterprise  
**Cloud Hosting:** Vercel (Frontend & Serverless Engine) + Supabase (PostgreSQL Database & Auth)  

---

## 🚀 Overview

**Quick2B** is an automated web platform built for Chartered Accountants (CAs), Tax Auditors, and Finance Teams to reconcile GST Input Tax Credit (ITC) between:
1. **GSTR-2B Statement** (Auto-drafted government portal ITC).
2. **Purchase Register / Books of Accounts** (TallyPrime, Busy, Zoho Books, SAP, ERP).

Quick2B enforces statutory compliance under **Section 16(2)(aa)** and **Rule 37A** of the CGST Act, generating live comparative matrices, vendor defaulter demand notices, and a **5-sheet consolidated Excel workbook with native formulas (`SUMIFS`, `SUBTOTAL`, `FILTER`) and color-coded conditional formatting**.

---

## ⚡ Deployment: Vercel & Supabase

### 1. Supabase Database Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor** in the Supabase Dashboard.
3. Open and execute [`supabase/schema.sql`](./supabase/schema.sql) in this repository.
4. Copy your **Project URL** and **API Keys** (`anon` public key or `service_role` key).
5. Set environment variables:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-supabase-key
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### 2. Vercel Hosting Setup
1. Push this repository to GitHub or deploy via Vercel CLI.
2. In the Vercel dashboard (or `vercel deploy`):
   - **Framework Preset**: Other / Vite
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Environment Variables**: Add `SUPABASE_URL` and `SUPABASE_KEY`.
3. Vercel automatically routes `/api/*` to Python serverless functions via [`vercel.json`](./vercel.json) and [`api/index.py`](./api/index.py).

---

## 💻 Local Development

### 1-Click Launcher (Windows)
Double-click `run_app.bat` to launch on `http://localhost:8000`.

### Manual CLI Start
```bash
# 1. Build frontend
cd frontend
npm install
npm run build
cd ..

# 2. Run backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
Open **`http://localhost:8000`** in your browser.

---

## 📊 Core Capabilities

1. **Multi-Client Portfolio Switching**:
   - Manage multiple company profiles (e.g., *Shri Mahadev Automobiles*, *Mahadev Spare Parts & Services*).
   - Independent reconciliation history, GSTIN, and financial year (FY) per client profile.

2. **Automated Dual-Dump Ingestion**:
   - Ingests `Books Dump.xlsx` and `GSTR 2B Dump.xlsx`.
   - Normalizes date strings (`DD/MM/YYYY` vs ISO `YYYY-MM-DD`), negative credit notes, and supplier names.

3. **Parity Engine & Rule 37A Timing**:
   - **Matched Invoices**: Eligible for GSTR-3B claim.
   - **Missing in Books**: In 2B but unbooked in accounting.
   - **Blocked ITC Leaks**: Booked in accounts, but vendor has NOT filed GSTR-1 (Section 16(2)(aa) exposure).
   - **Table 4(B)(2) Reversals & 4(D)(1) Reclaims**.

4. **Vendor Defaulter Demand Generator**:
   - Instant calculation of tax exposure for unfiled vendor invoices.
   - 1-click statutory notice generator citing Section 16(2)(aa) with copy/email capability.

5. **5-Sheet Consolidated Excel Exporter**:
   - **Sheet 1**: `3B vs 2B vs Books` (Annual & quarterly comparative matrix).
   - **Sheet 2**: `Invoice_Recon` (Full transaction ledger with live `SUMIFS`, `Diff`, and status).
   - **Sheet 3**: `Mismatched` (`=FILTER(...)` dynamic array).
   - **Sheet 4**: `Not found in 2B` (`=FILTER(...)` dynamic array).
   - **Sheet 5**: `Not found in Books` (`=FILTER(...)` dynamic array).
