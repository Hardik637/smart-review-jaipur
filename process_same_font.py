from PIL import Image, ImageDraw

def process_exact_font():
    ref_path = r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\.user_uploaded\media_1788117921112.png"
    img = Image.open(ref_path).convert("RGBA")
    
    # Extract alpha mask of the glyph (letters are bright white, background is black)
    datas = img.getdata()
    
    # 1. Pure White on Transparent (for dark backgrounds)
    white_trans = []
    # 2. Pure Black on Transparent (for light backgrounds)
    black_trans = []

    for item in datas:
        r, g, b = item[0], item[1], item[2]
        # brightness
        brightness = (r + g + b) // 3
        if brightness > 90:
            # Solid white
            white_trans.append((255, 255, 255, 255))
            # Solid black
            black_trans.append((10, 11, 14, 255))
        else:
            white_trans.append((0, 0, 0, 0))
            black_trans.append((0, 0, 0, 0))

    img_white = Image.new("RGBA", img.size)
    img_white.putdata(white_trans)
    
    img_black = Image.new("RGBA", img.size)
    img_black.putdata(black_trans)

    # Save to public folder
    img_white.save(r"e:\anti\google review app\public\wr-logo-white.png")
    img_black.save(r"e:\anti\google review app\public\wr-logo-black.png")

    # Render High-Resolution Previews (1200x1200)
    opt_a = Image.new("RGBA", (1200, 1200), (10, 11, 14, 255))
    resized_w = img_white.resize((1200, 1200), Image.Resampling.LANCZOS)
    opt_a.paste(resized_w, (0, 0), resized_w)
    opt_a.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\same_font_opt_a.png")

    # Option B: Exact Font on Clean White Background (How it looks on the Light Navbar)
    opt_b = Image.new("RGBA", (1200, 1200), (255, 255, 255, 255))
    resized_b = img_black.resize((1200, 1200), Image.Resampling.LANCZOS)
    opt_b.paste(resized_b, (0, 0), resized_b)
    opt_b.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\same_font_opt_b_light.png")

    # Option C: Exact Font + Subtle 5-Star Amber Diamond
    opt_c = opt_a.copy()
    draw_c = ImageDraw.Draw(opt_c)
    star = [
        (665, 260),
        (677, 285),
        (705, 295),
        (677, 305),
        (665, 330),
        (653, 305),
        (625, 295),
        (653, 285)
    ]
    draw_c.polygon(star, fill=(251, 191, 36, 255))
    opt_c.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\same_font_opt_c_star.png")

    # 3-up showcase
    showcase = Image.new("RGBA", (3600, 1320), (5, 6, 8, 255))
    showcase.paste(opt_a, (0, 60))
    showcase.paste(opt_b, (1200, 60))
    showcase.paste(opt_c, (2400, 60))
    showcase.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\same_font_showcase.png")

    print("Exact font transparent assets and showcase ready")

if __name__ == "__main__":
    process_exact_font()
