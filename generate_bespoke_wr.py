from PIL import Image, ImageDraw

def render_original_bespoke_1():
    # 1. "The Welurik Katana Monogram" (100% Original Custom Vector Geometry)
    # Aggressive forward-leaning chiseled serif style
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # Central Dominant Katana Blade
    blade = [
        (650, 190),
        (560, 240),
        (470, 990),
        (560, 940)
    ]
    draw.polygon(blade, fill=(255, 255, 255, 255))

    # Left W: Distinct Dual Chisel Wings with Custom Bevels
    # Outer W Wing
    w_wing1 = [
        (540, 370),
        (420, 440),
        (340, 590),
        (410, 620),
        (490, 500)
    ]
    draw.polygon(w_wing1, fill=(255, 255, 255, 255))

    # Inner W Wing (Interlocking speed claw)
    w_wing2 = [
        (500, 530),
        (410, 600),
        (370, 750),
        (440, 780),
        (480, 680)
    ]
    draw.polygon(w_wing2, fill=(255, 255, 255, 255))

    # Right R: Architectural Loop + Dagger Leg
    r_loop = [
        (600, 390),
        (760, 420),
        (840, 510),
        (810, 630),
        (710, 670),
        (590, 650),
        (595, 580),
        (710, 600),
        (740, 540),
        (680, 470),
        (605, 450)
    ]
    draw.polygon(r_loop, fill=(255, 255, 255, 255))

    # R Dagger Kick (Separate chiseled strike)
    r_kick = [
        (680, 680),
        (800, 810),
        (740, 910),
        (640, 750)
    ]
    draw.polygon(r_kick, fill=(255, 255, 255, 255))

    return img

def render_original_bespoke_2():
    # 2. "The Welurik Cyber-Aero WR" (Connected Chiseled Monolith)
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # Spine Blade
    draw.polygon([(670, 210), (590, 260), (480, 980), (560, 930)], fill=(255, 255, 255, 255))

    # Left W: Swept Falcon Wing
    draw.polygon([
        (550, 400),
        (440, 470),
        (350, 610),
        (420, 640),
        (370, 770),
        (450, 790),
        (500, 670),
        (450, 630),
        (520, 520)
    ], fill=(255, 255, 255, 255))

    # Right R: Symmetrical Chiseled Shield Loop + Knife Leg
    draw.polygon([
        (610, 420),
        (770, 450),
        (830, 540),
        (800, 650),
        (700, 690),
        (800, 820),
        (740, 910),
        (650, 760),
        (590, 750),
        (600, 670),
        (710, 640),
        (740, 560),
        (680, 490),
        (615, 470)
    ], fill=(255, 255, 255, 255))

    return img

def render_original_bespoke_3():
    # 3. "The Welurik Razor-Apex WR" (Integrated Star Jewel Spine)
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # Spine Blade with custom top chamfer
    draw.polygon([(660, 230), (580, 280), (490, 970), (570, 920)], fill=(255, 255, 255, 255))

    # Left W Wing
    draw.polygon([
        (540, 390),
        (430, 460),
        (350, 600),
        (420, 630),
        (380, 760),
        (450, 780),
        (500, 660),
        (450, 620),
        (520, 510)
    ], fill=(255, 255, 255, 255))

    # Right R
    draw.polygon([
        (605, 410),
        (760, 440),
        (830, 530),
        (800, 640),
        (710, 680),
        (800, 810),
        (740, 900),
        (650, 750),
        (590, 740),
        (600, 660),
        (710, 630),
        (740, 550),
        (680, 480),
        (610, 460)
    ], fill=(255, 255, 255, 255))

    # Apex Gold Diamond Jewel
    star = [
        (620, 170),
        (632, 195),
        (660, 205),
        (632, 215),
        (620, 240),
        (608, 215),
        (580, 205),
        (608, 195)
    ]
    draw.polygon(star, fill=(251, 191, 36, 255))

    return img

def create_bespoke_showcase():
    img1 = render_original_bespoke_1()
    img2 = render_original_bespoke_2()
    img3 = render_original_bespoke_3()

    img1.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_bespoke_1_katana.png")
    img2.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_bespoke_2_cyber.png")
    img3.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_bespoke_3_apex.png")

    showcase = Image.new("RGBA", (3600, 1320), (5, 6, 8, 255))
    showcase.paste(img1, (0, 60))
    showcase.paste(img2, (1200, 60))
    showcase.paste(img3, (2400, 60))
    showcase.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_bespoke_showcase.png")

    print("Original bespoke showcase generated successfully")

if __name__ == "__main__":
    create_bespoke_showcase()
