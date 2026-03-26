"""
Generate a LinkedIn banner (1584x396) for Haroun Chikh / NBHC.
Pillow-only, no external deps beyond PIL.
Usage: python scripts/generate-linkedin-banner.py
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math, sys

W, H = 1584, 396
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── Colors ───────────────────────────────────────────────────────
BG_LEFT = (10, 13, 26)
BG_RIGHT = (15, 20, 40)
DOT_COLOR = (26, 31, 58)
WHITE = (255, 255, 255)
GREY = (155, 163, 194)
DARK_GREY = (74, 81, 128)
VERY_DARK = (45, 51, 85)
VIOLET = (91, 91, 214)
VIOLET_GLOW = (124, 58, 237)
TEAL = (34, 211, 165)
LINE_COLOR = (30, 34, 66)
CARD_BG = (255, 255, 255, 18)  # 7% white
CARD_BG_DARK = (255, 255, 255, 8)  # 3% white
PILL_BG = (91, 91, 214, 40)
PILL_TEAL_BG = (34, 211, 165, 40)
PILL_BLUE_BG = (59, 130, 246, 40)


# ── Font helper ──────────────────────────────────────────────────
def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Try system fonts, fall back to default."""
    names = (
        ["arialbd.ttf", "Arial Bold.ttf"] if bold
        else ["arial.ttf", "Arial.ttf"]
    )
    for name in names:
        for base in [
            "C:/Windows/Fonts",
            "/usr/share/fonts/truetype/dejavu",
            "/System/Library/Fonts",
        ]:
            p = os.path.join(base, name)
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
    # fallback
    try:
        return ImageFont.truetype("arial.ttf", size)
    except OSError:
        return ImageFont.load_default()


# ── Drawing helpers ──────────────────────────────────────────────
def draw_rounded_rect(draw: ImageDraw.ImageDraw, xy: tuple, radius: int,
                      fill=None, outline=None, width=1):
    x0, y0, x1, y1 = xy
    r = radius
    if fill:
        draw.rectangle([x0 + r, y0, x1 - r, y1], fill=fill)
        draw.rectangle([x0, y0 + r, x1, y1 - r], fill=fill)
        draw.pieslice([x0, y0, x0 + 2 * r, y0 + 2 * r], 180, 270, fill=fill)
        draw.pieslice([x1 - 2 * r, y0, x1, y0 + 2 * r], 270, 360, fill=fill)
        draw.pieslice([x0, y1 - 2 * r, x0 + 2 * r, y1], 90, 180, fill=fill)
        draw.pieslice([x1 - 2 * r, y1 - 2 * r, x1, y1], 0, 90, fill=fill)
    if outline:
        draw.arc([x0, y0, x0 + 2 * r, y0 + 2 * r], 180, 270, fill=outline, width=width)
        draw.arc([x1 - 2 * r, y0, x1, y0 + 2 * r], 270, 360, fill=outline, width=width)
        draw.arc([x0, y1 - 2 * r, x0 + 2 * r, y1], 90, 180, fill=outline, width=width)
        draw.arc([x1 - 2 * r, y1 - 2 * r, x1, y1], 0, 90, fill=outline, width=width)
        draw.line([x0 + r, y0, x1 - r, y0], fill=outline, width=width)
        draw.line([x0 + r, y1, x1 - r, y1], fill=outline, width=width)
        draw.line([x0, y0 + r, x0, y1 - r], fill=outline, width=width)
        draw.line([x1, y0 + r, x1, y1 - r], fill=outline, width=width)


def draw_dashed_rounded_rect(draw: ImageDraw.ImageDraw, xy: tuple, radius: int,
                             color, dash_len=7, gap_len=7, width=2):
    """Draw a dashed border rounded rect."""
    x0, y0, x1, y1 = xy
    r = radius

    def dashed_line(pts, total_len):
        sx, sy = pts[0]
        ex, ey = pts[1]
        dx = ex - sx
        dy = ey - sy
        length = math.sqrt(dx * dx + dy * dy)
        if length == 0:
            return
        ux, uy = dx / length, dy / length
        d = 0.0
        drawing = True
        while d < length:
            seg = min(dash_len if drawing else gap_len, length - d)
            if drawing:
                draw.line(
                    [(sx + ux * d, sy + uy * d),
                     (sx + ux * (d + seg), sy + uy * (d + seg))],
                    fill=color, width=width
                )
            d += seg
            drawing = not drawing

    dashed_line([(x0 + r, y0), (x1 - r, y0)], 0)
    dashed_line([(x0 + r, y1), (x1 - r, y1)], 0)
    dashed_line([(x0, y0 + r), (x0, y1 - r)], 0)
    dashed_line([(x1, y0 + r), (x1, y1 - r)], 0)
    # corners as arcs (solid)
    draw.arc([x0, y0, x0 + 2 * r, y0 + 2 * r], 180, 270, fill=color, width=width)
    draw.arc([x1 - 2 * r, y0, x1, y0 + 2 * r], 270, 360, fill=color, width=width)
    draw.arc([x0, y1 - 2 * r, x0 + 2 * r, y1], 90, 180, fill=color, width=width)
    draw.arc([x1 - 2 * r, y1 - 2 * r, x1, y1], 0, 90, fill=color, width=width)


def draw_pill(draw: ImageDraw.ImageDraw, xy: tuple, text: str,
              bg_color, text_color, font: ImageFont.FreeTypeFont, border_color=None):
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    px, py = 12, 4
    x, y = xy
    rx = (th + 2 * py) // 2
    rect = (x, y, x + tw + 2 * px, y + th + 2 * py)
    draw_rounded_rect(draw, rect, rx, fill=bg_color, outline=border_color, width=1)
    draw.text((x + px, y + py - 1), text, fill=text_color, font=font)
    return tw + 2 * px


def make_glow(w: int, h: int, color: tuple, opacity: int = 102, blur: int = 30) -> Image.Image:
    glow = Image.new("RGBA", (w + blur * 4, h + blur * 4), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rounded_rectangle(
        [blur * 2, blur * 2, blur * 2 + w, blur * 2 + h],
        radius=14, fill=(*color, opacity)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=blur))
    return glow


def draw_devizly_icon(draw: ImageDraw.ImageDraw, x: int, y: int, size: int = 60):
    """Draw the Devizly icon: violet rounded rect with doc + lightning."""
    s = size
    # Background
    draw_rounded_rect(draw, (x, y, x + s, y + s), 12, fill=VIOLET_GLOW)
    # Document shape (white)
    dx, dy = x + s * 0.26, y + s * 0.16
    dw, dh = s * 0.42, s * 0.68
    draw.rectangle([dx, dy, dx + dw, dy + dh], fill=(255, 255, 255, 230))
    # Fold corner
    fold = s * 0.13
    draw.polygon([
        (dx + dw - fold, dy),
        (dx + dw, dy + fold),
        (dx + dw - fold, dy + fold)
    ], fill=(200, 200, 255, 180))
    # Lightning bolt
    lx, ly = x + s * 0.45, y + s * 0.30
    ls = s * 0.30
    draw.polygon([
        (lx, ly + ls * 0.5),
        (lx + ls * 0.35, ly),
        (lx + ls * 0.15, ly + ls * 0.42),
        (lx + ls * 0.5, ly + ls * 0.42),
        (lx + ls * 0.15, ly + ls),
        (lx + ls * 0.35, ly + ls * 0.58),
    ], fill=VIOLET_GLOW)


def draw_worthifast_icon(draw: ImageDraw.ImageDraw, x: int, y: int, size: int = 60):
    """Draw the Worthifast icon: dark rounded rect with teal W."""
    s = size
    draw_rounded_rect(draw, (x, y, x + s, y + s), 12, fill=(15, 20, 35))
    draw_rounded_rect(draw, (x + 1, y + 1, x + s - 1, y + s - 1), 12, outline=TEAL, width=2)
    # W letter
    font = get_font(int(s * 0.5), bold=True)
    bbox = font.getbbox("W")
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((x + (s - tw) // 2, y + (s - th) // 2 - 3), "W", fill=TEAL, font=font)


# ── Main ─────────────────────────────────────────────────────────
def generate():
    img = Image.new("RGBA", (W, H), BG_LEFT)
    draw = ImageDraw.Draw(img)

    # Background gradient
    for x in range(W):
        t = x / W
        r = int(BG_LEFT[0] * (1 - t) + BG_RIGHT[0] * t)
        g = int(BG_LEFT[1] * (1 - t) + BG_RIGHT[1] * t)
        b = int(BG_LEFT[2] * (1 - t) + BG_RIGHT[2] * t)
        draw.line([(x, 0), (x, H)], fill=(r, g, b))

    # Dot grid
    for gx in range(0, W, 24):
        for gy in range(0, H, 24):
            draw.rectangle([gx, gy, gx + 1, gy + 1], fill=DOT_COLOR)

    # ── Fonts ──
    f_name = get_font(52, bold=True)
    f_subtitle = get_font(18)
    f_card_title = get_font(22, bold=True)
    f_card_sub = get_font(13)
    f_badge = get_font(13, bold=True)
    f_badge_sm = get_font(12)
    f_nbhc = get_font(42, bold=True)
    f_nbhc_sub = get_font(18)
    f_nbhc_small = get_font(13)
    f_bottom = get_font(12)
    f_pill = get_font(12, bold=True)
    f_question = get_font(24, bold=True)

    # ═══════════ LEFT ZONE ═══════════
    draw.text((54, 74), "Haroun Chikh", fill=WHITE, font=f_name)
    draw.text((54, 142), "Co-fondateur NBHC  ·  SaaS Developer", fill=GREY, font=f_subtitle)

    # Founder badge
    pill_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pill_draw = ImageDraw.Draw(pill_layer)
    draw_pill(pill_draw, (54, 178), "Founder", PILL_BG, WHITE, f_badge)
    img = Image.alpha_composite(img, pill_layer)
    draw = ImageDraw.Draw(img)

    # ═══════════ CENTER — 3 CARDS ═══════════
    cards = [
        {"x": 430, "y": 50, "w": 230, "h": 155, "color": VIOLET_GLOW,
         "title": "Devizly", "sub": "Devis  ·  Factures  ·  Paiement",
         "badge": "Live", "badge_prefix": "", "icon": "devizly"},
        {"x": 684, "y": 50, "w": 230, "h": 155, "color": TEAL,
         "title": "Worthifast", "sub": "OCR  ·  TVA  ·  Banking",
         "badge": "Beta", "badge_prefix": "", "icon": "worthifast"},
    ]

    for c in cards:
        cx, cy, cw, ch = c["x"], c["y"], c["w"], c["h"]
        color = c["color"]

        # Glow behind card
        glow = make_glow(cw, ch, color, opacity=70, blur=30)
        img.paste(
            glow,
            (cx - 60, cy - 60),
            glow
        )

        # Card background
        card_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        cd = ImageDraw.Draw(card_layer)
        draw_rounded_rect(cd, (cx, cy, cx + cw, cy + ch), 14, fill=CARD_BG)
        draw_rounded_rect(cd, (cx, cy, cx + cw, cy + ch), 14, outline=color, width=2)
        img = Image.alpha_composite(img, card_layer)
        draw = ImageDraw.Draw(img)

        # Icon
        if c["icon"] == "devizly":
            draw_devizly_icon(draw, cx + 14, cy + 14, 60)
        else:
            draw_worthifast_icon(draw, cx + 14, cy + 14, 60)

        # Title & subtitle
        draw.text((cx + 82, cy + 22), c["title"], fill=WHITE, font=f_card_title)
        draw.text((cx + 82, cy + 50), c["sub"], fill=GREY, font=f_card_sub)

        # Badge at bottom-left of card
        badge_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        bd = ImageDraw.Draw(badge_layer)
        badge_text = c["badge"]
        if c["icon"] == "devizly":
            badge_text = "\u2713 Live"
        bg = PILL_BG if c["icon"] == "devizly" else PILL_TEAL_BG
        draw_pill(bd, (cx + 14, cy + ch - 36), badge_text, bg,
                  WHITE if c["icon"] == "devizly" else TEAL, f_badge_sm)
        img = Image.alpha_composite(img, badge_layer)
        draw = ImageDraw.Draw(img)

    # Card 3 — Coming Soon (dashed)
    c3x, c3y, c3w, c3h = 938, 50, 230, 155
    card3_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    c3d = ImageDraw.Draw(card3_layer)
    draw_rounded_rect(c3d, (c3x, c3y, c3x + c3w, c3y + c3h), 14, fill=CARD_BG_DARK)
    img = Image.alpha_composite(img, card3_layer)
    draw = ImageDraw.Draw(img)
    draw_dashed_rounded_rect(draw, (c3x, c3y, c3x + c3w, c3y + c3h), 14,
                             color=(61, 68, 104), dash_len=7, gap_len=7, width=2)

    # Question mark circle
    qx, qy, qr = c3x + 14 + 30, c3y + 14 + 30, 30
    draw.ellipse([qx - qr, qy - qr, qx + qr, qy + qr], fill=(30, 34, 66))
    bbox = f_question.getbbox("?")
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((qx - tw // 2, qy - th // 2 - 3), "?", fill=DARK_GREY, font=f_question)

    draw.text((c3x + 82, c3y + 22), "Coming Soon", fill=DARK_GREY, font=f_card_title)
    draw.text((c3x + 82, c3y + 50), "Next NBHC SaaS", fill=VERY_DARK, font=f_card_sub)

    # Badge "2026 ->"
    badge3_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    b3d = ImageDraw.Draw(badge3_layer)
    draw_pill(b3d, (c3x + 14, c3y + c3h - 36), "2026 \u2192",
              (30, 34, 66, 80), DARK_GREY, f_badge_sm)
    img = Image.alpha_composite(img, badge3_layer)
    draw = ImageDraw.Draw(img)

    # ═══════════ RIGHT ZONE ═══════════
    nbhc_x = 1250
    draw.text((nbhc_x, 74), "NBHC", fill=WHITE, font=f_nbhc)
    # Violet line under NBHC
    nbhc_bbox = f_nbhc.getbbox("NBHC")
    nbhc_tw = nbhc_bbox[2] - nbhc_bbox[0]
    draw.line([(nbhc_x, 128), (nbhc_x + nbhc_tw, 128)], fill=VIOLET, width=3)
    draw.text((nbhc_x, 140), "SaaS Studio", fill=VIOLET, font=f_nbhc_sub)
    draw.text((nbhc_x, 170), "Immatriculee  ·  2026", fill=DARK_GREY, font=f_nbhc_small)

    # ═══════════ BOTTOM BAR ═══════════
    draw.line([(0, 344), (W, 344)], fill=LINE_COLOR, width=1)

    # Bottom left text
    draw.text((54, 362), "devizly.fr  ·  worthifast.vercel.app", fill=(61, 68, 104), font=f_bottom)

    # 3 pills centered
    pills_data = [
        ("Devis en 30 sec", VIOLET, PILL_BG),
        ("OCR Factures", TEAL, PILL_TEAL_BG),
        ("TVA & Banking", (59, 130, 246), PILL_BLUE_BG),
    ]
    pill_widths = []
    for text, _, _ in pills_data:
        bbox = f_pill.getbbox(text)
        pill_widths.append(bbox[2] - bbox[0] + 24)
    total_pill_w = sum(pill_widths) + 16 * (len(pills_data) - 1)
    pill_start_x = 790 - total_pill_w // 2

    pills_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pills_layer)
    px = pill_start_x
    for i, (text, border_color, bg) in enumerate(pills_data):
        pw = draw_pill(pd, (px, 358), text, bg, border_color, f_pill, border_color=border_color)
        px += pw + 16
    img = Image.alpha_composite(img, pills_layer)

    # ── Save ──
    final = img.convert("RGB")
    out1 = os.path.join(ROOT, "public", "linkedin-banner.png")
    out2 = os.path.join(ROOT, "linkedin-banner.png")
    final.save(out1, "PNG", quality=95)
    final.save(out2, "PNG", quality=95)
    print(f"Banner saved: {W}x{H}px")
    print(f"  -> {out1}")
    print(f"  -> {out2}")


if __name__ == "__main__":
    generate()
