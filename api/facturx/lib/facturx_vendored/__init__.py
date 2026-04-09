"""Vendored factur-x Akretion v4.2, patched to exclude saxonche.

See README.md for the patch rationale and re-vendoring procedure.
"""

__version__ = "4.2-vendored"

# PATCHED (vendored): xml_check_schematron removed from the re-exports
# (it still exists as a stub that raises NotImplementedError).
from .facturx import (
    generate_from_file,
    generate_from_binary,
    get_xml_namespaces,
    get_flavor,
    get_facturx_level,
    get_level,
    xml_check_xsd,
    get_facturx_xml_from_pdf,
    get_orderx_xml_from_pdf,
    get_xml_from_pdf,
    get_orderx_type,
)

__all__ = [
    "generate_from_file",
    "generate_from_binary",
    "get_xml_namespaces",
    "get_flavor",
    "get_facturx_level",
    "get_level",
    "xml_check_xsd",
    "get_facturx_xml_from_pdf",
    "get_orderx_xml_from_pdf",
    "get_xml_from_pdf",
    "get_orderx_type",
]
