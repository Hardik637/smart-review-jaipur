import math
from PIL import Image, ImageDraw, ImageFont

def create_option_1():
    # Option 1: Exact Razor Blade WR (Angled Sword Blade + Hooked W Wing + Sharp R)
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # Central Blade Slash
    blade = [
        (660, 240),
        (580, 290),
        (500, 960),
        (580, 910)
    ]
    draw.polygon(blade, fill=(255, 255, 255, 255))

    # Left 'W' Sharp Wings
    w_outer = [
        (540, 420),
        (460, 470),
        (380, 620),
        (440, 670),
        (420, 750),
        (480, 780),
        (510, 670),
        (460, 640),
        (520, 540)
    ]
    draw.polygon(w_outer, fill=(255, 255, 255, 255))

    # Right 'R' Loop & Lower Blade Kick
    r_loop = [
        (610, 430),
        (760, 470),
        (820, 560),
        (780, 660),
        (690, 690),
        (760, 780),
        (720, 890),
        (660, 750),
        (590, 740),
        (600, 660),
        (710, 630),
        (740, 560),
        (690, 500),
        (615, 480)
    ]
    draw.polygon(r_loop, fill=(255, 255, 255, 255))

    return img

def create_option_2():
    # Option 2: Geometric Cyber Blade WR (Ultra Sharp Isometric 45° Cuts)
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # Center Blade
    draw.polygon([(650, 220), (590, 260), (490, 980), (550, 940)], fill=(255, 255, 255, 255))

    # Left W Sharp Multi-Facet
    draw.polygon([(540, 390), (420, 480), (370, 630), (440, 660), (410, 770), (470, 790), (520, 660), (470, 640), (510, 510)], fill=(255, 255, 255, 255))

    # Right R Loop with Hexagonal Cuts
    draw.polygon([(605, 410), (750, 440), (830, 540), (810, 650), (710, 700), (790, 820), (740, 900), (660, 760), (585, 750), (600, 670), (710, 640), (750, 560), (690, 490), (610, 470)], fill=(255, 255, 255, 255))

    return img

def create_option_3():
    # Option 3: Cyber Apex Star WR (Sharp Blade + Amber Gold Diamond Facet)
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # Center Blade
    draw.polygon([(660, 240), (580, 290), (500, 960), (580, 910)], fill=(255, 255, 255, 255))

    # Left W
    draw.polygon([(540, 420), (460, 470), (380, 620), (440, 670), (420, 750), (480, 780), (510, 670), (460, 640), (520, 540)], fill=(255, 255, 255, 255))

    # Right R
    draw.polygon([(610, 430), (760, 470), (820, 560), (780, 660), (690, 690), (760, 780), (720, 890), (660, 750), (590, 740), (600, 660), (710, 630), (740, 560), (690, 500), (615, 480)], fill=(255, 255, 255, 255))

    # Golden Apex Star Diamond Spark
    star = [
        (620, 180),
        (635, 215),
        (670, 230),
        (635, 245),
        (620, 280),
        (605, 245),
        (570, 230),
        (605, 215)
    ]
    draw.polygon(star, fill=(251, 191, 36, 255))

    return img

def create_showcase():
    user_ref = Image.open(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\.user_uploaded\media_1788117921112.png").convert("RGBA")
    
    # Save the individual options
    user_ref.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_opt1_exact_ref.png")
    opt2 = create_option_2()
    opt2.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_opt2_cyber_blade.png")
    opt3 = create_option_3()
    opt3.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_opt3_apex_star.png")

    # Create a 3-up showcase side-by-side
    w, h = 1200, 1200
    showcase = Image.new("RGBA", (3600, 1320), (5, 6, 8, 255))
    showcase.paste(user_ref.resize((1200, 1200)), (0, 60))
    showcase.paste(opt2, (1200, 60))
    showcase.paste(opt3, (2400, 60))

    showcase.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_3_options_showcase.png")
    print("Showcase generated successfully")

if __name__ == "__main__":
    create_showcase()
