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
        draw.polygon(coords, fill=(245, 158, 11))

# =============================================================
# 1. CHANDAK NX - ROYAL GOLD & BRONZE EDITION
# =============================================================
img_gold = Image.new('RGB', (width, height), color=(18, 14, 10))
draw_g = ImageDraw.Draw(img_gold)

for y in range(height):
    ratio = y / height
    r = int(28 * (1 - ratio) + 12 * ratio)
    g = int(20 * (1 - ratio) + 8 * ratio)
    b = int(14 * (1 - ratio) + 6 * ratio)
    draw_g.line([(0, y), (width, y)], fill=(r, g, b))

draw_g.rounded_rectangle([24, 24, width - 24, height - 24], radius=32, outline=(217, 119, 6, 130), width=2)

bw, bh = 560, 42
bx, by = (width - bw) // 2, 50
draw_g.rounded_rectangle([bx, by, bx + bw, by + bh], radius=21, fill=(69, 39, 10), outline=(245, 158, 11), width=1)
draw_g.text((width // 2, by + bh // 2), "MEN'S ETHNIC WEAR & DESIGNER SUITS  •  NAGPUR", fill=(254, 243, 199), font=font_pill, anchor="mm")

draw_g.text((width // 2, 134), "Chandak NX", fill=(255, 255, 255), font=font_title, anchor="mm")
draw_stars(draw_g, 194)

cw, ch = 540, 540
cx, cy = (width - cw) // 2, 242
draw_g.rounded_rectangle([cx - 4, cy - 4, cx + cw + 4, cy + ch + 4], radius=36, fill=(217, 119, 6, 80))
draw_g.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=32, fill=(255, 255, 255))

qr_img = Image.open(os.path.join(public_dir, "chandak-nx-qr.png")).resize((480, 480), Image.Resampling.LANCZOS)
img_gold.paste(qr_img, ((width - 480) // 2, cy + 30))

draw_g.text((width // 2, 835), "Loved Your Shopping & Styling Experience?", fill=(251, 191, 36), font=font_sub, anchor="mm")
draw_g.text((width // 2, 885), "Scan with your phone camera to leave a 5-star Google review", fill=(254, 243, 199), font=font_desc, anchor="mm")
draw_g.text((width // 2, 918), "and share your wedding & festive look with our community!", fill=(253, 230, 138), font=font_desc, anchor="mm")

pills = ["Designer Sherwanis", "Custom Tailoring", "Premium Fabrics"]
pw, ph, sp = 216, 36, 14
tot_w = len(pills) * pw + (len(pills) - 1) * sp
start_px = (width - tot_w) // 2
py = 970
for i, p in enumerate(pills):
    px = start_px + i * (pw + sp)
    draw_g.rounded_rectangle([px, py, px + pw, py + ph], radius=18, fill=(69, 39, 10), outline=(217, 119, 6), width=1)
    draw_g.text((px + pw // 2, py + ph // 2), p, fill=(254, 243, 199), font=font_pill, anchor="mm")

draw_g.line([(80, 1045), (width - 80, 1045)], fill=(120, 53, 15), width=1)
draw_g.text((width // 2, 1085), "Official Google Review Solicitation Portal", fill=(255, 255, 255), font=font_footer, anchor="mm")
draw_g.text((width // 2, 1120), "review.welurik.com/r/chandak-nx", fill=(251, 191, 36), font=font_footersub, anchor="mm")
draw_g.text((width // 2, 1150), "Chandak NX  |  Gandhibagh, Nagpur  |  Men's Ethnic Wear", fill=(180, 150, 120), font=font_footersub, anchor="mm")

img_gold.save(os.path.join(artifact_dir, "chandak-nx-standee.png"), quality=95)
img_gold.save(os.path.join(public_dir, "chandak-nx-standee.png"), quality=95)
print("SUCCESS: Chandak NX Gold Standee created!")

# =============================================================
# 2. CHANDAK NX - PURE MATTE BLACK LUXURY EDITION
# =============================================================
img_black = Image.new('RGB', (width, height), color=(8, 8, 10))
draw_b = ImageDraw.Draw(img_black)

for y in range(height):
    ratio = y / height
    v = int(14 * (1 - ratio) + 6 * ratio)
    draw_b.line([(0, y), (width, y)], fill=(v, v, v + 2))

draw_b.rounded_rectangle([24, 24, width - 24, height - 24], radius=32, outline=(245, 158, 11, 140), width=2)

draw_b.rounded_rectangle([bx, by, bx + bw, by + bh], radius=21, fill=(22, 22, 26), outline=(245, 158, 11), width=1)
draw_b.text((width // 2, by + bh // 2), "MEN'S ETHNIC WEAR & DESIGNER SUITS  •  NAGPUR", fill=(253, 230, 138), font=font_pill, anchor="mm")

draw_b.text((width // 2, 134), "Chandak NX", fill=(255, 255, 255), font=font_title, anchor="mm")
draw_stars(draw_b, 194)

draw_b.rounded_rectangle([cx - 4, cy - 4, cx + cw + 4, cy + ch + 4], radius=36, fill=(245, 158, 11, 90))
draw_b.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=32, fill=(255, 255, 255))
img_black.paste(qr_img, ((width - 480) // 2, cy + 30))

draw_b.text((width // 2, 835), "Loved Your Shopping & Styling Experience?", fill=(245, 158, 11), font=font_sub, anchor="mm")
draw_b.text((width // 2, 885), "Scan with your phone camera to leave a 5-star Google review", fill=(255, 255, 255), font=font_desc, anchor="mm")
draw_b.text((width // 2, 918), "and share your wedding & festive look with our community!", fill=(212, 212, 216), font=font_desc, anchor="mm")

for i, p in enumerate(pills):
    px = start_px + i * (pw + sp)
    draw_b.rounded_rectangle([px, py, px + pw, py + ph], radius=18, fill=(20, 20, 24), outline=(245, 158, 11), width=1)
    draw_b.text((px + pw // 2, py + ph // 2), p, fill=(253, 230, 138), font=font_pill, anchor="mm")

draw_b.line([(80, 1045), (width - 80, 1045)], fill=(60, 60, 68), width=1)
draw_b.text((width // 2, 1085), "Official Google Review Solicitation Portal", fill=(255, 255, 255), font=font_footer, anchor="mm")
draw_b.text((width // 2, 1120), "review.welurik.com/r/chandak-nx", fill=(245, 158, 11), font=font_footersub, anchor="mm")
draw_b.text((width // 2, 1150), "Chandak NX  |  Gandhibagh, Nagpur  |  Men's Ethnic Wear", fill=(161, 161, 170), font=font_footersub, anchor="mm")

img_black.save(os.path.join(artifact_dir, "chandak-nx-black-standee.png"), quality=95)
img_black.save(os.path.join(public_dir, "chandak-nx-black-standee.png"), quality=95)
print("SUCCESS: Chandak NX Black Standee created!")
