import os
import io
import openpyxl
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional, List, Dict, Any

from backend.models.client import ClientProfile, OverrideRequest, VendorNoticeRequest
from backend.storage.store import store
from backend.engine.reconciliation import reconcile_records
from backend.engine.excel_builder import build_reconciliation_workbook

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist")

app = FastAPI(title="Quick2B — AI & Automated GST Reconciliation Platform", version="2.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Quick2B API",
        "app": "Quick2B",
        "version": "2.4.0",
        "user": "Kanhaiya Soni"
    }

@app.get("/api/profile")
def get_user_profile():
    active_client = store.get_active_client()
    return {
        "email": "contact@quick2b.in",
        "name": "CA Kanhaiya Soni & Associates",
        "role": "Chartered Accountant & Tax Auditor",
        "app": "Quick2B",
        "active_client": active_client,
        "clients_count": len(store.get_clients())
    }

# ----------------- Multi-Client Profile Endpoints -----------------

@app.get("/api/clients", response_model=List[ClientProfile])
def list_clients():
    return store.get_clients()

@app.post("/api/clients", response_model=ClientProfile)
def create_client(client: ClientProfile):
    data = client.model_dump()
    new_client = store.add_client(data)
    return new_client

@app.put("/api/clients/{client_id}")
def update_client(client_id: str, client: ClientProfile):
    updated = store.update_client(client_id, client.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Client not found")
    return updated

@app.delete("/api/clients/{client_id}")
def delete_client(client_id: str):
    success = store.delete_client(client_id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot delete client or only 1 client remaining")
    return {"message": "Client deleted successfully", "active_client": store.get_active_client()}

@app.post("/api/clients/{client_id}/switch")
def switch_active_client(client_id: str):
    client = store.switch_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": f"Switched to {client['name']}", "active_client": client}

# ----------------- Reconciliation Endpoints -----------------

@app.get("/api/reconciliation")
def get_current_reconciliation():
    active = store.get_active_client()
    cid = active["id"] if active else "client-1"
    reco = store.get_reconciliation(cid)
    return {
        "client": active,
        "kpis": reco.get("kpis", {}),
        "summary_matrix": reco.get("summary_matrix", {}),
        "total_records": len(reco.get("items", [])),
        "items": reco.get("items", [])
    }

def read_excel_file_rows(file_bytes: bytes) -> List[Dict[str, Any]]:
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
    ws = wb.active
    headers = [str(ws.cell(1, c).value or "").strip() for c in range(1, ws.max_column+1)]
    rows = []
    for r in range(2, ws.max_row+1):
        row_dict = {}
        for c in range(1, ws.max_column+1):
            val = ws.cell(r, c).value
            row_dict[headers[c-1]] = val
        if any(v is not None for v in row_dict.values()):
            rows.append(row_dict)
    return rows

@app.post("/api/reconcile")
async def reconcile_files(
    books_file: UploadFile = File(...),
    twob_file: UploadFile = File(...),
    client_id: Optional[str] = Form(None)
):
    cid = client_id or store.active_client_id
    try:
        books_bytes = await books_file.read()
        twob_bytes = await twob_file.read()

        books_rows = read_excel_file_rows(books_bytes)
        twob_rows = read_excel_file_rows(twob_bytes)

        if not books_rows:
            raise HTTPException(status_code=400, detail="Books Dump file is empty or invalid.")
        if not twob_rows:
            raise HTTPException(status_code=400, detail="GSTR 2B Dump file is empty or invalid.")

        reco_result = reconcile_records(books_rows, twob_rows)
        store.set_reconciliation(cid, reco_result)

        return {
            "status": "success",
            "message": f"Successfully reconciled {len(books_rows)} Books rows against {len(twob_rows)} GSTR-2B rows.",
            "kpis": reco_result["kpis"],
            "summary_matrix": reco_result["summary_matrix"],
            "items_count": len(reco_result["items"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reconciliation error: {str(e)}")

@app.post("/api/override")
def apply_override(req: OverrideRequest):
    cid = store.active_client_id
    reco = store.get_reconciliation(cid)
    items = reco.get("items", [])

    updated = False
    for item in items:
        if item["id"] == req.row_id:
            if req.manual_knock_off is not None:
                item["manual_knock_off"] = req.manual_knock_off
                if req.manual_knock_off in ["Knock Off", "Direct"]:
                    item["status"] = "Matched"
                elif req.manual_knock_off == "RCM":
                    item["status"] = "RCM Applicable"
                elif round(item["diff"], 0) == 0:
                    item["status"] = "Matched"
                elif item["total_gst_books"] == 0:
                    item["status"] = "Not found in Books"
                elif item["total_gst_2b"] == 0:
                    item["status"] = "Not found in 2B"
                else:
                    item["status"] = "Mismatch"

            if req.month_2b is not None:
                item["month_2b"] = req.month_2b
            if req.claimed_month_3b is not None:
                item["claimed_month_3b"] = req.claimed_month_3b
            if req.reversed_4b2 is not None:
                item["reversed_4b2"] = req.reversed_4b2
            if req.reclaimed_4d1 is not None:
                item["reclaimed_4d1"] = req.reclaimed_4d1
            if req.special_remark is not None:
                item["special_remark"] = req.special_remark
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Row not found")

    reco["kpis"]["matched_count"] = sum(1 for r in items if r["status"] == "Matched")
    reco["kpis"]["not_in_books_count"] = sum(1 for r in items if r["status"] == "Not found in Books")
    reco["kpis"]["not_in_2b_count"] = sum(1 for r in items if r["status"] == "Not found in 2B")
    reco["kpis"]["mismatch_count"] = sum(1 for r in items if r["status"] == "Mismatch")
    reco["kpis"]["rcm_count"] = sum(1 for r in items if r["status"] == "RCM Applicable")

    store.set_reconciliation(cid, reco)
    return {"status": "success", "row": item, "kpis": reco["kpis"]}

@app.get("/api/export")
def export_consolidated_excel():
    active = store.get_active_client()
    cid = active["id"] if active else "client-1"
    client_name = active["name"] if active else "Client"
    fy = active.get("fy", "2025-26") if active else "2025-26"

    reco = store.get_reconciliation(cid)
    items = reco.get("items", [])
    if not items:
        raise HTTPException(status_code=400, detail="No reconciliation data found to export. Please upload Books and 2B files first.")

    data_dir = os.path.join(BASE_DIR, "data")
    os.makedirs(data_dir, exist_ok=True)
    temp_path = os.path.join(data_dir, f"export_{cid}.xlsx")
    build_reconciliation_workbook(items, temp_path)

    filename = f"GST_Recon_{fy} - {client_name}.xlsx"
    return FileResponse(
        path=temp_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@app.post("/api/vendor-notice")
def generate_vendor_notice(req: VendorNoticeRequest):
    cid = store.active_client_id
    reco = store.get_reconciliation(cid)
    items = reco.get("items", [])

    missing_bills = [
        r for r in items
        if r["status"] == "Not found in 2B" and r["gstin"] == req.gstin
    ]

    total_tax_at_risk = sum(r["igst"] + r["cgst"] + r["sgst"] for r in missing_bills)

    bills_table = ""
    for b in missing_bills:
        bills_table += f"- Invoice No: {b['doc_no']}, Date: {b['doc_date_str']}, Taxable: ₹{b['taxable_value']:,.2f}, GST: ₹{(b['igst']+b['cgst']+b['sgst']):,.2f}\n"

    subject = f"URGENT: Missing Invoices in GSTR-2B Statement - {req.client_name} (GSTIN: {req.gstin})"
    body = f"""Dear Accounts Team ({req.supplier}),

We are conducting the statutory GST Input Tax Credit reconciliation for our client, {req.client_name}.

Upon reviewing our GSTR-2B auto-drafted statement on the GST Portal, we observed that the following purchase invoices issued by your organization have NOT been reflected in our GSTR-2B:

{bills_table}
Total Input Tax Credit (ITC) at risk: ₹{total_tax_at_risk:,.2f}

Under Section 16(2)(aa) of the CGST Act, 2017, our client is legally barred from availing ITC unless the corresponding invoice details are uploaded by the supplier in GSTR-1 / IFF.

Kindly verify your GSTR-1 filings immediately and confirm the return period in which these invoices will be reported, or file them in your upcoming GSTR-1 to prevent ITC loss and interest liability.

Please treat this on top priority.

Warm regards,
CA Kanhaiya Soni & Associates
Tax & Audit Advisory for {req.client_name}
"""
    return {
        "supplier": req.supplier,
        "gstin": req.gstin,
        "missing_count": len(missing_bills),
        "total_tax_at_risk": total_tax_at_risk,
        "subject": subject,
        "body": body
    }

@app.post("/api/reset-sample")
def clear_reconciliation_data():
    store.clear_reconciliation()
    return {"status": "success", "message": "Reconciliation data cleared."}

# Mount static frontend build
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
