"""Build a minimal PDF invoice using reportlab with embedded TTF fonts."""

import os
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from .models import InvoiceData


def _fmt_eur(val) -> str:
    """Format a Decimal as French-style currency: 1 500,00 EUR."""
    s = f"{val:,.2f}"
    # Swap . and , for French formatting
    s = s.replace(",", " ").replace(".", ",")
    return f"{s} EUR"


def build_base_pdf(invoice: InvoiceData, fonts_dir: str) -> bytes:
    """
    Generate a minimal PDF invoice with embedded TTF fonts.
    Phase 2A template — rich template comes in Phase 2C.
    Returns PDF bytes.
    """
    # Register fonts
    vera_path = os.path.join(fonts_dir, "Vera.ttf")
    vera_bold_path = os.path.join(fonts_dir, "VeraBd.ttf")
    pdfmetrics.registerFont(TTFont("Vera", vera_path))
    pdfmetrics.registerFont(TTFont("Vera-Bold", vera_bold_path))
    FONT = "Vera"
    FONT_BOLD = "Vera-Bold"

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4

    # -- Header --
    c.setFont(FONT_BOLD, 22)
    c.drawString(40, h - 50, "FACTURE")
    c.setFont(FONT, 12)
    c.drawString(40, h - 75, f"N. {invoice.invoice_number}")
    c.drawString(40, h - 95, f"Date : {invoice.issue_date.strftime('%d/%m/%Y')}")
    c.drawString(40, h - 115, f"Echeance : {invoice.payment.due_date.strftime('%d/%m/%Y')}")

    # -- Seller --
    c.setFont(FONT_BOLD, 11)
    c.drawString(40, h - 150, "Emetteur")
    c.setFont(FONT, 10)
    y = h - 165
    seller = invoice.seller
    label = seller.name
    if seller.legal_form:
        label += f" - {seller.legal_form}"
    c.drawString(40, y, label)
    y -= 15
    c.drawString(40, y, f"SIRET : {seller.siret}")
    y -= 15
    addr = f"{seller.address.line1}, {seller.address.postal_code} {seller.address.city}"
    c.drawString(40, y, addr)

    # -- Buyer --
    c.setFont(FONT_BOLD, 11)
    c.drawString(320, h - 150, "Client")
    c.setFont(FONT, 10)
    y_buyer = h - 165
    c.drawString(320, y_buyer, invoice.buyer.name)
    y_buyer -= 15
    if invoice.buyer.siret:
        c.drawString(320, y_buyer, f"SIRET : {invoice.buyer.siret}")
        y_buyer -= 15
    buyer_addr = f"{invoice.buyer.address.line1}, {invoice.buyer.address.postal_code} {invoice.buyer.address.city}"
    c.drawString(320, y_buyer, buyer_addr)

    # -- Line items table --
    y = h - 250
    c.setFont(FONT_BOLD, 10)
    c.drawString(40, y, "Description")
    c.drawString(350, y, "Qte")
    c.drawString(400, y, "P.U. HT")
    c.drawString(480, y, "Total HT")
    c.line(40, y - 5, 555, y - 5)

    y -= 20
    c.setFont(FONT, 10)
    for line in invoice.lines:
        # Truncate long descriptions
        desc = line.description[:50]
        c.drawString(40, y, desc)
        c.drawString(355, y, str(line.quantity))
        c.drawRightString(465, y, _fmt_eur(line.unit_price_ht))
        line_total = line.quantity * line.unit_price_ht
        c.drawRightString(555, y, _fmt_eur(line_total))
        y -= 18
        if y < 120:
            c.showPage()
            y = h - 50
            c.setFont(FONT, 10)

    # -- Totals --
    y -= 20
    c.line(380, y + 15, 555, y + 15)
    c.setFont(FONT, 10)
    c.drawString(380, y, "Total HT :")
    c.drawRightString(555, y, _fmt_eur(invoice.totals.total_ht))
    y -= 15

    for vb in invoice.vat_breakdowns:
        c.drawString(380, y, f"TVA ({vb.rate}%) :")
        c.drawRightString(555, y, _fmt_eur(vb.tax_amount))
        y -= 15

    y -= 5
    c.setFont(FONT_BOLD, 12)
    c.drawString(380, y, "Total TTC :")
    c.drawRightString(555, y, _fmt_eur(invoice.totals.total_ttc))

    # -- Footer --
    y -= 50
    c.setFont(FONT, 8)
    if invoice.notes:
        c.drawString(40, y, invoice.notes)
        y -= 12
    # Add exemption reasons from VAT breakdowns
    for vb in invoice.vat_breakdowns:
        if vb.exemption_reason and vb.exemption_reason != invoice.notes:
            c.drawString(40, y, vb.exemption_reason)
            y -= 12

    payment_line = f"Conditions : {invoice.payment.terms}"
    if invoice.payment.iban:
        # Format IBAN with spaces every 4 chars
        iban = invoice.payment.iban.replace(" ", "")
        iban_formatted = " ".join(iban[i:i+4] for i in range(0, len(iban), 4))
        payment_line += f" -- IBAN : {iban_formatted}"
    c.drawString(40, y, payment_line)

    c.save()
    return buf.getvalue()
