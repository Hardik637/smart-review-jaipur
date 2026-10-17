import os
from PIL import Image, ImageDraw

def export_bespoke_2_assets():
    # 1. Generate SVG Code for Bespoke 2
    svg_black = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="320 180 550 830" width="100%" height="100%">
  <!-- Central Spine Blade -->
  <polygon points="670,210 590,260 480,980 560,930" fill="#0A0B0E" />
  
  <!-- Left Falcon-Wing W -->
  <polygon points="550,400 440,470 350,610 420,640 370,770 450,790 500,670 450,630 520,520" fill="#0A0B0E" />
  
  <!-- Right Chiseled R -->
  <polygon points="610,420 770,450 830,540 800,650 700,690 800,820 740,910 650,760 590,750 600,670 710,640 740,560 680,490 615,470" fill="#0A0B0E" />
</svg>'''

    svg_white = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="320 180 550 830" width="100%" height="100%">
  <!-- Central Spine Blade -->
  <polygon points="670,210 590,260 480,980 560,930" fill="#FFFFFF" />
  
  <!-- Left Falcon-Wing W -->
  <polygon points="550,400 440,470 350,610 420,640 370,770 450,790 500,670 450,630 520,520" fill="#FFFFFF" />
  
  <!-- Right Chiseled R -->
  <polygon points="610,420 770,450 830,540 800,650 700,690 800,820 740,910 650,760 590,750 600,670 710,640 740,560 680,490 615,470" fill="#FFFFFF" />
</svg>'''

    # Write SVGs to public directory
    with open(r"e:\anti\google review app\public\logo-black.svg", "w", encoding="utf-8") as f:
        f.write(svg_black)
    with open(r"e:\anti\google review app\public\logo-white.svg", "w", encoding="utf-8") as f:
        f.write(svg_white)
    with open(r"e:\anti\google review app\public\logo.svg", "w", encoding="utf-8") as f:
        f.write(svg_black)

    # 2. Generate Transparent High-Resolution PNGs (for Favicon / Social / Direct Images)
    size = (1200, 1200)
    
    # White on Transparent
    img_white = Image.new("RGBA", size, (0, 0, 0, 0))
    draw_w = ImageDraw.Draw(img_white)
    draw_w.polygon([(670, 210), (590, 260), (480, 980), (560, 930)], fill=(255, 255, 255, 255))
    draw_w.polygon([(550, 400), (440, 470), (350, 610), (420, 640), (370, 770), (450, 790), (500, 670), (450, 630), (520, 520)], fill=(255, 255, 255, 255))
    draw_w.polygon([(610, 420), (770, 450), (830, 540), (800, 650), (700, 690), (800, 820), (740, 910), (650, 760), (590, 750), (600, 670), (710, 640), (740, 560), (680, 490), (615, 470)], fill=(255, 255, 255, 255))
    img_white.save(r"e:\anti\google review app\public\wr-logo-white.png")

    # Black on Transparent
    img_black = Image.new("RGBA", size, (0, 0, 0, 0))
    draw_b = ImageDraw.Draw(img_black)
    draw_b.polygon([(670, 210), (590, 260), (480, 980), (560, 930)], fill=(10, 11, 14, 255))
    draw_b.polygon([(550, 400), (440, 470), (350, 610), (420, 640), (370, 770), (450, 790), (500, 670), (450, 630), (520, 520)], fill=(10, 11, 14, 255))
    draw_b.polygon([(610, 420), (770, 450), (830, 540), (800, 650), (700, 690), (800, 820), (740, 910), (650, 760), (590, 750), (600, 670), (710, 640), (740, 560), (680, 490), (615, 470)], fill=(10, 11, 14, 255))
    img_black.save(r"e:\anti\google review app\public\wr-logo-black.png")

    # Generate App Icon (Squircle Tile)
    icon_tile = Image.new("RGBA", (512, 512), (10, 11, 14, 255))
    draw_tile = ImageDraw.Draw(icon_tile)
    # Paste resized white monogram into center
    scaled_w = img_white.resize((420, 420), Image.Resampling.LANCZOS)
    icon_tile.paste(scaled_w, (46, 46), scaled_w)
    icon_tile.save(r"e:\anti\google review app\public\icon.png")

    print("Bespoke 2 SVG & PNG vector assets exported successfully")

if __name__ == "__main__":
    export_bespoke_2_assets()
