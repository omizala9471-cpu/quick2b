import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.utils import get_column_letter
from typing import List, Dict, Any

CURRENCY_FORMAT = '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)'

# Fills & Colors matching benchmark
YELLOW_FILL = PatternFill(start_color="FFFFFF00", end_color="FFFFFF00", fill_type="solid")
HEADER_GRAY_FILL = PatternFill(start_color="FFE0E0E0", end_color="FFE0E0E0", fill_type="solid")
SUBTOTAL_FILL = PatternFill(start_color="FFF2F2F2", end_color="FFF2F2F2", fill_type="solid")

GREEN_FILL = PatternFill(start_color="FFC6EFCE", end_color="FFC6EFCE", fill_type="solid")
GREEN_FONT = Font(color="FF006100", name="Calibri", size=10)

AMBER_FILL = PatternFill(start_color="FFFFEB9C", end_color="FFFFEB9C", fill_type="solid")
AMBER_FONT = Font(color="FF9C5700", name="Calibri", size=10)

RED_FILL = PatternFill(start_color="FFFFC7CE", end_color="FFFFC7CE", fill_type="solid")
RED_FONT = Font(color="FF9C0006", name="Calibri", size=10)

BOLD_FONT = Font(name="Calibri", size=11, bold=True)
HEADER_FONT = Font(name="Calibri", size=10, bold=True)
REGULAR_FONT = Font(name="Calibri", size=10)

THIN_BORDER = Border(
    left=Side(style='thin', color='FFD3D3D3'),
    right=Side(style='thin', color='FFD3D3D3'),
    top=Side(style='thin', color='FFD3D3D3'),
    bottom=Side(style='thin', color='FFD3D3D3')
)

DOUBLE_BOTTOM_BORDER = Border(
    top=Side(style='thin', color='FF000000'),
    bottom=Side(style='double', color='FF000000')
)

def build_reconciliation_workbook(items: List[Dict[str, Any]], output_path: str):
    """
    Constructs the exact 5-sheet consolidated Excel workbook:
    1. 3B vs 2B vs Books
    2. Invoice_Recon
    3. Mismatched
    4. Not found in 2B
    5. Not found in Books
    """
    wb = openpyxl.Workbook()
    # Remove default sheet
    wb.remove(wb.active)

    # 1. Create Sheet: 3B vs 2B vs Books
    ws_summary = wb.create_sheet(title="3B vs 2B vs Books")
    build_summary_sheet(ws_summary)

    # 2. Create Sheet: Invoice_Recon
    ws_recon = wb.create_sheet(title="Invoice_Recon")
    build_recon_sheet(ws_recon, items)

    # 3. Create Sheet: Mismatched
    ws_mismatch = wb.create_sheet(title="Mismatched")
    build_filter_sheet(ws_mismatch, items, "mismatch", "2B")

    # 4. Create Sheet: Not found in 2B
    ws_not_in_2b = wb.create_sheet(title="Not found in 2B")
    build_filter_sheet(ws_not_in_2b, items, "Not found in 2B", "Books")

    # 5. Create Sheet: Not found in Books
    ws_not_in_books = wb.create_sheet(title="Not found in Books")
    build_filter_sheet(ws_not_in_books, items, "Not found in Books", "2B")

    wb.save(output_path)
    return output_path

def build_summary_sheet(ws):
    """Constructs Sheet 1: 3B vs 2B vs Books with exact formulas."""
    ws.views.sheetView[0].showGridLines = True

    # Row 1: Top Totals
    cols = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V"]
    for col in cols:
        ws[f"{col}1"] = f"=+{col}9+{col}14+{col}19+{col}24"
        ws[f"{col}1"].font = BOLD_FONT
        ws[f"{col}1"].number_format = CURRENCY_FORMAT

    # Row 3: Super Headers
    super_headers = [
        (2, "As per 2B"), (5, "As per Books"), (8, "Diff. 2B vs Books"),
        (11, "As per 3B"), (14, "Diff. 2B vs 3B"), (17, "As per 3B (Manual)"), (20, "Diff. 3B vs 3B(M)")
    ]
    for col_idx, text in super_headers:
        c = ws.cell(3, col_idx, text)
        c.font = BOLD_FONT
        c.alignment = Alignment(horizontal="center")

    # Row 5: Column Sub-Headers
    sub_headers = ["Month\nYYYY-MM"] + ["IGST", "CGST", "SGST"] * 7
    for col_idx, h in enumerate(sub_headers, 1):
        c = ws.cell(5, col_idx, h)
        c.font = HEADER_FONT
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.fill = HEADER_GRAY_FILL

    # Row layout for Months, Quarters, and FYs
    row_layout = [
        # (row_num, type, label, sum_range)
        (6, "month", "2025-04", None),
        (7, "month", "2025-05", None),
        (8, "month", "2025-06", None),
        (9, "quarter", "QTR-1", (6, 8)),
        (11, "month", "2025-07", None),
        (12, "month", "2025-08", None),
        (13, "month", "2025-09", None),
        (14, "quarter", "QTR-2", (11, 13)),
        (16, "month", "2025-10", None),
        (17, "month", "2025-11", None),
        (18, "month", "2025-12", None),
        (19, "quarter", "QTR-3", (16, 18)),
        (21, "month", "2026-01", None),
        (22, "month", "2026-02", None),
        (23, "month", "2026-03", None),
        (24, "quarter", "QTR-4", (21, 23)),
        (26, "fy", "FY25-26", [9, 14, 19, 24]),
        (28, "month", "2026-04", None),
        (29, "month", "2026-05", None),
        (30, "month", "2026-06", None),
        (31, "quarter", "QTR-1", (28, 30)),
        (33, "month", "2026-07", None),
        (34, "month", "2026-08", None),
        (35, "month", "2026-09", None),
        (36, "quarter", "QTR-2", (33, 35)),
        (38, "month", "2026-10", None),
        (39, "month", "2026-11", None),
        (40, "month", "2026-12", None),
        (41, "quarter", "QTR-3", (38, 40)),
        (43, "month", "2027-01", None),
        (44, "month", "2027-02", None),
        (45, "month", "2027-03", None),
        (46, "quarter", "QTR-4", (43, 45)),
        (48, "fy", "FY26-27", [31, 36, 41, 46]),
    ]

    for r, row_type, label, param in row_layout:
        ws.cell(r, 1, label).font = BOLD_FONT if row_type in ["quarter", "fy"] else REGULAR_FONT
        
        if row_type == "month":
            # 2B Formulas (B, C, D)
            ws.cell(r, 2, f"=+SUMIFS(Invoice_Recon!$J:$J,Invoice_Recon!$S:$S,'3B vs 2B vs Books'!$A{r})")
            ws.cell(r, 3, f"=+SUMIFS(Invoice_Recon!$K:$K,Invoice_Recon!$S:$S,'3B vs 2B vs Books'!$A{r})")
            ws.cell(r, 4, f"=+SUMIFS(Invoice_Recon!$L:$L,Invoice_Recon!$S:$S,'3B vs 2B vs Books'!$A{r})")
            
            # Books Formulas (E, F, G) with Debit adjustment -(Debit*2)
            for c_idx, tax_col in [(5, "$J:$J"), (6, "$K:$K"), (7, "$L:$L")]:
                ws.cell(r, c_idx, f"=+SUMIFS(Invoice_Recon!{tax_col},Invoice_Recon!$R:$R,'3B vs 2B vs Books'!$A{r},Invoice_Recon!A:A,\"Books\")-(SUMIFS(Invoice_Recon!{tax_col},Invoice_Recon!$R:$R,'3B vs 2B vs Books'!$A{r},Invoice_Recon!A:A,\"Books\",Invoice_Recon!E:E,\"Debit\")*2)")
            
            # Diff 2B vs Books (H, I, J)
            ws.cell(r, 8, f"=+B{r}-E{r}")
            ws.cell(r, 9, f"=+C{r}-F{r}")
            ws.cell(r, 10, f"=+D{r}-G{r}")

            # As per 3B (K, L, M)
            ws.cell(r, 11, f"=+SUMIFS(Invoice_Recon!$J:$J,Invoice_Recon!$T:$T,'3B vs 2B vs Books'!$A{r})")
            ws.cell(r, 12, f"=+SUMIFS(Invoice_Recon!$K:$K,Invoice_Recon!$T:$T,'3B vs 2B vs Books'!$A{r})")
            ws.cell(r, 13, f"=+SUMIFS(Invoice_Recon!$L:$L,Invoice_Recon!$T:$T,'3B vs 2B vs Books'!$A{r})")

            # Diff 2B vs 3B (N, O, P)
            ws.cell(r, 14, f"=+B{r}-K{r}")
            ws.cell(r, 15, f"=+C{r}-L{r}")
            ws.cell(r, 16, f"=+D{r}-M{r}")

            # As per 3B Manual (Q, R, S) default 0
            ws.cell(r, 17, 0)
            ws.cell(r, 18, 0)
            ws.cell(r, 19, 0)

            # Diff 3B vs 3B(M) (T, U, V)
            ws.cell(r, 20, f"=+K{r}-Q{r}")
            ws.cell(r, 21, f"=+L{r}-R{r}")
            ws.cell(r, 22, f"=+M{r}-S{r}")

        elif row_type == "quarter":
            start_r, end_r = param
            for c_idx in range(2, 23):
                col_l = get_column_letter(c_idx)
                cell = ws.cell(r, c_idx, f"=SUM({col_l}{start_r}:{col_l}{end_r})")
                cell.font = BOLD_FONT
                cell.fill = SUBTOTAL_FILL

        elif row_type == "fy":
            q_rows = param
            for c_idx in range(2, 23):
                col_l = get_column_letter(c_idx)
                f_str = "=+" + "+".join([f"{col_l}{qr}" for qr in q_rows])
                cell = ws.cell(r, c_idx, f_str)
                cell.font = BOLD_FONT
                cell.border = DOUBLE_BOTTOM_BORDER

        # Format numbers
        for c_idx in range(2, 23):
            ws.cell(r, c_idx).number_format = CURRENCY_FORMAT

    # Conditional Formatting: Highlight negative differences (< 0) in soft red
    diff_rule = CellIsRule(operator='lessThan', formula=['0'], fill=RED_FILL, font=RED_FONT)
    ws.conditional_formatting.add("H6:J48", diff_rule)
    ws.conditional_formatting.add("N6:P48", diff_rule)
    ws.conditional_formatting.add("T6:V48", diff_rule)

    # Column widths
    ws.column_dimensions['A'].width = 16
    for c_idx in range(2, 23):
        col_l = get_column_letter(c_idx)
        ws.column_dimensions[col_l].width = 14

def build_recon_sheet(ws, items: List[Dict[str, Any]]):
    """Constructs Sheet 2: Invoice_Recon with all 27 columns and formulas."""
    ws.views.sheetView[0].showGridLines = True

    # Row 1 Subtotals
    ws["I1"] = "=+SUBTOTAL(9,I3:I50400)"
    ws["J1"] = "=+SUBTOTAL(9,J3:J50400)"
    ws["K1"] = "=+SUBTOTAL(9,K3:K50400)"
    ws["L1"] = "=+SUBTOTAL(9,L3:L50400)"
    ws["M1"] = "=+SUBTOTAL(9,M3:M50400)"
    ws["N1"] = "=+SUBTOTAL(9,N3:N50400)"
    ws["P1"] = "=+SUM(J1:L1)"
    ws["S1"] = "=+R1-K1"
    ws["U1"] = "=+SUBTOTAL(9,U3:U50400)"
    ws["V1"] = "=+SUBTOTAL(9,V3:V50400)"

    for col in ["I", "J", "K", "L", "M", "N", "P", "S", "U", "V"]:
        ws[f"{col}1"].font = BOLD_FONT
        ws[f"{col}1"].number_format = CURRENCY_FORMAT

    # Row 3 Headers
    headers = [
        "Data by", "Date\nYYYY-MM-DD", "Supplier", "GSTIN/UIN", "Document Type",
        "Document No.", "Document Date", "Document Amount", "Taxable Value",
        "IGST", "CGST", "SGST", "Total GST in Books", "Total GST in 2B",
        "Diff.", "Matching Status", "Manual Knock Off", "Txn Month\nYYYY-MM",
        "2B Month\nYYYY-MM", "Claimed Month of 3B", "Reversed in Table 4(B)(2)",
        "Reclaimed in Table 4(D)(1)", "CDNR addback \nin Gross ITC\n4(A)(5)",
        "CDNR less \nin Gross ITC\n4(A)(5)", "Helper", "Special Remark", "FY"
    ]
    
    yellow_cols = {2, 13, 14, 15, 16, 18, 25, 27} # Computed / Derived columns

    for idx, h in enumerate(headers, 1):
        cell = ws.cell(3, idx, h)
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.fill = YELLOW_FILL if idx in yellow_cols else HEADER_GRAY_FILL
        cell.border = THIN_BORDER

    # Populate Data Rows (Row 4..)
    for row_idx, item in enumerate(items, start=4):
        ws.cell(row_idx, 1, item["source"])
        ws.cell(row_idx, 2, f'=+TEXT(G{row_idx},"YYYY-MM-DD")')
        ws.cell(row_idx, 3, item["supplier"])
        ws.cell(row_idx, 4, item["gstin"])
        ws.cell(row_idx, 5, item["doc_type"])
        ws.cell(row_idx, 6, item["doc_no"])
        ws.cell(row_idx, 7, item["doc_date_str"])
        ws.cell(row_idx, 8, item["doc_amount"])
        ws.cell(row_idx, 9, item["taxable_value"])
        ws.cell(row_idx, 10, item["igst"])
        ws.cell(row_idx, 11, item["cgst"])
        ws.cell(row_idx, 12, item["sgst"])

        # Live SUMIFS Formulas for Total GST
        ws.cell(row_idx, 13, f'=SUMIFS(J:J,D:D,D{row_idx},A:A,"Books",F:F,F{row_idx})+SUMIFS(K:K,D:D,D{row_idx},A:A,"Books",F:F,F{row_idx})+SUMIFS(L:L,D:D,D{row_idx},A:A,"Books",F:F,F{row_idx})')
        ws.cell(row_idx, 14, f'=+SUMIFS(J:J,D:D,D{row_idx},A:A,"2B",F:F,F{row_idx})+SUMIFS(K:K,D:D,D{row_idx},A:A,"2B",F:F,F{row_idx})+SUMIFS(L:L,D:D,D{row_idx},A:A,"2B",F:F,F{row_idx})')
        ws.cell(row_idx, 15, f'=+N{row_idx}-M{row_idx}')

        # Dynamic Status Formula
        ws.cell(row_idx, 16, f'=+IF(OR(Q{row_idx}="Knock Off",Q{row_idx}="Direct"),"Matched",+IF(Q{row_idx}="RCM","RCM Applicable",+IF(ROUND(O{row_idx},0)=0,"Matched",+IF(AND(ROUND(O{row_idx},0)<>0,ROUND(M{row_idx},0)=0),"Not found in Books",+IF(AND(ROUND(O{row_idx},0)<>0,ROUND(N{row_idx},0)=0),"Not found in 2B","Mismatch")))))')

        ws.cell(row_idx, 17, item["manual_knock_off"])
        ws.cell(row_idx, 18, f'=+TEXT(G{row_idx},"YYYY-MM")')
        ws.cell(row_idx, 19, item["month_2b"])
        ws.cell(row_idx, 20, item["claimed_month_3b"])
        ws.cell(row_idx, 21, item["reversed_4b2"])
        ws.cell(row_idx, 22, item["reclaimed_4d1"])
        ws.cell(row_idx, 23, item["cdnr_addback"])
        ws.cell(row_idx, 24, item["cdnr_less"])
        ws.cell(row_idx, 25, f'=IF(A{row_idx}="2B",+D{row_idx}&":"&F{row_idx}&":"&G{row_idx},"-")')
        ws.cell(row_idx, 26, item["special_remark"])
        ws.cell(row_idx, 27, item["fy"])

        # Number Formatting
        for col_i in range(8, 16):
            ws.cell(row_idx, col_i).number_format = CURRENCY_FORMAT

    # Conditional Formatting for Matching Status (Col P)
    rule_matched = FormulaRule(formula=['NOT(ISERROR(SEARCH("Matched",P4)))'], fill=GREEN_FILL, font=GREEN_FONT)
    rule_not_books = FormulaRule(formula=['NOT(ISERROR(SEARCH("Not found in Books",P4)))'], fill=AMBER_FILL, font=AMBER_FONT)
    rule_not_2b = FormulaRule(formula=['NOT(ISERROR(SEARCH("Not found in 2B",P4)))'], fill=RED_FILL, font=RED_FONT)
    rule_mismatch = FormulaRule(formula=['NOT(ISERROR(SEARCH("Mismatch",P4)))'], fill=RED_FILL, font=RED_FONT)

    last_r = len(items) + 3
    cf_range = f"P4:P{last_r}"
    ws.conditional_formatting.add(cf_range, rule_matched)
    ws.conditional_formatting.add(cf_range, rule_not_books)
    ws.conditional_formatting.add(cf_range, rule_not_2b)
    ws.conditional_formatting.add(cf_range, rule_mismatch)

    # Column Widths
    col_widths = {
        'A': 10, 'B': 14, 'C': 30, 'D': 18, 'E': 14, 'F': 18, 'G': 14,
        'H': 16, 'I': 16, 'J': 12, 'K': 12, 'L': 12, 'M': 18, 'N': 18,
        'O': 14, 'P': 18, 'Q': 16, 'R': 14, 'S': 14, 'T': 18, 'U': 22,
        'V': 22, 'W': 20, 'X': 20, 'Y': 32, 'Z': 14, 'AA': 12
    }
    for col_l, width in col_widths.items():
        ws.column_dimensions[col_l].width = width

def build_filter_sheet(ws, items: List[Dict[str, Any]], filter_status: str, source_filter: str):
    """Constructs dynamic filtered sheets (Mismatched, Not found in 2B, Not found in Books)."""
    ws.views.sheetView[0].showGridLines = True

    # Row 1 Subtotals
    ws["I1"] = "=+SUBTOTAL(9,I3:I99774)"
    ws["J1"] = "=+SUBTOTAL(9,J3:J99774)"
    ws["K1"] = "=+SUBTOTAL(9,K3:K99774)"
    ws["L1"] = "=+SUBTOTAL(9,L3:L99774)"
    ws["M1"] = "=+SUBTOTAL(9,M3:M99774)"
    ws["N1"] = "=+SUBTOTAL(9,N3:N99774)"
    ws["P1"] = "=+SUM(J1:L1)"

    for col in ["I", "J", "K", "L", "M", "N", "P"]:
        ws[f"{col}1"].font = BOLD_FONT
        ws[f"{col}1"].number_format = CURRENCY_FORMAT

    # Row 3 Headers (A to Z)
    headers = [
        "Data by", "Date\nYYYY-MM-DD", "Supplier", "GSTIN/UIN", "Document Type",
        "Document No.", "Document Date", "Document Amount", "Taxable Value",
        "IGST", "CGST", "SGST", "Total GST in Books", "Total GST in 2B",
        "Diff.", "Matching Status", "Manual Knock Off", "Txn Month\nYYYY-MM",
        "2B Month\nYYYY-MM", "Claimed Month of 3B", "Reversed in Table 4(B)(2)",
        "Reclaimed in Table 4(D)(1)", "CDNR addback \nin Gross ITC\n4(A)(5)",
        "CDNR less \nin Gross ITC\n4(A)(5)", "Helper", "Special Remark"
    ]
    for idx, h in enumerate(headers, 1):
        cell = ws.cell(3, idx, h)
        cell.font = HEADER_FONT
        cell.fill = HEADER_GRAY_FILL
        cell.border = THIN_BORDER
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    # Dynamic Array formula in A4:
    # =_xlfn._xlws.FILTER(Invoice_Recon!A:Z,(Invoice_Recon!P:P="Not found in Books")*(Invoice_Recon!A:A="2B"),"No data")
    ws["A4"] = f'=_xlfn._xlws.FILTER(Invoice_Recon!A:Z,(Invoice_Recon!P:P="{filter_status}")*(Invoice_Recon!A:A="{source_filter}"),"No data")'

    # Filtered records for non-dynamic Excel viewers / fallback
    filtered_records = [
        r for r in items 
        if r["status"].lower() == filter_status.lower() and r["source"].lower() == source_filter.lower()
    ]

    for row_idx, item in enumerate(filtered_records, start=4):
        ws.cell(row_idx, 1, item["source"])
        ws.cell(row_idx, 2, item["date_iso"])
        ws.cell(row_idx, 3, item["supplier"])
        ws.cell(row_idx, 4, item["gstin"])
        ws.cell(row_idx, 5, item["doc_type"])
        ws.cell(row_idx, 6, item["doc_no"])
        ws.cell(row_idx, 7, item["doc_date_str"])
        ws.cell(row_idx, 8, item["doc_amount"])
        ws.cell(row_idx, 9, item["taxable_value"])
        ws.cell(row_idx, 10, item["igst"])
        ws.cell(row_idx, 11, item["cgst"])
        ws.cell(row_idx, 12, item["sgst"])
        ws.cell(row_idx, 13, item["total_gst_books"])
        ws.cell(row_idx, 14, item["total_gst_2b"])
        ws.cell(row_idx, 15, item["diff"])
        ws.cell(row_idx, 16, item["status"])
        ws.cell(row_idx, 17, item["manual_knock_off"])
        ws.cell(row_idx, 18, item["txn_month"])
        ws.cell(row_idx, 19, item["month_2b"])
        ws.cell(row_idx, 20, item["claimed_month_3b"])
        ws.cell(row_idx, 21, item["reversed_4b2"])
        ws.cell(row_idx, 22, item["reclaimed_4d1"])
        ws.cell(row_idx, 23, item["cdnr_addback"])
        ws.cell(row_idx, 24, item["cdnr_less"])
        ws.cell(row_idx, 25, item["helper"])
        ws.cell(row_idx, 26, item["special_remark"])

        for col_i in range(8, 16):
            ws.cell(row_idx, col_i).number_format = CURRENCY_FORMAT

    # Column widths
    ws.column_dimensions['A'].width = 10
    ws.column_dimensions['B'].width = 14
    ws.column_dimensions['C'].width = 30
    ws.column_dimensions['D'].width = 18
    ws.column_dimensions['F'].width = 18
    for c in ["H", "I", "J", "K", "L", "M", "N", "O"]:
        ws.column_dimensions[c].width = 14
