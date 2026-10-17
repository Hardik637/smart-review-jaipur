import math
import os
from PIL import Image, ImageDraw, ImageFont

width = 800
height = 1200

# Sleek deep obsidian slate background
img = Image.new('RGB', (width, height), color=(10, 15, 26))
draw = ImageDraw.Draw(img)

# Smooth clean cyan/slate gradient
for y in range(height):
    ratio = y / height
    r = int(12 * (1 - ratio) + 8 * ratio)
    g = int(24 * (1 - ratio) + 14 * ratio)
    b = int(38 * (1 - ratio) + 20 * ratio)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Fonts
try:
    font_eyebrow = ImageFont.truetype('arialbd.ttf', 20)
    font_title = ImageFont.truetype('arialbd.ttf', 44)
    font_sub = ImageFont.truetype('arialbd.ttf', 27)
    font_desc = ImageFont.truetype('arial.ttf', 22)
    font_pill = ImageFont.truetype('arialbd.ttf', 17)
    font_footer = ImageFont.truetype('arialbd.ttf', 20)
    font_footersub = ImageFont.truetype('arial.ttf', 18)
except Exception:
    font_eyebrow = font_title = font_sub = font_desc = font_pill = font_footer = font_footersub = ImageFont.load_default()

# 1. Outer Border with cyan neon glow
draw.rounded_rectangle([24, 24, width - 24, height - 24], radius=32, outline=(14, 165, 233, 130), width=2)

# 2. Top Eyebrow Tag
badge_text = "DIGITAL MEDIA & CREATIVE TECH  •  NAGPUR"
badge_w = 480
badge_h = 42
bx = (width - badge_w) // 2
by = 50
draw.rounded_rectangle([bx, by, bx + badge_w, by + badge_h], radius=21, fill=(8, 47, 73), outline=(14, 165, 233), width=1)
draw.text((width // 2, by + (badge_h // 2)), badge_text, fill=(186, 230, 253), font=font_eyebrow, anchor="mm")

# 3. Business Title
draw.text((width // 2, 134), "welurik.media", fill=(255, 255, 255), font=font_title, anchor="mm")

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
# Outer soft cyan glow
draw.rounded_rectangle([cx - 4, cy - 4, cx + container_w + 4, cy + container_h + 4], radius=36, fill=(14, 165, 233, 80))
# Crisp white card
draw.rounded_rectangle([cx, cy, cx + container_w, cy + container_h], radius=32, fill=(255, 255, 255))

# Paste QR Code
qr_path = "e:/anti/google review app/public/welurik-media-qr.png"
if os.path.exists(qr_path):
    qr_img = Image.open(qr_path)
    qr_resized = qr_img.resize((480, 480), Image.Resampling.LANCZOS)
    img.paste(qr_resized, ((width - 480) // 2, cy + 30))

# 6. Headline Prompt
draw.text((width // 2, 835), "Loved Partnering With Us?", fill=(56, 189, 248), font=font_sub, anchor="mm")

# 7. Subtitle Instructions
line1 = "Scan with your phone camera to leave a 5-star Google review"
line2 = "and help more forward-thinking brands discover Welurik!"
draw.text((width // 2, 885), line1, fill=(240, 249, 255), font=font_desc, anchor="mm")
draw.text((width // 2, 918), line2, fill=(186, 230, 253), font=font_desc, anchor="mm")

# 8. Micro Trust Pillars
pills = ["Creative Strategy", "Fast Delivery", "Measurable Growth"]
pill_w = 216
pill_h = 36
spacing = 14
total_pills_w = len(pills) * pill_w + (len(pills) - 1) * spacing
start_px = (width - total_pills_w) // 2
py = 970

for idx, p in enumerate(pills):
    px = start_px + idx * (pill_w + spacing)
    draw.rounded_rectangle([px, py, px + pill_w, py + pill_h], radius=18, fill=(8, 47, 73), outline=(14, 165, 233), width=1)
    draw.text((px + pill_w // 2, py + pill_h // 2), p, fill=(186, 230, 253), font=font_pill, anchor="mm")

# 9. Divider line
draw.line([(80, 1045), (width - 80, 1045)], fill=(12, 74, 110), width=1)

# 10. Footer Brand & Google Attribution
draw.text((width // 2, 1085), "Official Google Review Solicitation Portal", fill=(255, 255, 255), font=font_footer, anchor="mm")
draw.text((width // 2, 1120), "review.welurik.com/r/welurik-media", fill=(56, 189, 248), font=font_footersub, anchor="mm")
draw.text((width // 2, 1150), "welurik.media  |  Digital Media & Tech Agency  |  Nagpur", fill=(148, 163, 184), font=font_footersub, anchor="mm")

# Output files
out_artifact = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82/welurik-media-standee.png"
out_public = "e:/anti/google review app/public/welurik-media-standee.png"

img.save(out_artifact, quality=95)
img.save(out_public, quality=95)

print("SUCCESS: welurik.media standee saved successfully!")
