import math
import os
from PIL import Image, ImageDraw, ImageFont

artifact_dir = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82"
public_dir = "e:/anti/google review app/public"

width = 800
height = 1200

try:
    font_eyebrow = ImageFont.truetype('arialbd.ttf', 20)
    font_title = ImageFont.truetype('arialbd.ttf', 46)
    font_sub = ImageFont.truetype('arialbd.ttf', 27)
    font_desc = ImageFont.truetype('arial.ttf', 22)
    font_pill = ImageFont.truetype('arialbd.ttf', 17)
    font_footer = ImageFont.truetype('arialbd.ttf', 20)
    font_footersub = ImageFont.truetype('arial.ttf', 18)
except Exception:
    font_eyebrow = font_title = font_sub = font_desc = font_pill = font_footer = font_footersub = ImageFont.load_default()

def draw_stars(draw, cy=194):
    star_spacing = 42
    start_x = width // 2 - 2 * star_spacing
    for i in range(5):
        cx = start_x + i * star_spacing
        coords = []
        for s in range(10):
            r = 16 if s % 2 == 0 else 7.5
            angle = math.pi / 2 * 3 + s * (math.pi / 5)
            coords.append((cx + math.cos(angle) * r, cy + math.sin(angle) * r))
        draw.polygon(coords, fill=(251, 191, 36))

# -------------------------------------------------------------
# 1. TAMTARA STANDEE (Warm Luxury Amber / Terracotta)
# -------------------------------------------------------------
img_tamtara = Image.new('RGB', (width, height), color=(24, 14, 8))
draw_t = ImageDraw.Draw(img_tamtara)

for y in range(height):
    ratio = y / height
    r = int(36 * (1 - ratio) + 14 * ratio)
    g = int(20 * (1 - ratio) + 8 * ratio)
    b = int(10 * (1 - ratio) + 4 * ratio)
    draw_t.line([(0, y), (width, y)], fill=(r, g, b))

# Border
draw_t.rounded_rectangle([24, 24, width - 24, height - 24], radius=32, outline=(234, 88, 12, 130), width=2)

# Eyebrow
b_text = "LUXURY FINE DINE & ARTISAN CAFE  •  NAGPUR"
bw, bh = 490, 42
bx, by = (width - bw) // 2, 50
draw_t.rounded_rectangle([bx, by, bx + bw, by + bh], radius=21, fill=(67, 20, 7), outline=(234, 88, 12), width=1)
draw_t.text((width // 2, by + bh // 2), b_text, fill=(254, 215, 170), font=font_eyebrow, anchor="mm")

# Title
draw_t.text((width // 2, 134), "TAMTARA", fill=(255, 255, 255), font=font_title, anchor="mm")

# Stars
draw_stars(draw_t, 194)

# QR Container
cw, ch = 540, 540
cx, cy = (width - cw) // 2, 242
draw_t.rounded_rectangle([cx - 4, cy - 4, cx + cw + 4, cy + ch + 4], radius=36, fill=(234, 88, 12, 80))
draw_t.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=32, fill=(255, 255, 255))

qr_t = Image.open(os.path.join(public_dir, "tamtara-qr.png")).resize((480, 480), Image.Resampling.LANCZOS)
img_tamtara.paste(qr_t, ((width - 480) // 2, cy + 30))

# Prompts
draw_t.text((width // 2, 835), "Loved Your Dining Experience?", fill=(251, 146, 60), font=font_sub, anchor="mm")
draw_t.text((width // 2, 885), "Scan with your phone camera to leave a 5-star Google review", fill=(255, 247, 237), font=font_desc, anchor="mm")
draw_t.text((width // 2, 918), "and share your experience with our flavors & aesthetic ambiance!", fill=(254, 215, 170), font=font_desc, anchor="mm")

# Trust Pillars
pills_t = ["Gourmet Flavors", "Aesthetic Ambiance", "Exquisite Service"]
pw, ph, sp = 216, 36, 14
tot_w = len(pills_t) * pw + (len(pills_t) - 1) * sp
start_px = (width - tot_w) // 2
py = 970
for i, p in enumerate(pills_t):
    px = start_px + i * (pw + sp)
    draw_t.rounded_rectangle([px, py, px + pw, py + ph], radius=18, fill=(67, 20, 7), outline=(234, 88, 12), width=1)
    draw_t.text((px + pw // 2, py + ph // 2), p, fill=(254, 215, 170), font=font_pill, anchor="mm")

# Divider & Footer
draw_t.line([(80, 1045), (width - 80, 1045)], fill=(124, 45, 18), width=1)
draw_t.text((width // 2, 1085), "Official Google Review Solicitation Portal", fill=(255, 255, 255), font=font_footer, anchor="mm")
draw_t.text((width // 2, 1120), "review.welurik.com/r/tamtara", fill=(251, 146, 60), font=font_footersub, anchor="mm")
draw_t.text((width // 2, 1150), "Tamtara  |  Ring Road, Dabha, Nagpur  |  Fine Dine & Cafe", fill=(215, 180, 160), font=font_footersub, anchor="mm")

img_tamtara.save(os.path.join(artifact_dir, "tamtara-standee.png"), quality=95)
img_tamtara.save(os.path.join(public_dir, "tamtara-standee.png"), quality=95)
print("SUCCESS: Tamtara Standee created!")

# -------------------------------------------------------------
# 2. RAASTA STANDEE (Electric Nightlife Crimson)
# -------------------------------------------------------------
img_raasta = Image.new('RGB', (width, height), color=(20, 6, 12))
draw_r = ImageDraw.Draw(img_raasta)

for y in range(height):
    ratio = y / height
    r = int(34 * (1 - ratio) + 12 * ratio)
    g = int(8 * (1 - ratio) + 3 * ratio)
    b = int(18 * (1 - ratio) + 6 * ratio)
    draw_r.line([(0, y), (width, y)], fill=(r, g, b))

# Border
draw_r.rounded_rectangle([24, 24, width - 24, height - 24], radius=32, outline=(225, 29, 72, 130), width=2)

# Eyebrow
b_text_r = "ROOFTOP RESTAURANT, CAFE & LOUNGE  •  NAGPUR"
bw_r, bh_r = 520, 42
bx_r, by_r = (width - bw_r) // 2, 50
draw_r.rounded_rectangle([bx_r, by_r, bx_r + bw_r, by_r + bh_r], radius=21, fill=(76, 5, 25), outline=(225, 29, 72), width=1)
draw_r.text((width // 2, by_r + bh_r // 2), b_text_r, fill=(254, 205, 211), font=font_eyebrow, anchor="mm")

# Title
draw_r.text((width // 2, 134), "RAASTA", fill=(255, 255, 255), font=font_title, anchor="mm")

# Stars
draw_stars(draw_r, 194)

# QR Container
draw_r.rounded_rectangle([cx - 4, cy - 4, cx + cw + 4, cy + ch + 4], radius=36, fill=(225, 29, 72, 80))
draw_r.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=32, fill=(255, 255, 255))

qr_r = Image.open(os.path.join(public_dir, "raasta-qr.png")).resize((480, 480), Image.Resampling.LANCZOS)
img_raasta.paste(qr_r, ((width - 480) // 2, cy + 30))

# Prompts
draw_r.text((width // 2, 835), "Loved The Rooftop Vibe Tonight?", fill=(251, 113, 133), font=font_sub, anchor="mm")
draw_r.text((width // 2, 885), "Scan with your phone camera to leave a 5-star Google review", fill=(255, 241, 242), font=font_desc, anchor="mm")
draw_r.text((width // 2, 918), "and help more foodies discover our skyline views & live music!", fill=(254, 205, 211), font=font_desc, anchor="mm")

# Trust Pillars
pills_r = ["Panoramic Views", "Live Music & Beats", "Gourmet Dining"]
tot_w_r = len(pills_r) * pw + (len(pills_r) - 1) * sp
start_px_r = (width - tot_w_r) // 2
for i, p in enumerate(pills_r):
    px = start_px_r + i * (pw + sp)
    draw_r.rounded_rectangle([px, py, px + pw, py + ph], radius=18, fill=(76, 5, 25), outline=(225, 29, 72), width=1)
    draw_r.text((px + pw // 2, py + ph // 2), p, fill=(254, 205, 211), font=font_pill, anchor="mm")

# Divider & Footer
draw_r.line([(80, 1045), (width - 80, 1045)], fill=(136, 19, 55), width=1)
draw_r.text((width // 2, 1085), "Official Google Review Solicitation Portal", fill=(255, 255, 255), font=font_footer, anchor="mm")
draw_r.text((width // 2, 1120), "review.welurik.com/r/raasta", fill=(251, 113, 133), font=font_footersub, anchor="mm")
draw_r.text((width // 2, 1150), "Raasta  |  Dharampeth Ext, Shivaji Nagar, Nagpur  |  Rooftop", fill=(210, 170, 185), font=font_footersub, anchor="mm")

img_raasta.save(os.path.join(artifact_dir, "raasta-standee.png"), quality=95)
img_raasta.save(os.path.join(public_dir, "raasta-standee.png"), quality=95)
print("SUCCESS: Raasta Standee created!")
