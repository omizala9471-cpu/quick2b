from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ClientProfile(BaseModel):
    id: str
    name: str
    trade_name: Optional[str] = ""
    gstin: str
    email: str
    fy: str = "2025-26"
    contact_person: Optional[str] = ""
    phone: Optional[str] = ""
    created_at: Optional[str] = None
    is_active: bool = False

class OverrideRequest(BaseModel):
    row_id: int
    source: str
    gstin: str
    doc_no: str
    manual_knock_off: Optional[str] = None
    month_2b: Optional[str] = None
    claimed_month_3b: Optional[str] = None
    reversed_4b2: Optional[str] = None
    reclaimed_4d1: Optional[str] = None
    cdnr_addback: Optional[str] = None
    cdnr_less: Optional[str] = None
    special_remark: Optional[str] = None

class VendorNoticeRequest(BaseModel):
    supplier: str
    gstin: str
    recipient_email: Optional[str] = None
    client_name: str
