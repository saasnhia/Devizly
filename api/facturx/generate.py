"""Vercel Python Function — Factur-X PDF generator."""

from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import traceback

# CRITICAL: sys.path insert MUST come BEFORE 'import facturx' so that
# our local saxonche stub (api/facturx/saxonche/) takes precedence over
# the pip-installed one (which we deliberately exclude to stay under
# Vercel's 250MB bundle limit). See api/facturx/saxonche/README.md.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import facturx  # noqa: E402

from lib.models import InvoiceData  # noqa: E402
from lib.xml_builder import build_cii_xml  # noqa: E402
from lib.pdf_builder import build_base_pdf  # noqa: E402
from lib.pdfa_converter import add_pdfa_output_intent  # noqa: E402

FONTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lib", "fonts")
ICC_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "sRGB.icc")

FACTURX_SECRET = os.environ.get("FACTURX_INTERNAL_SECRET", "")


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Auth: verify internal shared secret
            auth_header = self.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                self._respond(401, {"error": "Missing authorization"})
                return

            provided_secret = auth_header.removeprefix("Bearer ").strip()
            if not FACTURX_SECRET or provided_secret != FACTURX_SECRET:
                self._respond(403, {"error": "Invalid secret"})
                return

            # Parse body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)

            try:
                data = json.loads(body)
            except json.JSONDecodeError as e:
                self._respond(400, {"error": f"Invalid JSON: {str(e)}"})
                return

            # Pydantic validation
            try:
                invoice = InvoiceData(**data)
            except Exception as e:
                self._respond(422, {"error": f"Validation failed: {str(e)}"})
                return

            # 1. Build CII XML
            xml_bytes = build_cii_xml(invoice)

            # 2. Build base PDF with embedded fonts
            pdf_bytes = build_base_pdf(invoice, FONTS_DIR)

            # 3. Add sRGB OutputIntent for PDF/A-3
            pdf_with_intent = add_pdfa_output_intent(pdf_bytes, ICC_PATH)

            # 4. Embed XML into PDF via factur-x library
            facturx_pdf = facturx.generate_from_binary(
                pdf_with_intent,
                xml_bytes,
                flavor="factur-x",
                level="basic",
                check_xsd=True,
                check_schematron=False,
                pdf_metadata={
                    "author": "Devizly",
                    "title": f"Facture {invoice.invoice_number} - {invoice.seller.name}",
                    "subject": "Facture Factur-X BASIC",
                    "keywords": "Factur-X, Invoice, Devizly",
                },
                lang="fr-FR",
            )

            # Return PDF binary
            self.send_response(200)
            self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Length", str(len(facturx_pdf)))
            self.send_header(
                "Content-Disposition",
                f'attachment; filename="{invoice.invoice_number}.pdf"',
            )
            self.end_headers()
            self.wfile.write(facturx_pdf)

        except Exception as e:
            self._respond(
                500,
                {
                    "error": "Internal error",
                    "detail": str(e),
                    "trace": traceback.format_exc(),
                },
            )

    def _respond(self, status: int, body: dict):
        payload = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        self._respond(200, {"status": "ok", "service": "facturx-generator"})
