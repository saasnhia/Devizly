"""Build Factur-X BASIC CII XML from InvoiceData."""

from lxml import etree
from .models import InvoiceData

NSMAP = {
    "rsm": "urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100",
    "ram": "urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100",
    "udt": "urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100",
    "qdt": "urn:un:unece:uncefact:data:standard:QualifiedDataType:100",
}

RSM = NSMAP["rsm"]
RAM = NSMAP["ram"]
UDT = NSMAP["udt"]


def _tag(ns: str, name: str) -> str:
    return f"{{{ns}}}{name}"


def _fmt_date(d) -> str:
    return d.strftime("%Y%m%d")


def _fmt_amount(val) -> str:
    return f"{val:.2f}"


def build_cii_xml(invoice: InvoiceData) -> bytes:
    """
    Build Factur-X BASIC CII XML conforming to EN 16931.
    Returns UTF-8 encoded XML bytes.
    """
    root = etree.Element(_tag(RSM, "CrossIndustryInvoice"), nsmap=NSMAP)

    # -- ExchangedDocumentContext --
    ctx = etree.SubElement(root, _tag(RSM, "ExchangedDocumentContext"))
    guide = etree.SubElement(ctx, _tag(RAM, "GuidelineSpecifiedDocumentContextParameter"))
    etree.SubElement(guide, _tag(RAM, "ID")).text = (
        "urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic"
    )

    # -- ExchangedDocument --
    doc = etree.SubElement(root, _tag(RSM, "ExchangedDocument"))
    etree.SubElement(doc, _tag(RAM, "ID")).text = invoice.invoice_number
    etree.SubElement(doc, _tag(RAM, "TypeCode")).text = invoice.invoice_type_code
    issue = etree.SubElement(doc, _tag(RAM, "IssueDateTime"))
    dt_str = etree.SubElement(issue, _tag(UDT, "DateTimeString"), format="102")
    dt_str.text = _fmt_date(invoice.issue_date)

    # Notes (293B mention, etc.)
    if invoice.notes:
        note = etree.SubElement(doc, _tag(RAM, "IncludedNote"))
        etree.SubElement(note, _tag(RAM, "Content")).text = invoice.notes
    # Also add exemption reason from VAT breakdowns as notes
    for vb in invoice.vat_breakdowns:
        if vb.exemption_reason and vb.exemption_reason != invoice.notes:
            note = etree.SubElement(doc, _tag(RAM, "IncludedNote"))
            etree.SubElement(note, _tag(RAM, "Content")).text = vb.exemption_reason

    # -- SupplyChainTradeTransaction --
    txn = etree.SubElement(root, _tag(RSM, "SupplyChainTradeTransaction"))

    # Line Items
    for line in invoice.lines:
        li = etree.SubElement(txn, _tag(RAM, "IncludedSupplyChainTradeLineItem"))

        line_doc = etree.SubElement(li, _tag(RAM, "AssociatedDocumentLineDocument"))
        etree.SubElement(line_doc, _tag(RAM, "LineID")).text = line.line_id

        product = etree.SubElement(li, _tag(RAM, "SpecifiedTradeProduct"))
        etree.SubElement(product, _tag(RAM, "Name")).text = line.description

        line_agree = etree.SubElement(li, _tag(RAM, "SpecifiedLineTradeAgreement"))
        net_price = etree.SubElement(line_agree, _tag(RAM, "NetPriceProductTradePrice"))
        etree.SubElement(net_price, _tag(RAM, "ChargeAmount")).text = _fmt_amount(line.unit_price_ht)

        line_deliv = etree.SubElement(li, _tag(RAM, "SpecifiedLineTradeDelivery"))
        qty = etree.SubElement(
            line_deliv, _tag(RAM, "BilledQuantity"), unitCode=line.unit_code
        )
        qty.text = str(line.quantity)

        line_settle = etree.SubElement(li, _tag(RAM, "SpecifiedLineTradeSettlement"))
        line_tax = etree.SubElement(line_settle, _tag(RAM, "ApplicableTradeTax"))
        etree.SubElement(line_tax, _tag(RAM, "TypeCode")).text = "VAT"
        etree.SubElement(line_tax, _tag(RAM, "CategoryCode")).text = line.vat_category_code
        etree.SubElement(line_tax, _tag(RAM, "RateApplicablePercent")).text = _fmt_amount(line.vat_rate)

        line_sum = etree.SubElement(
            line_settle, _tag(RAM, "SpecifiedTradeSettlementLineMonetarySummation")
        )
        line_total = line.quantity * line.unit_price_ht
        etree.SubElement(line_sum, _tag(RAM, "LineTotalAmount")).text = _fmt_amount(line_total)

    # -- ApplicableHeaderTradeAgreement --
    agree = etree.SubElement(txn, _tag(RAM, "ApplicableHeaderTradeAgreement"))

    # Seller
    seller_el = etree.SubElement(agree, _tag(RAM, "SellerTradeParty"))
    etree.SubElement(seller_el, _tag(RAM, "Name")).text = invoice.seller.name

    seller_legal = etree.SubElement(seller_el, _tag(RAM, "SpecifiedLegalOrganization"))
    etree.SubElement(seller_legal, _tag(RAM, "ID"), schemeID="0002").text = invoice.seller.siret
    if invoice.seller.legal_form:
        etree.SubElement(seller_legal, _tag(RAM, "TradingBusinessName")).text = (
            f"{invoice.seller.name} - {invoice.seller.legal_form}"
        )

    seller_addr = etree.SubElement(seller_el, _tag(RAM, "PostalTradeAddress"))
    etree.SubElement(seller_addr, _tag(RAM, "PostcodeCode")).text = invoice.seller.address.postal_code
    etree.SubElement(seller_addr, _tag(RAM, "LineOne")).text = invoice.seller.address.line1
    if invoice.seller.address.line2:
        etree.SubElement(seller_addr, _tag(RAM, "LineTwo")).text = invoice.seller.address.line2
    etree.SubElement(seller_addr, _tag(RAM, "CityName")).text = invoice.seller.address.city
    etree.SubElement(seller_addr, _tag(RAM, "CountryID")).text = invoice.seller.address.country_code

    # Seller email (URIUniversalCommunication — required by FNFE-MPE)
    if invoice.seller.email:
        seller_uri = etree.SubElement(seller_el, _tag(RAM, "URIUniversalCommunication"))
        etree.SubElement(seller_uri, _tag(RAM, "URIID"), schemeID="EM").text = invoice.seller.email

    # Seller tax registration
    if invoice.seller.vat_number:
        seller_tax = etree.SubElement(seller_el, _tag(RAM, "SpecifiedTaxRegistration"))
        etree.SubElement(seller_tax, _tag(RAM, "ID"), schemeID="VA").text = invoice.seller.vat_number
    else:
        # FC = fiscal code (SIRET used as tax ID for micro-entrepreneurs without VAT number)
        seller_tax = etree.SubElement(seller_el, _tag(RAM, "SpecifiedTaxRegistration"))
        etree.SubElement(seller_tax, _tag(RAM, "ID"), schemeID="FC").text = invoice.seller.siret

    # Buyer
    buyer_el = etree.SubElement(agree, _tag(RAM, "BuyerTradeParty"))
    etree.SubElement(buyer_el, _tag(RAM, "Name")).text = invoice.buyer.name

    if invoice.buyer.siret:
        buyer_legal = etree.SubElement(buyer_el, _tag(RAM, "SpecifiedLegalOrganization"))
        etree.SubElement(buyer_legal, _tag(RAM, "ID"), schemeID="0002").text = invoice.buyer.siret

    buyer_addr = etree.SubElement(buyer_el, _tag(RAM, "PostalTradeAddress"))
    etree.SubElement(buyer_addr, _tag(RAM, "PostcodeCode")).text = invoice.buyer.address.postal_code
    etree.SubElement(buyer_addr, _tag(RAM, "LineOne")).text = invoice.buyer.address.line1
    if invoice.buyer.address.line2:
        etree.SubElement(buyer_addr, _tag(RAM, "LineTwo")).text = invoice.buyer.address.line2
    etree.SubElement(buyer_addr, _tag(RAM, "CityName")).text = invoice.buyer.address.city
    etree.SubElement(buyer_addr, _tag(RAM, "CountryID")).text = invoice.buyer.address.country_code

    if invoice.buyer.vat_number:
        buyer_tax = etree.SubElement(buyer_el, _tag(RAM, "SpecifiedTaxRegistration"))
        etree.SubElement(buyer_tax, _tag(RAM, "ID"), schemeID="VA").text = invoice.buyer.vat_number

    # Buyer order reference
    if invoice.buyer_reference:
        order_ref = etree.SubElement(agree, _tag(RAM, "BuyerOrderReferencedDocument"))
        etree.SubElement(order_ref, _tag(RAM, "IssuerAssignedID")).text = invoice.buyer_reference

    # -- ApplicableHeaderTradeDelivery (non-empty required by FNFE-MPE) --
    deliv = etree.SubElement(txn, _tag(RAM, "ApplicableHeaderTradeDelivery"))
    deliv_event = etree.SubElement(deliv, _tag(RAM, "ActualDeliverySupplyChainEvent"))
    deliv_occ = etree.SubElement(deliv_event, _tag(RAM, "OccurrenceDateTime"))
    deliv_dt = etree.SubElement(deliv_occ, _tag(UDT, "DateTimeString"), format="102")
    deliv_dt.text = _fmt_date(invoice.issue_date)

    # -- ApplicableHeaderTradeSettlement --
    settle = etree.SubElement(txn, _tag(RAM, "ApplicableHeaderTradeSettlement"))
    etree.SubElement(settle, _tag(RAM, "InvoiceCurrencyCode")).text = invoice.currency

    # Payment means
    pay_means = etree.SubElement(settle, _tag(RAM, "SpecifiedTradeSettlementPaymentMeans"))
    etree.SubElement(pay_means, _tag(RAM, "TypeCode")).text = "30"  # Credit transfer
    if invoice.payment.iban:
        pay_account = etree.SubElement(pay_means, _tag(RAM, "PayeePartyCreditorFinancialAccount"))
        etree.SubElement(pay_account, _tag(RAM, "IBANID")).text = invoice.payment.iban

    # VAT breakdowns
    for vb in invoice.vat_breakdowns:
        tax = etree.SubElement(settle, _tag(RAM, "ApplicableTradeTax"))
        etree.SubElement(tax, _tag(RAM, "CalculatedAmount")).text = _fmt_amount(vb.tax_amount)
        etree.SubElement(tax, _tag(RAM, "TypeCode")).text = "VAT"
        if vb.exemption_reason:
            etree.SubElement(tax, _tag(RAM, "ExemptionReason")).text = vb.exemption_reason
        etree.SubElement(tax, _tag(RAM, "BasisAmount")).text = _fmt_amount(vb.basis_amount)
        etree.SubElement(tax, _tag(RAM, "CategoryCode")).text = vb.category_code
        etree.SubElement(tax, _tag(RAM, "RateApplicablePercent")).text = _fmt_amount(vb.rate)

    # Payment terms
    terms = etree.SubElement(settle, _tag(RAM, "SpecifiedTradePaymentTerms"))
    etree.SubElement(terms, _tag(RAM, "Description")).text = invoice.payment.terms
    due = etree.SubElement(terms, _tag(RAM, "DueDateDateTime"))
    due_dt = etree.SubElement(due, _tag(UDT, "DateTimeString"), format="102")
    due_dt.text = _fmt_date(invoice.payment.due_date)

    # Monetary summation
    summary = etree.SubElement(
        settle, _tag(RAM, "SpecifiedTradeSettlementHeaderMonetarySummation")
    )
    etree.SubElement(summary, _tag(RAM, "LineTotalAmount")).text = _fmt_amount(invoice.totals.total_ht)
    etree.SubElement(summary, _tag(RAM, "TaxBasisTotalAmount")).text = _fmt_amount(invoice.totals.total_ht)
    etree.SubElement(
        summary, _tag(RAM, "TaxTotalAmount"), currencyID=invoice.currency
    ).text = _fmt_amount(invoice.totals.total_vat)
    etree.SubElement(summary, _tag(RAM, "GrandTotalAmount")).text = _fmt_amount(invoice.totals.total_ttc)
    etree.SubElement(summary, _tag(RAM, "DuePayableAmount")).text = _fmt_amount(invoice.totals.amount_payable)

    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", pretty_print=True)
