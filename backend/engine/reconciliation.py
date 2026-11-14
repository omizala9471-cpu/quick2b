import re
import datetime
from typing import List, Dict, Any, Optional

def parse_date(val: Any) -> Optional[datetime.date]:
    """Parse various date formats into a standard datetime.date."""
    if val is None or val == "":
        return None
    if isinstance(val, datetime.datetime):
        return val.date()
    if isinstance(val, datetime.date):
        return val
    
    val_str = str(val).strip()
    # Try YYYY-MM-DD
    try:
        return datetime.datetime.strptime(val_str[:10], "%Y-%m-%d").date()
    except Exception:
        pass
    
    # Try DD/MM/YYYY
    try:
        parts = val_str.split("/")
        if len(parts) == 3:
            d, m, y = int(parts[0]), int(parts[1]), int(parts[2])
            return datetime.date(y, m, d)
    except Exception:
        pass

    # Try DD-MM-YYYY
    try:
        parts = val_str.split("-")
        if len(parts) == 3 and len(parts[0]) <= 2:
            d, m, y = int(parts[0]), int(parts[1]), int(parts[2])
            return datetime.date(y, m, d)
    except Exception:
        pass

    return None

def clean_doc_no(doc_no: Any) -> str:
    """Standardize document number for exact matching."""
    if doc_no is None:
        return ""
    return str(doc_no).strip()

def get_indian_fy(dt: Optional[datetime.date]) -> str:
    """Calculate Indian Financial Year (April 1 to March 31)."""
    if dt is None:
        return ""
    year = dt.year
    month = dt.month
    if month >= 4:
        next_yy = str(year + 1)[-2:]
        return f"{year}-{next_yy}"
    else:
        curr_yy = str(year)[-2:]
        return f"{year - 1}-{curr_yy}"

def reconcile_records(
    books_rows: List[Dict[str, Any]], 
    twob_rows: List[Dict[str, Any]],
    overrides: Optional[Dict[str, Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Core reconciliation algorithm matching GSTR-2B and Books.
    Calculates exact totals, differences, matching status, and timing details.
    """
    if overrides is None:
        overrides = {}

    # Map for total GST in Books per (GSTIN, DocNo)
    books_gst_map: Dict[tuple, float] = {}
    for row in books_rows:
        gstin = str(row.get("GSTIN/UIN", "")).strip().upper()
        doc_no = clean_doc_no(row.get("Document No.", ""))
        igst = float(row.get("IGST") or 0.0)
        cgst = float(row.get("CGST") or 0.0)
        sgst = float(row.get("SGST") or 0.0)
        tot = igst + cgst + sgst
        key = (gstin, doc_no)
        books_gst_map[key] = books_gst_map.get(key, 0.0) + tot

    # Map for total GST in 2B per (GSTIN, DocNo)
    twob_gst_map: Dict[tuple, float] = {}
    for row in twob_rows:
        gstin = str(row.get("GSTIN/UIN", "")).strip().upper()
        doc_no = clean_doc_no(row.get("Document No.", ""))
        igst = float(row.get("IGST") or 0.0)
        cgst = float(row.get("CGST") or 0.0)
        sgst = float(row.get("SGST") or 0.0)
        tot = igst + cgst + sgst
        key = (gstin, doc_no)
        twob_gst_map[key] = twob_gst_map.get(key, 0.0) + tot

    reconciled_items: List[Dict[str, Any]] = []

    # Process all rows (2B first, then Books, preserving incoming batches)
    all_inputs = [("2B", r) for r in twob_rows] + [("Books", r) for r in books_rows]

    for idx, (source, raw) in enumerate(all_inputs, start=1):
        gstin = str(raw.get("GSTIN/UIN", "")).strip().upper()
        doc_no = clean_doc_no(raw.get("Document No.", ""))
        doc_type = str(raw.get("Document Type", "Invoice")).strip()
        supplier = str(raw.get("Supplier", "")).strip()
        
        doc_date = parse_date(raw.get("Document Date"))
        date_iso = doc_date.strftime("%Y-%m-%d") if doc_date else ""
        doc_date_str = doc_date.strftime("%d/%m/%Y") if doc_date else str(raw.get("Document Date", ""))
        txn_month = doc_date.strftime("%Y-%m") if doc_date else ""
        fy = get_indian_fy(doc_date)

        doc_amt = float(raw.get("Document Amount") or 0.0)
        taxable_val = float(raw.get("Taxable Value") or 0.0)
        igst = float(raw.get("IGST") or 0.0)
        cgst = float(raw.get("CGST") or 0.0)
        sgst = float(raw.get("SGST") or 0.0)

        key = (gstin, doc_no)
        total_gst_in_books = books_gst_map.get(key, 0.0)
        total_gst_in_2b = twob_gst_map.get(key, 0.0)
        diff = total_gst_in_2b - total_gst_in_books

        # Check for overrides
        override_key = f"{source}:{gstin}:{doc_no}"
        user_override = overrides.get(override_key, {})
        manual_knock_off = user_override.get("manual_knock_off", raw.get("manual_knock_off", "-"))

        # Status Logic
        if manual_knock_off in ["Knock Off", "Direct"]:
            status = "Matched"
        elif manual_knock_off == "RCM":
            status = "RCM Applicable"
        elif round(diff, 0) == 0:
            status = "Matched"
        elif round(diff, 0) != 0 and round(total_gst_in_books, 0) == 0:
            status = "Not found in Books"
        elif round(diff, 0) != 0 and round(total_gst_in_2b, 0) == 0:
            status = "Not found in 2B"
        else:
            status = "Mismatch"

        # 2B Month determination
        if source == "2B":
            month_2b = raw.get("2B Month") or user_override.get("month_2b")
            if not month_2b or month_2b == "-":
                month_2b = txn_month
        else:
            month_2b = "Books"

        # 3B Claimed Month determination
        if source == "2B":
            claimed_3b = user_override.get("claimed_month_3b", raw.get("Claimed Month of 3B"))
            if not claimed_3b:
                claimed_3b = month_2b if status == "Matched" else "Pending"
        else:
            claimed_3b = "Books"

        # Reversals & Reclaims (Rule 37A / Table 4(B)(2) & 4(D)(1))
        if source == "2B":
            rev_4b2 = user_override.get("reversed_4b2", raw.get("Reversed in Table 4(B)(2)", "-"))
            rec_4d1 = user_override.get("reclaimed_4d1", raw.get("Reclaimed in Table 4(D)(1)", "-"))
            cdnr_add = user_override.get("cdnr_addback", raw.get("CDNR addback in Gross ITC 4(A)(5)", "-"))
            cdnr_less = user_override.get("cdnr_less", raw.get("CDNR less in Gross ITC 4(A)(5)", "-"))
            remark = user_override.get("special_remark", raw.get("Special Remark", "ok" if status == "Matched" else "Pending"))
        else:
            rev_4b2 = "Books"
            rec_4d1 = "Books"
            cdnr_add = "Books"
            cdnr_less = "Books"
            remark = user_override.get("special_remark", raw.get("Special Remark", "ok"))

        helper = f"{gstin}:{doc_no}:{doc_date_str}" if source == "2B" else "-"

        item = {
            "id": idx,
            "source": source,
            "date_iso": date_iso,
            "supplier": supplier,
            "gstin": gstin,
            "doc_type": doc_type,
            "doc_no": doc_no,
            "doc_date_str": doc_date_str,
            "doc_amount": doc_amt,
            "taxable_value": taxable_val,
            "igst": igst,
            "cgst": cgst,
            "sgst": sgst,
            "total_gst_books": total_gst_in_books,
            "total_gst_2b": total_gst_in_2b,
            "diff": diff,
            "status": status,
            "manual_knock_off": manual_knock_off,
            "txn_month": txn_month,
            "month_2b": month_2b,
            "claimed_month_3b": claimed_3b,
            "reversed_4b2": rev_4b2,
            "reclaimed_4d1": rec_4d1,
            "cdnr_addback": cdnr_add,
            "cdnr_less": cdnr_less,
            "helper": helper,
            "special_remark": remark,
            "fy": fy,
        }
        reconciled_items.append(item)

    # Generate Comparative Matrix: 3B vs 2B vs Books
    summary_matrix = generate_summary_matrix(reconciled_items)

    # Calculate overall KPIs
    tot_2b_gst = sum(r["igst"] + r["cgst"] + r["sgst"] for r in reconciled_items if r["source"] == "2B")
    tot_books_gst = sum(r["igst"] + r["cgst"] + r["sgst"] for r in reconciled_items if r["source"] == "Books")
    matched_gst = sum(r["igst"] + r["cgst"] + r["sgst"] for r in reconciled_items if r["status"] == "Matched" and r["source"] == "2B")
    not_in_books_gst = sum(r["igst"] + r["cgst"] + r["sgst"] for r in reconciled_items if r["status"] == "Not found in Books")
    not_in_2b_gst = sum(r["igst"] + r["cgst"] + r["sgst"] for r in reconciled_items if r["status"] == "Not found in 2B")
    reversals_4b2_total = sum(float(r.get("reversal_4b2") or 0.0) for r in reconciled_items)
    reclaims_4d1_total = sum(float(r.get("reclaim_4d1") or 0.0) for r in reconciled_items)

    kpis = {
        "total_rows": len(reconciled_items),
        "total_2b_rows": sum(1 for r in reconciled_items if r["source"] == "2B"),
        "total_books_rows": sum(1 for r in reconciled_items if r["source"] == "Books"),
        "matched_count": sum(1 for r in reconciled_items if r["status"] == "Matched"),
        "not_in_books_count": sum(1 for r in reconciled_items if r["status"] == "Not found in Books"),
        "not_in_2b_count": sum(1 for r in reconciled_items if r["status"] == "Not found in 2B"),
        "mismatch_count": sum(1 for r in reconciled_items if r["status"] == "Mismatch"),
        "rcm_count": sum(1 for r in reconciled_items if r["status"] == "RCM Applicable"),
        "total_2b_gst": round(tot_2b_gst, 2),
        "total_books_gst": round(tot_books_gst, 2),
        "matched_gst": round(matched_gst, 2),
        "not_in_books_gst": round(not_in_books_gst, 2),
        "not_in_2b_gst": round(not_in_2b_gst, 2),
        "net_diff_gst": round(tot_2b_gst - tot_books_gst, 2),
        "reversals_4b2_total": round(reversals_4b2_total, 2),
        "reclaims_4d1_total": round(reclaims_4d1_total, 2),
    }

    return {
        "items": reconciled_items,
        "summary_matrix": summary_matrix,
        "kpis": kpis
    }

def generate_summary_matrix(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generates month-by-month and quarterly 3B vs 2B vs Books comparison."""
    # Define Months
    all_months = [
        "2025-04", "2025-05", "2025-06",
        "2025-07", "2025-08", "2025-09",
        "2025-10", "2025-11", "2025-12",
        "2026-01", "2026-02", "2026-03",
        "2026-04", "2026-05", "2026-06",
        "2026-07", "2026-08", "2026-09",
        "2026-10", "2026-11", "2026-12",
        "2027-01", "2027-02", "2027-03",
    ]

    month_data = {}
    for m in all_months:
        # As per 2B: sum of 2B records where month_2b == m
        two_b_igst = sum(r["igst"] for r in items if r["source"] == "2B" and r["month_2b"] == m)
        two_b_cgst = sum(r["cgst"] for r in items if r["source"] == "2B" and r["month_2b"] == m)
        two_b_sgst = sum(r["sgst"] for r in items if r["source"] == "2B" and r["month_2b"] == m)

        # As per Books: sum of Books records where txn_month == m, accounting for Debit notes
        b_igst = sum(r["igst"] for r in items if r["source"] == "Books" and r["txn_month"] == m)
        b_cgst = sum(r["cgst"] for r in items if r["source"] == "Books" and r["txn_month"] == m)
        b_sgst = sum(r["sgst"] for r in items if r["source"] == "Books" and r["txn_month"] == m)
        
        # Debit note offset: -(debit * 2)
        deb_igst = sum(r["igst"] for r in items if r["source"] == "Books" and r["txn_month"] == m and r["doc_type"] == "Debit")
        deb_cgst = sum(r["cgst"] for r in items if r["source"] == "Books" and r["txn_month"] == m and r["doc_type"] == "Debit")
        deb_sgst = sum(r["sgst"] for r in items if r["source"] == "Books" and r["txn_month"] == m and r["doc_type"] == "Debit")
        
        books_igst = b_igst - 2 * deb_igst
        books_cgst = b_cgst - 2 * deb_cgst
        books_sgst = b_sgst - 2 * deb_sgst

        # Diff 2B vs Books
        diff_igst = two_b_igst - books_igst
        diff_cgst = two_b_cgst - books_cgst
        diff_sgst = two_b_sgst - books_sgst

        # As per 3B: sum records where claimed_month_3b == m
        three_b_igst = sum(r["igst"] for r in items if r["claimed_month_3b"] == m)
        three_b_cgst = sum(r["cgst"] for r in items if r["claimed_month_3b"] == m)
        three_b_sgst = sum(r["sgst"] for r in items if r["claimed_month_3b"] == m)

        # Diff 2B vs 3B
        diff_3b_igst = two_b_igst - three_b_igst
        diff_3b_cgst = two_b_cgst - three_b_cgst
        diff_3b_sgst = two_b_sgst - three_b_sgst

        month_data[m] = {
            "month": m,
            "two_b": {"igst": round(two_b_igst, 2), "cgst": round(two_b_cgst, 2), "sgst": round(two_b_sgst, 2)},
            "books": {"igst": round(books_igst, 2), "cgst": round(books_cgst, 2), "sgst": round(books_sgst, 2)},
            "diff_books": {"igst": round(diff_igst, 2), "cgst": round(diff_cgst, 2), "sgst": round(diff_sgst, 2)},
            "three_b": {"igst": round(three_b_igst, 2), "cgst": round(three_b_cgst, 2), "sgst": round(three_b_sgst, 2)},
            "diff_3b": {"igst": round(diff_3b_igst, 2), "cgst": round(diff_3b_cgst, 2), "sgst": round(diff_3b_sgst, 2)},
            "three_b_manual": {"igst": 0.0, "cgst": 0.0, "sgst": 0.0},
            "diff_manual": {"igst": round(three_b_igst, 2), "cgst": round(three_b_cgst, 2), "sgst": round(three_b_sgst, 2)},
        }

    return month_data
