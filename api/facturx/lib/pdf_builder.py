"""Build a Devizly-branded PDF invoice using reportlab.

Phase 2D template — single A4 page assumed, embedded TTF fonts only,
RGB sRGB colors, no bitmaps. Stays PDF/A-3 compatible by design so the
downstream pdfa_converter + factur-x embedding don't break.

Constraints:
- Vector content only (no images, no logos as bitmaps)
- Vera + VeraBd fonts only (already embedded via TTFont)
- RGB sRGB colors, alpha = 1.0 everywhere
- No annotations, no links, no forms, no JavaScript, no attachments
"""

import os
from datetime import date
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from .models import InvoiceData


# ── Layout constants ──────────────────────────────────────
PAGE_W, PAGE_H = A4
MARGIN = 2 * cm
CONTENT_X = MARGIN
CONTENT_RIGHT = PAGE_W - MARGIN
CONTENT_W = CONTENT_RIGHT - CONTENT_X
TOP_Y = PAGE_H - MARGIN
BOTTOM_Y = MARGIN

# ── Color palette (RGB sRGB, alpha=1) ─────────────────────
DEVIZLY_PURPLE = (0.357, 0.357, 0.839)   # #5B5BD6
BLACK = (0, 0, 0)
GRAY_DARK = (0.4, 0.4, 0.4)              # #666666
GRAY_MID = (0.533, 0.533, 0.533)         # #888888
GRAY_LIGHT = (0.867, 0.867, 0.867)       # #DDDDDD
BORDER_LIGHT = (0.933, 0.933, 0.933)     # #EEEEEE
BG_HEADER = (0.961, 0.961, 0.961)        # #F5F5F5
BG_ALT = (0.98, 0.98, 0.98)              # #FAFAFA

# Table column layout (x positions in pts, content width ~482)
COL_DESC_X = CONTENT_X
COL_QTY_X = CONTENT_X + 230
COL_PU_X = CONTENT_X + 290
COL_VAT_X = CONTENT_X + 365
COL_TOT_X = CONTENT_X + 405
COL_END = CONTENT_RIGHT

ROW_HEIGHT = 16
MAX_LINES = 18

# Mois français (mapping manuel — pas de locale.setlocale runtime-dependent)
MOIS_FR = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
]


# ── Format helpers ────────────────────────────────────────

def format_amount_fr(value) -> str:
    """1234.56 -> '1 234,56' (French style, no currency symbol)."""
    s = f"{float(value):,.2f}"
    # Use NBSP-like spacing via regular space; reportlab handles it fine
    return s.replace(",", " ").replace(".", ",")


def format_amount_eur(value) -> str:
    """1234.56 -> '1 234,56 €'."""
    return f"{format_amount_fr(value)} €"


def format_iban(iban: str) -> str:
    """FR7612345... -> 'FR76 1234 5678 9012 3456 7890 123'."""
    cleaned = iban.replace(" ", "")
    return " ".join(cleaned[i:i + 4] for i in range(0, len(cleaned), 4))


def format_date_fr(d: date) -> str:
    """date(2026, 4, 9) -> '09 avril 2026'."""
    return f"{d.day:02d} {MOIS_FR[d.month - 1]} {d.year}"


def format_quantity(q) -> str:
    """3 -> '3', 3.5 -> '3,50' (avoid trailing decimals on integers)."""
    f = float(q)
    if f == int(f):
        return str(int(f))
    return format_amount_fr(f)


def truncate_desc(desc: str, max_len: int = 55) -> str:
    if len(desc) <= max_len:
        return desc
    return desc[:max_len - 3] + "..."


def detect_micro(vat_breakdowns) -> bool:
    """True if all VAT lines are exempt under article 293 B CGI.

    The accounting truth lives in vat_breakdowns, not in seller flags:
    a non-micro vendor can be exempt under specific conditions, and
    a micro vendor can opt into VAT.
    """
    if not vat_breakdowns:
        return False
    return all(
        vb.category_code == "E" and "293" in (vb.exemption_reason or "")
        for vb in vat_breakdowns
    )


# ── Drawing primitives ────────────────────────────────────

def _set_text_color(c, rgb):
    c.setFillColorRGB(*rgb)


def _hline(c, y, color=GRAY_LIGHT, width=0.5, x1=None, x2=None):
    c.setStrokeColorRGB(*color)
    c.setLineWidth(width)
    c.line(x1 if x1 is not None else CONTENT_X,
           y,
           x2 if x2 is not None else CONTENT_RIGHT,
           y)


# ── Main builder ──────────────────────────────────────────

def build_base_pdf(invoice: InvoiceData, fonts_dir: str) -> bytes:
    """Generate a Devizly-branded invoice PDF (A4, single page assumed).

    Returns raw PDF bytes ready to be passed to add_pdfa_output_intent
    and then to facturx.generate_from_binary for XML embedding.
    """
    # Register fonts (idempotent — reportlab caches TTFont registrations)
    pdfmetrics.registerFont(TTFont("Vera", os.path.join(fonts_dir, "Vera.ttf")))
    pdfmetrics.registerFont(
        TTFont("Vera-Bold", os.path.join(fonts_dir, "VeraBd.ttf"))
    )
    FONT = "Vera"
    FONT_BOLD = "Vera-Bold"

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    c.setTitle(f"Facture {invoice.invoice_number}")
    c.setAuthor("Devizly")
    c.setSubject("Facture Factur-X BASIC")

    is_micro = detect_micro(invoice.vat_breakdowns)

    # ════════════════════════════════════════════════════════
    # HEADER
    # ════════════════════════════════════════════════════════
    y = TOP_Y - 6

    # Wordmark "DEVIZLY" left
    _set_text_color(c, DEVIZLY_PURPLE)
    c.setFont(FONT_BOLD, 22)
    c.drawString(CONTENT_X, y - 18, "DEVIZLY")

    # FACTURE block right
    _set_text_color(c, BLACK)
    c.setFont(FONT_BOLD, 14)
    c.drawRightString(CONTENT_RIGHT, y - 12, "FACTURE")

    _set_text_color(c, GRAY_DARK)
    c.setFont(FONT, 11)
    c.drawRightString(CONTENT_RIGHT, y - 28, f"N° {invoice.invoice_number}")
    c.drawRightString(CONTENT_RIGHT, y - 42, format_date_fr(invoice.issue_date))

    # Header separator
    y_sep1 = TOP_Y - 60
    _hline(c, y_sep1)

    # ════════════════════════════════════════════════════════
    # PARTIES (seller + buyer side by side)
    # ════════════════════════════════════════════════════════
    y_block = y_sep1 - 18
    col_left_x = CONTENT_X
    col_right_x = CONTENT_X + (CONTENT_W / 2) + 10

    def draw_party_block(x, y_start, label, party):
        """Draw a party block. Returns y after the block."""
        py = y_start

        _set_text_color(c, GRAY_DARK)
        c.setFont(FONT_BOLD, 8)
        c.drawString(x, py, label)
        py -= 14

        _set_text_color(c, BLACK)
        c.setFont(FONT_BOLD, 11)
        c.drawString(x, py, party.name)
        py -= 14

        c.setFont(FONT, 10)
        c.drawString(x, py, party.address.line1)
        py -= 13

        addr_line = f"{party.address.postal_code} {party.address.city}"
        c.drawString(x, py, addr_line)
        py -= 13

        if party.address.country_code and party.address.country_code != "FR":
            c.drawString(x, py, party.address.country_code)
            py -= 13

        if getattr(party, "siret", None):
            _set_text_color(c, GRAY_DARK)
            c.setFont(FONT, 8)
            c.drawString(x, py, f"SIRET {party.siret}")
            py -= 11

        if getattr(party, "vat_number", None):
            _set_text_color(c, GRAY_DARK)
            c.setFont(FONT, 8)
            c.drawString(x, py, f"TVA {party.vat_number}")
            py -= 11

        return py

    y_left_end = draw_party_block(col_left_x, y_block, "ÉMETTEUR", invoice.seller)
    y_right_end = draw_party_block(col_right_x, y_block, "DESTINATAIRE", invoice.buyer)
    y_after_blocks = min(y_left_end, y_right_end) - 12

    _hline(c, y_after_blocks)

    # ════════════════════════════════════════════════════════
    # LINE ITEMS TABLE
    # ════════════════════════════════════════════════════════
    y_table_top = y_after_blocks - 8

    # Header row background
    c.setFillColorRGB(*BG_HEADER)
    c.rect(
        CONTENT_X,
        y_table_top - ROW_HEIGHT + 4,
        CONTENT_W,
        ROW_HEIGHT,
        fill=1,
        stroke=0,
    )

    # Header row text
    _set_text_color(c, BLACK)
    c.setFont(FONT_BOLD, 8)
    y_header_text = y_table_top - 8
    c.drawString(COL_DESC_X + 4, y_header_text, "DESCRIPTION")
    c.drawRightString(COL_PU_X - 4, y_header_text, "QTÉ")
    c.drawRightString(COL_VAT_X - 4, y_header_text, "PU HT")
    c.drawRightString(COL_TOT_X - 4, y_header_text, "TVA")
    c.drawRightString(COL_END - 4, y_header_text, "TOTAL HT")

    # Body rows
    y_row = y_table_top - ROW_HEIGHT - 2
    lines = invoice.lines
    truncated_count = 0
    if len(lines) > MAX_LINES:
        truncated_count = len(lines) - MAX_LINES
        lines = lines[:MAX_LINES]
        print(
            f"[pdf_builder] WARNING: invoice {invoice.invoice_number} "
            f"has {len(invoice.lines)} lines, truncated to {MAX_LINES}"
        )

    c.setFont(FONT, 9)
    for i, line in enumerate(lines):
        if i % 2 == 1:
            c.setFillColorRGB(*BG_ALT)
            c.rect(CONTENT_X, y_row - 4, CONTENT_W, ROW_HEIGHT, fill=1, stroke=0)

        c.setStrokeColorRGB(*BORDER_LIGHT)
        c.setLineWidth(0.5)
        c.line(CONTENT_X, y_row - 4, CONTENT_RIGHT, y_row - 4)

        _set_text_color(c, BLACK)
        c.setFont(FONT, 9)
        c.drawString(COL_DESC_X + 4, y_row, truncate_desc(line.description))
        c.drawRightString(COL_PU_X - 4, y_row, format_quantity(line.quantity))
        c.drawRightString(
            COL_VAT_X - 4, y_row, format_amount_eur(line.unit_price_ht)
        )
        c.drawRightString(COL_TOT_X - 4, y_row, f"{int(line.vat_rate)}%")
        line_total = line.quantity * line.unit_price_ht
        c.drawRightString(COL_END - 4, y_row, format_amount_eur(line_total))

        y_row -= ROW_HEIGHT

    if truncated_count > 0:
        _set_text_color(c, GRAY_DARK)
        c.setFont(FONT, 8)
        c.drawString(
            COL_DESC_X + 4,
            y_row,
            f"... et {truncated_count} ligne(s) supplémentaire(s)",
        )
        y_row -= ROW_HEIGHT

    # ════════════════════════════════════════════════════════
    # TOTALS (right-aligned)
    # ════════════════════════════════════════════════════════
    y_totals = y_row - 12
    totals_label_x = CONTENT_X + 290
    totals_value_x = CONTENT_RIGHT

    _set_text_color(c, BLACK)
    c.setFont(FONT, 10)
    c.drawString(totals_label_x, y_totals, "Total HT")
    c.drawRightString(
        totals_value_x, y_totals, format_amount_eur(invoice.totals.total_ht)
    )
    y_totals -= 14

    for vb in invoice.vat_breakdowns:
        if vb.category_code == "E":
            label = "TVA exonérée"
        else:
            label = f"TVA {int(vb.rate)}%"
        c.drawString(totals_label_x, y_totals, label)
        c.drawRightString(totals_value_x, y_totals, format_amount_eur(vb.tax_amount))
        y_totals -= 14

    # Separator above TOTAL TTC
    y_totals -= 2
    _hline(c, y_totals, color=GRAY_LIGHT, width=0.5,
           x1=totals_label_x, x2=totals_value_x)
    y_totals -= 14

    c.setFont(FONT_BOLD, 13)
    c.drawString(totals_label_x, y_totals, "TOTAL TTC")
    c.drawRightString(
        totals_value_x, y_totals, format_amount_eur(invoice.totals.total_ttc)
    )
    y_totals -= 16

    # Exemption mention if applicable
    if is_micro:
        _set_text_color(c, GRAY_DARK)
        c.setFont(FONT, 8)
        ex_reason = next(
            (
                vb.exemption_reason
                for vb in invoice.vat_breakdowns
                if vb.exemption_reason
            ),
            "TVA non applicable, article 293 B du CGI",
        )
        c.drawRightString(totals_value_x, y_totals, ex_reason)
        y_totals -= 12

    # ════════════════════════════════════════════════════════
    # PAYMENT BLOCK
    # ════════════════════════════════════════════════════════
    y_pay = y_totals - 24

    if invoice.payment.iban:
        _set_text_color(c, BLACK)
        c.setFont(FONT_BOLD, 9)
        c.drawString(CONTENT_X, y_pay, "Paiement par virement")
        y_pay -= 13

        c.setFont(FONT, 9)
        c.drawString(
            CONTENT_X, y_pay, f"IBAN : {format_iban(invoice.payment.iban)}"
        )
        y_pay -= 12

        if invoice.payment.bic:
            c.drawString(CONTENT_X, y_pay, f"BIC  : {invoice.payment.bic}")
            y_pay -= 12

    if invoice.payment.terms or invoice.payment.due_date:
        _set_text_color(c, GRAY_DARK)
        c.setFont(FONT, 8)
        terms_line = invoice.payment.terms or ""
        if invoice.payment.due_date:
            terms_line = (
                f"{terms_line} — échéance {format_date_fr(invoice.payment.due_date)}"
            ).strip(" —")
        if terms_line:
            c.drawString(CONTENT_X, y_pay, terms_line)

    # ════════════════════════════════════════════════════════
    # FOOTER
    # ════════════════════════════════════════════════════════
    footer_top = BOTTOM_Y + 38
    _hline(c, footer_top, color=GRAY_LIGHT, width=0.5)

    _set_text_color(c, GRAY_MID)
    c.setFont(FONT, 7)

    footer_lines = [
        "Pénalités de retard : 3 × taux d'intérêt légal. Indemnité forfaitaire de "
        "recouvrement : 40 €. Escompte pour paiement anticipé : néant.",
        "Facture conforme au standard Factur-X BASIC (ordonnance 2021-1190). "
        "Générée via Devizly.fr",
    ]
    if is_micro:
        footer_lines.append("TVA non applicable, article 293 B du CGI")

    fy = footer_top - 10
    for line in footer_lines:
        c.drawString(CONTENT_X, fy, line)
        fy -= 9

    c.save()
    return buf.getvalue()
