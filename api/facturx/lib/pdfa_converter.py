"""Add sRGB OutputIntent to PDF for PDF/A-3 compliance."""

from io import BytesIO
import pikepdf
from pikepdf import Pdf, Name, Dictionary, Array


def add_pdfa_output_intent(pdf_bytes: bytes, icc_path: str) -> bytes:
    """
    Add sRGB OutputIntent to make PDF compliant with PDF/A-3 clause 6.2.4.3.
    Uses pikepdf.
    Returns the modified PDF bytes.
    """
    pdf = Pdf.open(BytesIO(pdf_bytes))

    with open(icc_path, "rb") as f:
        icc_data = f.read()

    icc_stream = pdf.make_stream(icc_data)
    icc_stream["/N"] = 3  # 3 components for sRGB

    output_intent = Dictionary({
        "/Type": Name("/OutputIntent"),
        "/S": Name("/GTS_PDFA1"),
        "/OutputConditionIdentifier": pikepdf.String("sRGB IEC61966-2.1"),
        "/Info": pikepdf.String("sRGB IEC61966-2.1"),
        "/DestOutputProfile": icc_stream,
    })

    pdf.Root["/OutputIntents"] = Array([output_intent])

    out = BytesIO()
    pdf.save(out)
    return out.getvalue()
