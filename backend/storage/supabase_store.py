import os
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("quick2b.supabase")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")).strip()

_supabase_client = None

def get_supabase_client():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not SUPABASE_URL or not SUPABASE_KEY:
        return None

    try:
        from supabase import create_client, Client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info(f"Connected to Supabase at {SUPABASE_URL}")
        return _supabase_client
    except Exception as e:
        logger.warning(f"Could not initialize Supabase client: {e}")
        return None

def is_supabase_enabled() -> bool:
    return bool(SUPABASE_URL and SUPABASE_KEY)

def fetch_clients_from_supabase() -> Optional[List[Dict[str, Any]]]:
    client = get_supabase_client()
    if not client:
        return None
    try:
        res = client.table("quick2b_clients").select("*").execute()
        if res.data:
            return res.data
    except Exception as e:
        logger.error(f"Error fetching clients from Supabase: {e}")
    return None

def upsert_client_to_supabase(client_data: Dict[str, Any]) -> bool:
    client = get_supabase_client()
    if not client:
        return False
    try:
        payload = {
            "id": client_data["id"],
            "name": client_data.get("name", ""),
            "trade_name": client_data.get("trade_name", ""),
            "gstin": client_data.get("gstin", ""),
            "email": client_data.get("email", "contact@quick2b.in"),
            "fy": client_data.get("fy", "2025-26"),
            "contact_person": client_data.get("contact_person", ""),
            "phone": client_data.get("phone", ""),
            "is_active": client_data.get("is_active", False),
            "owner_email": "admin@quick2b.in"
        }
        client.table("quick2b_clients").upsert(payload).execute()
        return True
    except Exception as e:
        logger.error(f"Error upserting client to Supabase: {e}")
        return False

def delete_client_from_supabase(client_id: str) -> bool:
    client = get_supabase_client()
    if not client:
        return False
    try:
        client.table("quick2b_reconciliation_items").delete().eq("client_id", client_id).execute()
        client.table("quick2b_reconciliations").delete().eq("client_id", client_id).execute()
        client.table("quick2b_clients").delete().eq("id", client_id).execute()
        return True
    except Exception as e:
        logger.error(f"Error deleting client from Supabase: {e}")
        return False

def fetch_reconciliation_from_supabase(client_id: str) -> Optional[Dict[str, Any]]:
    client = get_supabase_client()
    if not client:
        return None
    try:
        res = client.table("quick2b_reconciliations").select("*").eq("client_id", client_id).execute()
        if res.data and len(res.data) > 0:
            rec = res.data[0]
            # Fetch items
            items_res = client.table("quick2b_reconciliation_items").select("*").eq("client_id", client_id).execute()
            items = items_res.data or []
            return {
                "client_id": client_id,
                "total_records": rec.get("total_records", len(items)),
                "kpis": rec.get("kpis", {}),
                "summary_matrix": rec.get("summary_matrix", {}),
                "items": items
            }
    except Exception as e:
        logger.error(f"Error fetching reconciliation from Supabase: {e}")
    return None

def save_reconciliation_to_supabase(client_id: str, reco_data: Dict[str, Any]) -> bool:
    client = get_supabase_client()
    if not client:
        return False
    try:
        # 1. Upsert summary
        summary_payload = {
            "client_id": client_id,
            "total_records": reco_data.get("total_records", len(reco_data.get("items", []))),
            "kpis": reco_data.get("kpis", {}),
            "summary_matrix": reco_data.get("summary_matrix", {}),
            "owner_email": "admin@quick2b.in"
        }
        client.table("quick2b_reconciliations").upsert(summary_payload).execute()

        # 2. Batch items if present
        items = reco_data.get("items", [])
        if items:
            client.table("quick2b_reconciliation_items").delete().eq("client_id", client_id).execute()
            db_items = []
            for it in items[:1000]: # Top items
                db_items.append({
                    "client_id": client_id,
                    "row_id": it.get("row_id", 0),
                    "source": it.get("source", ""),
                    "supplier": it.get("supplier", ""),
                    "gstin": it.get("gstin", ""),
                    "doc_type": it.get("doc_type", "Invoice"),
                    "doc_no": str(it.get("doc_no", "")),
                    "doc_date": str(it.get("doc_date", "")),
                    "doc_amount": float(it.get("doc_amount", 0.0) or 0.0),
                    "taxable_val": float(it.get("taxable_val", 0.0) or 0.0),
                    "igst": float(it.get("igst", 0.0) or 0.0),
                    "cgst": float(it.get("cgst", 0.0) or 0.0),
                    "sgst": float(it.get("sgst", 0.0) or 0.0),
                    "diff": float(it.get("diff", 0.0) or 0.0),
                    "status": it.get("status", "Pending"),
                    "month_2b": it.get("month_2b", ""),
                    "txn_month": it.get("txn_month", ""),
                    "claimed_month_3b": it.get("claimed_month_3b", ""),
                    "fy": it.get("fy", "2025-26")
                })
            # Insert in chunks of 100
            for i in range(0, len(db_items), 100):
                client.table("quick2b_reconciliation_items").insert(db_items[i:i+100]).execute()
        return True
    except Exception as e:
        logger.error(f"Error saving reconciliation to Supabase: {e}")
        return False
