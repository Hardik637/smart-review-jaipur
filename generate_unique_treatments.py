from PIL import Image, ImageDraw

def generate_unique_treatments():
    ref_path = r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\.user_uploaded\media_1788117921112.png"
    base_img = Image.open(ref_path).convert("RGBA")
    
    # Extract exact white glyph on transparent background
    datas = base_img.getdata()
    glyph_data = []
    for item in datas:
        if (item[0] + item[1] + item[2]) // 3 > 90:
            glyph_data.append((255, 255, 255, 255))
        else:
            glyph_data.append((0, 0, 0, 0))
            
    glyph_raw = Image.new("RGBA", base_img.size)
    glyph_raw.putdata(glyph_data)
    glyph_1200 = glyph_raw.resize((1200, 1200), Image.Resampling.LANCZOS)

    # -------------------------------------------------------------
    # Treatment 1: "Negative-Space Laser Slice"
    # -------------------------------------------------------------
    t1 = Image.new("RGBA", (1200, 1200), (10, 11, 14, 255))
    t1.paste(glyph_1200, (0, 0), glyph_1200)
    draw_t1 = ImageDraw.Draw(t1)
    
    # Diagonal laser cuts creating high-tech segmented signature
    draw_t1.polygon([(460, 410), (740, 310), (755, 335), (475, 435)], fill=(10, 11, 14, 255))
    draw_t1.polygon([(620, 770), (790, 710), (800, 730), (630, 790)], fill=(10, 11, 14, 255))
    t1.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\unique_t1_laser_slice.png")

    # -------------------------------------------------------------
    # Treatment 2: "Dual-Tone Cyber Gold Accent"
    # -------------------------------------------------------------
    # Render with pure PIL per-pixel pass
    t2 = Image.new("RGBA", (1200, 1200), (10, 11, 14, 255))
    t2_pixels = []
    # Center spine bounding box roughly x: 500-680, slant y = -1.2*x + 1000
    for y in range(1200):
        for x in range(1200):
            pixel = glyph_1200.getpixel((x, y))
            if pixel[3] > 100:
                # Check if in central diagonal blade zone
                # Line equation for diagonal blade: x between ~450+ (y*0.2) and 650+(y*0.2)
                blade_center = 630 - (y * 0.16)
                if abs(x - blade_center) < 65:
                    t2_pixels.append((251, 191, 36, 255)) # Rich Gold
                else:
                    t2_pixels.append((255, 255, 255, 255)) # Crisp White
            else:
                t2_pixels.append((10, 11, 14, 255)) # Dark background

    t2_img = Image.new("RGBA", (1200, 1200))
    t2_img.putdata(t2_pixels)
    t2_img.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\unique_t2_dual_tone.png")

    # -------------------------------------------------------------
    # Treatment 3: "Minimalist Obsidian Hex-Crest Badge"
    # -------------------------------------------------------------
    t3 = Image.new("RGBA", (1200, 1200), (10, 11, 14, 255))
    draw_t3 = ImageDraw.Draw(t3)
    badge = [
        (600, 120),
        (980, 320),
        (980, 880),
        (600, 1080),
        (220, 880),
        (220, 320)
    ]
    draw_t3.polygon(badge, fill=(18, 20, 26, 255), outline=(255, 255, 255, 60), width=4)
    glyph_scaled = glyph_raw.resize((780, 780), Image.Resampling.LANCZOS)
    t3.paste(glyph_scaled, (210, 210), glyph_scaled)
    t3.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\unique_t3_hex_crest.png")

    # 3-Up Showcase
    showcase = Image.new("RGBA", (3600, 1320), (5, 6, 8, 255))
    showcase.paste(t1, (0, 60))
    showcase.paste(t2_img, (1200, 60))
    showcase.paste(t3, (2400, 60))
    showcase.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\unique_treatments_showcase.png")

    print("Unique treatments showcase generated successfully")

if __name__ == "__main__":
    generate_unique_treatments()
