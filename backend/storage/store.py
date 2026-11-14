import json
import os
import openpyxl
from typing import Dict, Any, List, Optional
from backend.engine.reconciliation import reconcile_records
from backend.storage.supabase_store import (
    is_supabase_enabled,
    fetch_clients_from_supabase,
    upsert_client_to_supabase,
    fetch_reconciliation_from_supabase,
    save_reconciliation_to_supabase,
    delete_client_from_supabase
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
STORAGE_FILE = os.path.join(DATA_DIR, "clients_storage.json")

DEFAULT_CLIENTS = [
    {
        "id": "client-1",
        "name": "Shri Mahadev Automobiles",
        "trade_name": "Shri Mahadev Automobiles",
        "gstin": "08AAACM0000A1Z5",
        "email": "info@mahadevauto.com",
        "fy": "2025-26",
        "contact_person": "Mahadev Sharma",
        "phone": "+91 98290 12345",
        "created_at": "2025-04-01",
        "is_active": True
    },
    {
        "id": "client-2",
        "name": "Mahadev Spare Parts & Services",
        "trade_name": "Mahadev Spare Parts",
        "gstin": "08AAIFI6732P1ZQ",
        "email": "kanhaiyasoni@ca.in",
        "fy": "2025-26",
        "contact_person": "Kanhaiya Soni",
        "phone": "+91 94280 67890",
        "created_at": "2025-05-15",
        "is_active": False
    },
    {
        "id": "client-3",
        "name": "Rajasthan Auto Spares Ltd",
        "trade_name": "Rajasthan Auto Spares",
        "gstin": "08ABSPA0764C1ZW",
        "email": "contact@rajasthanautospares.in",
        "fy": "2025-26",
        "contact_person": "Rajesh Kumar",
        "phone": "+91 98299 54321",
        "created_at": "2025-06-01",
        "is_active": False
    }
]

EMPTY_RECO_DATA = {
    "items": [],
    "summary_matrix": {},
    "kpis": {
        "total_rows": 0, "total_2b_rows": 0, "total_books_rows": 0,
        "matched_count": 0, "not_in_books_count": 0, "not_in_2b_count": 0,
        "mismatch_count": 0, "rcm_count": 0, "total_2b_gst": 0.0,
        "total_books_gst": 0.0, "matched_gst": 0.0, "not_in_books_gst": 0.0,
        "not_in_2b_gst": 0.0, "net_diff_gst": 0.0,
        "reversals_4b2_total": 0.0, "reclaims_4d1_total": 0.0
    }
}

class AppStore:
    def __init__(self):
        self.clients: List[Dict[str, Any]] = []
        self.active_client_id: str = "client-1"
        self.client_reconciliation: Dict[str, Any] = {}
        self.load_storage()
        # Clean start with zero sample data

    def load_storage(self):
        if is_supabase_enabled():
            sb_clients = fetch_clients_from_supabase()
            if sb_clients:
                self.clients = sb_clients
                self.active_client_id = self.clients[0]["id"]
                return

        if os.path.exists(STORAGE_FILE):
            try:
                with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.clients = data.get("clients", DEFAULT_CLIENTS)
                    self.active_client_id = data.get("active_client_id", "client-1")
                    return
            except Exception as e:
                print(f"Error loading storage file: {e}")
        self.clients = DEFAULT_CLIENTS
        self.active_client_id = "client-1"
        self.save_storage()

    def save_storage(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        try:
            with open(STORAGE_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "clients": self.clients,
                    "active_client_id": self.active_client_id
                }, f, indent=2)
        except Exception as e:
            print(f"Error saving storage: {e}")

        if is_supabase_enabled():
            for c in self.clients:
                upsert_client_to_supabase(c)

    def get_clients(self) -> List[Dict[str, Any]]:
        return self.clients

    def get_active_client(self) -> Optional[Dict[str, Any]]:
        for c in self.clients:
            if c["id"] == self.active_client_id:
                return c
        if self.clients:
            return self.clients[0]
        return None

    def switch_client(self, client_id: str) -> Optional[Dict[str, Any]]:
        found = False
        for c in self.clients:
            if c["id"] == client_id:
                c["is_active"] = True
                self.active_client_id = client_id
                found = True
            else:
                c["is_active"] = False
        if found:
            self.save_storage()
            if client_id not in self.client_reconciliation:
                self.client_reconciliation[client_id] = dict(EMPTY_RECO_DATA)
            return self.get_active_client()
        return None

    def add_client(self, client_data: Dict[str, Any]) -> Dict[str, Any]:
        new_id = f"client-{len(self.clients) + 1}"
        client_data["id"] = new_id
        client_data["is_active"] = False
        self.clients.append(client_data)
        self.save_storage()
        return client_data

    def update_client(self, client_id: str, client_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for idx, c in enumerate(self.clients):
            if c["id"] == client_id:
                client_data["id"] = client_id
                client_data["is_active"] = c.get("is_active", False)
                self.clients[idx] = client_data
                self.save_storage()
                return self.clients[idx]
        return None

    def delete_client(self, client_id: str) -> bool:
        if len(self.clients) <= 1:
            return False # Keep at least one client
        self.clients = [c for c in self.clients if c["id"] != client_id]
        if self.active_client_id == client_id:
            self.active_client_id = self.clients[0]["id"]
            self.clients[0]["is_active"] = True
        self.client_reconciliation.pop(client_id, None)
        self.save_storage()
        if is_supabase_enabled():
            delete_client_from_supabase(client_id)
        return True

    def clear_reconciliation(self, client_id: Optional[str] = None):
        """Clears reconciliation records for clean state."""
        cid = client_id or self.active_client_id
        self.client_reconciliation[cid] = {
            "items": [],
            "summary_matrix": {},
            "kpis": {
                "total_rows": 0, "total_2b_rows": 0, "total_books_rows": 0,
                "matched_count": 0, "not_in_books_count": 0, "not_in_2b_count": 0,
                "mismatch_count": 0, "rcm_count": 0, "total_2b_gst": 0.0,
                "total_books_gst": 0.0, "net_diff_gst": 0.0,
                "reversals_4b2_total": 0.0, "reclaims_4d1_total": 0.0
            }
        }

    def get_reconciliation(self, client_id: Optional[str] = None) -> Dict[str, Any]:
        cid = client_id or self.active_client_id
        if cid not in self.client_reconciliation and is_supabase_enabled():
            sb_data = fetch_reconciliation_from_supabase(cid)
            if sb_data:
                self.client_reconciliation[cid] = sb_data

        return self.client_reconciliation.get(cid, {
            "items": [],
            "summary_matrix": {},
            "kpis": {
                "total_rows": 0, "total_2b_rows": 0, "total_books_rows": 0,
                "matched_count": 0, "not_in_books_count": 0, "not_in_2b_count": 0,
                "mismatch_count": 0, "rcm_count": 0, "total_2b_gst": 0.0,
                "total_books_gst": 0.0, "matched_gst": 0.0, "not_in_books_gst": 0.0,
                "not_in_2b_gst": 0.0, "net_diff_gst": 0.0,
                "reversals_4b2_total": 0.0, "reclaims_4d1_total": 0.0
            }
        })

    def set_reconciliation(self, client_id: str, reco_data: Dict[str, Any]):
        self.client_reconciliation[client_id] = reco_data
        if is_supabase_enabled():
            save_reconciliation_to_supabase(client_id, reco_data)

store = AppStore()
