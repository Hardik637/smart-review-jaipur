import math
import os
from PIL import Image, ImageDraw, ImageFont

artifact_dir = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82"
public_dir = "e:/anti/google review app/public"

width = 800
height = 1200

try:
    font_eyebrow = ImageFont.truetype('arialbd.ttf', 20)
    font_title = ImageFont.truetype('arialbd.ttf', 48)
    font_sub = ImageFont.truetype('arialbd.ttf', 28)
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
        draw.polygon(coords, fill=(245, 158, 11))

# =============================================================
# 1. TAMTARA - PURE MATTE BLACK LUXURY EDITION
# =============================================================
img_tamtara = Image.new('RGB', (width, height), color=(8, 8, 10))
draw_t = ImageDraw.Draw(img_tamtara)

# Ultra-subtle luxury dark obsidian gradient
for y in range(height):
    ratio = y / height
    v = int(14 * (1 - ratio) + 6 * ratio)
    draw_t.line([(0, y), (width, y)], fill=(v, v, v + 2))

# Elegant gold/metallic outer border
draw_t.rounded_rectangle([24, 24, width - 24, height - 24], radius=32, outline=(245, 158, 11, 140), width=2)

# Top Eyebrow
bw, bh = 490, 42
bx, by = (width - bw) // 2, 50
draw_t.rounded_rectangle([bx, by, bx + bw, by + bh], radius=21, fill=(22, 22, 26), outline=(245, 158, 11), width=1)
draw_t.text((width // 2, by + bh // 2), "LUXURY FINE DINE & ARTISAN CAFE  •  NAGPUR", fill=(253, 230, 138), font=font_eyebrow, anchor="mm")

# Business Title
draw_t.text((width // 2, 134), "TAMTARA", fill=(255, 255, 255), font=font_title, anchor="mm")

# 5 Gold Stars
draw_stars(draw_t, 194)

# High-contrast White QR Container
cw, ch = 540, 540
cx, cy = (width - cw) // 2, 242
draw_t.rounded_rectangle([cx - 4, cy - 4, cx + cw + 4, cy + ch + 4], radius=36, fill=(245, 158, 11, 90))
draw_t.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=32, fill=(255, 255, 255))

qr_t = Image.open(os.path.join(public_dir, "tamtara-qr.png")).resize((480, 480), Image.Resampling.LANCZOS)
img_tamtara.paste(qr_t, ((width - 480) // 2, cy + 30))

# Headings & Instructions
draw_t.text((width // 2, 835), "Loved Your Dining Experience?", fill=(245, 158, 11), font=font_sub, anchor="mm")
draw_t.text((width // 2, 885), "Scan with your phone camera to leave a 5-star Google review", fill=(255, 255, 255), font=font_desc, anchor="mm")
draw_t.text((width // 2, 918), "and share your experience with our flavors & aesthetic ambiance!", fill=(212, 212, 216), font=font_desc, anchor="mm")

# Micro Trust Pillars
pills_t = ["Gourmet Flavors", "Aesthetic Ambiance", "Exquisite Service"]
pw, ph, sp = 216, 36, 14
tot_w = len(pills_t) * pw + (len(pills_t) - 1) * sp
start_px = (width - tot_w) // 2
py = 970
for i, p in enumerate(pills_t):
    px = start_px + i * (pw + sp)
    draw_t.rounded_rectangle([px, py, px + pw, py + ph], radius=18, fill=(20, 20, 24), outline=(245, 158, 11), width=1)
    draw_t.text((px + pw // 2, py + ph // 2), p, fill=(253, 230, 138), font=font_pill, anchor="mm")

# Divider line
draw_t.line([(80, 1045), (width - 80, 1045)], fill=(60, 60, 68), width=1)

# Footer
draw_t.text((width // 2, 1085), "Official Google Review Solicitation Portal", fill=(255, 255, 255), font=font_footer, anchor="mm")
draw_t.text((width // 2, 1120), "review.welurik.com/r/tamtara", fill=(245, 158, 11), font=font_footersub, anchor="mm")
draw_t.text((width // 2, 1150), "Tamtara  |  Ring Road, Dabha, Nagpur  |  Fine Dine & Cafe", fill=(161, 161, 170), font=font_footersub, anchor="mm")

# Save Tamtara Black Standee
img_tamtara.save(os.path.join(artifact_dir, "tamtara-black-standee.png"), quality=95)
img_tamtara.save(os.path.join(public_dir, "tamtara-black-standee.png"), quality=95)
# Also update primary standee
img_tamtara.save(os.path.join(artifact_dir, "tamtara-standee.png"), quality=95)
img_tamtara.save(os.path.join(public_dir, "tamtara-standee.png"), quality=95)
print("SUCCESS: Tamtara Black Standee created!")

# =============================================================
# 2. RAASTA - PURE MATTE BLACK ROOFTOP EDITION
# =============================================================
img_raasta = Image.new('RGB', (width, height), color=(8, 8, 10))
draw_r = ImageDraw.Draw(img_raasta)

# Ultra-subtle luxury dark obsidian gradient
for y in range(height):
    ratio = y / height
    v = int(14 * (1 - ratio) + 6 * ratio)
    draw_r.line([(0, y), (width, y)], fill=(v, v, v + 2))

# Elegant outer border with gold/crimson metallic accent
draw_r.rounded_rectangle([24, 24, width - 24, height - 24], radius=32, outline=(244, 63, 94, 140), width=2)

# Top Eyebrow
bw_r, bh_r = 520, 42
bx_r, by_r = (width - bw_r) // 2, 50
draw_r.rounded_rectangle([bx_r, by_r, bx_r + bw_r, by_r + bh_r], radius=21, fill=(24, 18, 22), outline=(244, 63, 94), width=1)
draw_r.text((width // 2, by_r + bh_r // 2), "ROOFTOP RESTAURANT, CAFE & LOUNGE  •  NAGPUR", fill=(254, 205, 211), font=font_eyebrow, anchor="mm")

# Business Title
draw_r.text((width // 2, 134), "RAASTA", fill=(255, 255, 255), font=font_title, anchor="mm")

# 5 Gold Stars
draw_stars(draw_r, 194)

# QR Container
draw_r.rounded_rectangle([cx - 4, cy - 4, cx + cw + 4, cy + ch + 4], radius=36, fill=(244, 63, 94, 90))
draw_r.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=32, fill=(255, 255, 255))

qr_r = Image.open(os.path.join(public_dir, "raasta-qr.png")).resize((480, 480), Image.Resampling.LANCZOS)
img_raasta.paste(qr_r, ((width - 480) // 2, cy + 30))

# Headings & Instructions
draw_r.text((width // 2, 835), "Loved The Rooftop Vibe Tonight?", fill=(251, 113, 133), font=font_sub, anchor="mm")
draw_r.text((width // 2, 885), "Scan with your phone camera to leave a 5-star Google review", fill=(255, 255, 255), font=font_desc, anchor="mm")
draw_r.text((width // 2, 918), "and help more foodies discover our skyline views & live music!", fill=(212, 212, 216), font=font_desc, anchor="mm")

# Micro Trust Pillars
pills_r = ["Panoramic Views", "Live Music & Beats", "Gourmet Dining"]
tot_w_r = len(pills_r) * pw + (len(pills_r) - 1) * sp
start_px_r = (width - tot_w_r) // 2
for i, p in enumerate(pills_r):
    px = start_px_r + i * (pw + sp)
    draw_r.rounded_rectangle([px, py, px + pw, py + ph], radius=18, fill=(24, 18, 22), outline=(244, 63, 94), width=1)
    draw_r.text((px + pw // 2, py + ph // 2), p, fill=(254, 205, 211), font=font_pill, anchor="mm")

# Divider line
draw_r.line([(80, 1045), (width - 80, 1045)], fill=(60, 60, 68), width=1)

# Footer
draw_r.text((width // 2, 1085), "Official Google Review Solicitation Portal", fill=(255, 255, 255), font=font_footer, anchor="mm")
draw_r.text((width // 2, 1120), "review.welurik.com/r/raasta", fill=(251, 113, 133), font=font_footersub, anchor="mm")
draw_r.text((width // 2, 1150), "Raasta  |  Dharampeth Ext, Shivaji Nagar, Nagpur  |  Rooftop", fill=(161, 161, 170), font=font_footersub, anchor="mm")

# Save Raasta Black Standee
img_raasta.save(os.path.join(artifact_dir, "raasta-black-standee.png"), quality=95)
img_raasta.save(os.path.join(public_dir, "raasta-black-standee.png"), quality=95)
# Also update primary standee
img_raasta.save(os.path.join(artifact_dir, "raasta-standee.png"), quality=95)
img_raasta.save(os.path.join(public_dir, "raasta-standee.png"), quality=95)
print("SUCCESS: Raasta Black Standee created!")
