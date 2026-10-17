import math
import os
from PIL import Image, ImageDraw, ImageFont

width = 800
height = 1200

# Luxury rich kesar / saffron mithai obsidian background
img = Image.new('RGB', (width, height), color=(28, 16, 4))
draw = ImageDraw.Draw(img)

# Deep royal amber-gold gradient
for y in range(height):
    ratio = y / height
    r = int(36 * (1 - ratio) + 18 * ratio)
    g = int(20 * (1 - ratio) + 10 * ratio)
    b = int(6 * (1 - ratio) + 3 * ratio)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Fonts
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

# 1. Outer Border with warm gold / kesar glow
draw.rounded_rectangle([24, 24, width - 24, height - 24], radius=32, outline=(217, 119, 6, 120), width=2)

# 2. Top Eyebrow Tag
badge_text = "NAGPUR'S ICONIC SWEET DESTINATION"
badge_w = 460
badge_h = 42
bx = (width - badge_w) // 2
by = 50
draw.rounded_rectangle([bx, by, bx + badge_w, by + badge_h], radius=21, fill=(55, 28, 6), outline=(245, 158, 11), width=1)
draw.text((width // 2, by + (badge_h // 2)), badge_text, fill=(253, 230, 138), font=font_eyebrow, anchor="mm")

# 3. Business Title
draw.text((width // 2, 134), "Shree Heera Sweets", fill=(255, 255, 255), font=font_title, anchor="mm")

# 4. 5 Gold Stars
star_spacing = 42
start_x = width // 2 - 2 * star_spacing
for i in range(5):
    cx = start_x + i * star_spacing
    cy = 194
    coords = []
    for s in range(10):
        r = 16 if s % 2 == 0 else 7.5
        angle = math.pi / 2 * 3 + s * (math.pi / 5)
        coords.append((cx + math.cos(angle) * r, cy + math.sin(angle) * r))
    draw.polygon(coords, fill=(251, 191, 36))

# 5. QR Code White Frame Container
container_w = 540
container_h = 540
cx = (width - container_w) // 2
cy = 242
# Outer soft saffron glow
draw.rounded_rectangle([cx - 4, cy - 4, cx + container_w + 4, cy + container_h + 4], radius=36, fill=(217, 119, 6, 80))
# Crisp white card
draw.rounded_rectangle([cx, cy, cx + container_w, cy + container_h], radius=32, fill=(255, 255, 255))

# Paste QR Code
qr_path = "e:/anti/google review app/public/shree-heera-sweets-qr.png"
if os.path.exists(qr_path):
    qr_img = Image.open(qr_path)
    qr_resized = qr_img.resize((480, 480), Image.Resampling.LANCZOS)
    img.paste(qr_resized, ((width - 480) // 2, cy + 30))

# 6. Headline Prompt
draw.text((width // 2, 835), "Loved Our Santra Burfi, Mithai & Samosa?", fill=(251, 191, 36), font=font_sub, anchor="mm")

# 7. Subtitle Instructions
line1 = "Scan with your phone camera to leave a 5-star Google review"
line2 = "and help fellow foodies discover Nagpur's authentic taste!"
draw.text((width // 2, 885), line1, fill=(254, 243, 199), font=font_desc, anchor="mm")
draw.text((width // 2, 918), line2, fill=(253, 230, 138), font=font_desc, anchor="mm")

# 8. Micro Trust Pillars
pills = ["100% Pure Desi Ghee", "Iconic Santra Burfi", "Daily Fresh & Hygienic"]
pill_w = 210
pill_h = 36
spacing = 14
total_pills_w = len(pills) * pill_w + (len(pills) - 1) * spacing
start_px = (width - total_pills_w) // 2
py = 970

for idx, p in enumerate(pills):
    px = start_px + idx * (pill_w + spacing)
    draw.rounded_rectangle([px, py, px + pill_w, py + pill_h], radius=18, fill=(55, 28, 6), outline=(217, 119, 6), width=1)
    draw.text((px + pill_w // 2, py + pill_h // 2), p, fill=(254, 240, 138), font=font_pill, anchor="mm")

# 9. Divider line
draw.line([(80, 1045), (width - 80, 1045)], fill=(90, 48, 12), width=1)

# 10. Footer Brand & Google Attribution
draw.text((width // 2, 1085), "Official Google Review Solicitation Portal", fill=(255, 255, 255), font=font_footer, anchor="mm")
draw.text((width // 2, 1120), "review.welurik.com/r/shree-heera-sweets", fill=(251, 191, 36), font=font_footersub, anchor="mm")
draw.text((width // 2, 1150), "Shree Heera Sweets  |  Opp. Haldiram's, Medical Sq, Nagpur  |  +91 99608 72777", fill=(214, 211, 209), font=font_footersub, anchor="mm")

# Output files
out_artifact_heera = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82/shree-heera-sweets-standee.png"
out_public_heera = "e:/anti/google review app/public/shree-heera-sweets-standee.png"

# Also update sugar-rush-standee.png so both paths have the sweet shop branding
out_artifact_sugar = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82/sugar-rush-standee.png"
out_public_sugar = "e:/anti/google review app/public/sugar-rush-standee.png"

img.save(out_artifact_heera, quality=95)
img.save(out_public_heera, quality=95)
img.save(out_artifact_sugar, quality=95)
img.save(out_public_sugar, quality=95)

print("SUCCESS: Shree Heera Sweets standee saved successfully!")
