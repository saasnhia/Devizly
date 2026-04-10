"""Pydantic models for Factur-X invoice data validation."""

from datetime import date
from decimal import Decimal
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class Address(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    line1: str
    line2: Optional[str] = None
    postal_code: str
    city: str
    country_code: str = Field(default="FR", pattern=r"^[A-Z]{2}$")


class Seller(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    name: str
    siret: str = Field(pattern=r"^\d{14}$")
    vat_number: Optional[str] = None
    legal_form: Optional[str] = None
    rcs_number: Optional[str] = None
    address: Address
    email: Optional[str] = None
    phone: Optional[str] = None
    iban: Optional[str] = None
    bic: Optional[str] = None
    is_micro_entrepreneur: bool = False
    vat_applicable: bool = True  # False si franchise 293B


class Buyer(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    name: str
    siret: Optional[str] = None
    vat_number: Optional[str] = None
    address: Address
    email: Optional[str] = None


class InvoiceLine(BaseModel):
    line_id: str
    description: str
    quantity: Decimal
    unit_code: str = "C62"
    unit_price_ht: Decimal
    vat_category_code: Literal["S", "E", "Z", "AE", "K", "O"] = "S"
    vat_rate: Decimal
    vat_exemption_reason: Optional[str] = None


class InvoiceTotals(BaseModel):
    total_ht: Decimal
    total_vat: Decimal
    total_ttc: Decimal
    amount_payable: Decimal
    deposit_amount: Optional[Decimal] = None
    deposit_percent: Optional[int] = None


class VatBreakdown(BaseModel):
    basis_amount: Decimal
    category_code: Literal["S", "E", "Z", "AE", "K", "O"]
    rate: Decimal
    exemption_reason: Optional[str] = None
    tax_amount: Decimal


class PaymentInfo(BaseModel):
    due_date: date
    terms: str
    iban: Optional[str] = None
    bic: Optional[str] = None


class InvoiceData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    invoice_number: str
    invoice_type_code: str = "380"
    issue_date: date
    currency: str = Field(default="EUR", pattern=r"^[A-Z]{3}$")
    buyer_reference: Optional[str] = None
    seller: Seller
    buyer: Buyer
    lines: List[InvoiceLine] = Field(min_length=1)
    totals: InvoiceTotals
    vat_breakdowns: List[VatBreakdown] = Field(min_length=1)
    payment: PaymentInfo
    notes: Optional[str] = None
