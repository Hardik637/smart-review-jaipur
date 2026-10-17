import math
import os
from PIL import Image, ImageDraw, ImageFont

width = 800
height = 1200

# Rich luxury dark berry / chocolate obsidian background
img = Image.new('RGB', (width, height), color=(24, 10, 16))
draw = ImageDraw.Draw(img)

# Subtle dessert gradient
for y in range(height):
    ratio = y / height
    r = int(32 * (1 - ratio) + 16 * ratio)
    g = int(12 * (1 - ratio) + 8 * ratio)
    b = int(22 * (1 - ratio) + 14 * ratio)
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

# 1. Outer Border with berry-pink glow
draw.rounded_rectangle([24, 24, width - 24, height - 24], radius=32, outline=(225, 29, 72, 100), width=2)

# 2. Top Eyebrow Tag
badge_text = "SHARE YOUR VALUED EXPERIENCE"
badge_w = 400
badge_h = 42
bx = (width - badge_w) // 2
by = 50
draw.rounded_rectangle([bx, by, bx + badge_w, by + badge_h], radius=21, fill=(45, 12, 25), outline=(244, 63, 94), width=1)
draw.text((width // 2, by + (badge_h // 2)), badge_text, fill=(253, 164, 175), font=font_eyebrow, anchor="mm")

# 3. Business Title
draw.text((width // 2, 134), "Sugar Rush", fill=(255, 255, 255), font=font_title, anchor="mm")

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
# Outer soft rose glow
draw.rounded_rectangle([cx - 4, cy - 4, cx + container_w + 4, cy + container_h + 4], radius=36, fill=(225, 29, 72, 60))
# Crisp white card
draw.rounded_rectangle([cx, cy, cx + container_w, cy + container_h], radius=32, fill=(255, 255, 255))

# Paste QR Code
qr_path = "e:/anti/google review app/public/sugar-rush-qr.png"
if os.path.exists(qr_path):
    qr_img = Image.open(qr_path)
    qr_resized = qr_img.resize((480, 480), Image.Resampling.LANCZOS)
    img.paste(qr_resized, ((width - 480) // 2, cy + 30))

# 6. Headline Prompt
draw.text((width // 2, 835), "Loved Our Waffles, Shakes & Desserts?", fill=(251, 113, 133), font=font_sub, anchor="mm")

# 7. Subtitle Instructions
line1 = "Scan with your phone camera or any scanner to leave"
line2 = "a 5-star Google review & share your sweet experience!"
draw.text((width // 2, 885), line1, fill=(243, 244, 246), font=font_desc, anchor="mm")
draw.text((width // 2, 918), line2, fill=(229, 231, 235), font=font_desc, anchor="mm")

# 8. Micro Trust Pillars
pills = ["1-Tap AI Review", "Gourmet Desserts", "100% Fresh"]
pill_w = 176
pill_h = 36
spacing = 18
total_pills_w = len(pills) * pill_w + (len(pills) - 1) * spacing
start_px = (width - total_pills_w) // 2
py = 970

for idx, p in enumerate(pills):
    px = start_px + idx * (pill_w + spacing)
    draw.rounded_rectangle([px, py, px + pill_w, py + pill_h], radius=18, fill=(45, 12, 25), outline=(225, 29, 72), width=1)
    draw.text((px + pill_w // 2, py + pill_h // 2), p, fill=(254, 205, 211), font=font_pill, anchor="mm")

# 9. Divider line
draw.line([(80, 1045), (width - 80, 1045)], fill=(75, 25, 45), width=1)

# 10. Footer Brand & Google Attribution
draw.text((width // 2, 1085), "Official Google Review Solicitation Portal", fill=(255, 255, 255), font=font_footer, anchor="mm")
draw.text((width // 2, 1120), "review.welurik.com/r/sugar-rush", fill=(251, 113, 133), font=font_footersub, anchor="mm")
draw.text((width // 2, 1150), "Sugar Rush  |  Shree Heera Sweets, Medical Sq, Nagpur  |  +91 99608 72777", fill=(156, 163, 175), font=font_footersub, anchor="mm")

# Output files
out_artifact = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82/sugar-rush-standee.png"
out_public = "e:/anti/google review app/public/sugar-rush-standee.png"

img.save(out_artifact, quality=95)
img.save(out_public, quality=95)
print("SUCCESS: Sugar Rush standee saved to artifact and public directories.")
