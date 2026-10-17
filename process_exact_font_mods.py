from PIL import Image, ImageDraw

def process_exact_glyph_modifications():
    # Load 100% original reference image
    ref_path = r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\.user_uploaded\media_1788117921112.png"
    base_img = Image.open(ref_path).convert("RGBA")
    
    # -------------------------------------------------------------
    # Version 1: Exact Font + Joined W/R Bridge + Medium Stretched R Tail
    # -------------------------------------------------------------
    v1 = base_img.copy()
    draw1 = ImageDraw.Draw(v1)
    
    # 1. Join W and R: Fill the negative space gap between the top left W wing and central blade
    # Coordinates mapped directly onto original image coordinates (roughly 1024x1024)
    # The gap between W and blade is around x: 440-520, y: 340-480
    w_bridge = [
        (440, 390),
        (510, 320),
        (540, 370),
        (470, 460)
    ]
    draw1.polygon(w_bridge, fill=(255, 255, 255, 255))
    
    # Also join the lower W notch to blade
    draw1.polygon([(460, 520), (510, 480), (520, 560), (470, 600)], fill=(255, 255, 255, 255))

    # 2. Stretch the bottom end of R:
    # Original R kick tip is at around (630, 620) in 1024 space. Let's extend it along its natural blade angle:
    # Angle vector: dx = +50, dy = +120
    r_stretch_med = [
        (580, 530),
        (650, 540),
        (690, 660), # Stretched tip
        (595, 620),
        (550, 540)
    ]
    draw1.polygon(r_stretch_med, fill=(255, 255, 255, 255))
    
    v1_resized = v1.resize((1200, 1200), Image.Resampling.LANCZOS)
    v1_resized.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\exact_font_v1_medium_stretch.png")

    # -------------------------------------------------------------
    # Version 2: Exact Font + Joined W/R Bridge + Long Aggressive Stretched R Tail
    # -------------------------------------------------------------
    v2 = base_img.copy()
    draw2 = ImageDraw.Draw(v2)
    
    # Join W and R
    draw2.polygon(w_bridge, fill=(255, 255, 255, 255))
    draw2.polygon([(460, 520), (510, 480), (520, 560), (470, 600)], fill=(255, 255, 255, 255))
    
    # Long Stretched R Tail (Blade extension)
    r_stretch_long = [
        (580, 520),
        (650, 530),
        (720, 720), # Extended razor point!
        (610, 670),
        (550, 540)
    ]
    draw2.polygon(r_stretch_long, fill=(255, 255, 255, 255))
    
    v2_resized = v2.resize((1200, 1200), Image.Resampling.LANCZOS)
    v2_resized.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\exact_font_v2_long_stretch.png")

    # -------------------------------------------------------------
    # Version 3: Exact Font + Joined W/R Bridge + Horizontal Swept Tail
    # -------------------------------------------------------------
    v3 = base_img.copy()
    draw3 = ImageDraw.Draw(v3)
    
    # Join W and R
    draw3.polygon(w_bridge, fill=(255, 255, 255, 255))
    draw3.polygon([(460, 520), (510, 480), (520, 560), (470, 600)], fill=(255, 255, 255, 255))
    
    # Swept tail along bottom baseline
    r_stretch_swept = [
        (580, 530),
        (650, 530),
        (740, 620), # Swept to the right
        (640, 640),
        (560, 560)
    ]
    draw3.polygon(r_stretch_swept, fill=(255, 255, 255, 255))
    
    v3_resized = v3.resize((1200, 1200), Image.Resampling.LANCZOS)
    v3_resized.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\exact_font_v3_swept_tail.png")

    # 3-Up Showcase
    showcase = Image.new("RGBA", (3600, 1320), (5, 6, 8, 255))
    showcase.paste(v1_resized, (0, 60))
    showcase.paste(v2_resized, (1200, 60))
    showcase.paste(v3_resized, (2400, 60))
    showcase.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\exact_font_modified_showcase.png")

    print("Direct exact font modifications generated successfully")

if __name__ == "__main__":
    process_exact_glyph_modifications()
