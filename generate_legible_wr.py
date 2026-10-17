from PIL import Image, ImageDraw

def render_legible_wr_1():
    # 2A: "The Razor-Chisel WR" — Crystal Clear, Bold 'W' + Sharp 'R'
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # Left Stroke of W (Sharp chiseled outer wing)
    w_stroke_1 = [
        (330, 360),
        (390, 380),
        (450, 770),
        (380, 790),
        (290, 520)
    ]
    draw.polygon(w_stroke_1, fill=(255, 255, 255, 255))

    # Middle V of W (Clear upward valley and downward stroke)
    w_stroke_2 = [
        (460, 480),
        (530, 500),
        (520, 740),
        (450, 770)
    ]
    draw.polygon(w_stroke_2, fill=(255, 255, 255, 255))

    # Center Blade Backbone (Right stroke of W + Spine of R)
    blade_spine = [
        (660, 200),
        (580, 250),
        (490, 970),
        (570, 920)
    ]
    draw.polygon(blade_spine, fill=(255, 255, 255, 255))

    # Upper W-to-Spine Bridge
    draw.polygon([(460, 480), (580, 390), (600, 440), (530, 500)], fill=(255, 255, 255, 255))

    # Right 'R' Bowl (Unmistakable curved chiseled loop)
    r_loop = [
        (610, 380),
        (760, 410),
        (830, 490),
        (800, 610),
        (710, 660),
        (590, 640),
        (595, 570),
        (700, 590),
        (730, 530),
        (670, 460),
        (615, 440)
    ]
    draw.polygon(r_loop, fill=(255, 255, 255, 255))

    # Right 'R' Kick Leg (Sharp dagger strike)
    r_leg = [
        (680, 670),
        (790, 800),
        (740, 900),
        (640, 750)
    ]
    draw.polygon(r_leg, fill=(255, 255, 255, 255))

    return img

def render_legible_wr_2():
    # 2B: "The Interlocking Katana WR" — Continuous Flow 3-Point 'W'
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # Full Solid W-Ribbon (Left Peak -> Bottom Valley -> Middle Peak -> Bottom Valley -> Spine)
    w_ribbon = [
        (320, 380),
        (380, 400),
        (420, 700),
        (490, 450),
        (560, 470),
        (530, 760),
        (610, 240),
        (680, 200),
        (560, 930),
        (470, 980),
        (450, 820),
        (370, 840),
        (260, 530)
    ]
    draw.polygon(w_ribbon, fill=(255, 255, 255, 255))

    # 'R' Bowl attached cleanly to the right of the spine
    r_bowl = [
        (620, 370),
        (770, 400),
        (840, 490),
        (810, 610),
        (710, 660),
        (600, 640),
        (605, 570),
        (700, 580),
        (730, 530),
        (680, 460),
        (625, 430)
    ]
    draw.polygon(r_bowl, fill=(255, 255, 255, 255))

    # 'R' Kick
    draw.polygon([(680, 670), (810, 810), (750, 910), (640, 750)], fill=(255, 255, 255, 255))

    return img

def render_legible_wr_3():
    # 2C: "The Precision Geometric WR" — Razor-Sharp Symmetrical 4-Stroke 'W' + Modern 'R'
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # Stroke 1 of W (Outer Down)
    draw.polygon([(300, 390), (370, 420), (430, 790), (360, 810), (250, 540)], fill=(255, 255, 255, 255))

    # Stroke 2 & 3 of W (Inner Center Up & Down Chevron)
    draw.polygon([(420, 740), (480, 470), (540, 490), (510, 760), (440, 780)], fill=(255, 255, 255, 255))

    # Stroke 4 / Main Spine (Up-slash connecting W to R)
    draw.polygon([(660, 210), (580, 260), (480, 970), (560, 920)], fill=(255, 255, 255, 255))
    draw.polygon([(520, 530), (600, 410), (620, 460), (550, 550)], fill=(255, 255, 255, 255))

    # R Complete Glyph
    draw.polygon([
        (610, 400),
        (760, 430),
        (830, 510),
        (800, 620),
        (710, 660),
        (790, 790),
        (730, 890),
        (650, 740),
        (590, 730),
        (600, 650),
        (700, 620),
        (730, 540),
        (680, 480),
        (615, 460)
    ], fill=(255, 255, 255, 255))

    return img

def create_legible_showcase():
    img1 = render_legible_wr_1()
    img2 = render_legible_wr_2()
    img3 = render_legible_wr_3()

    img1.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_legible_1_chisel.png")
    img2.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_legible_2_katana.png")
    img3.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_legible_3_geometric.png")

    showcase = Image.new("RGBA", (3600, 1320), (5, 6, 8, 255))
    showcase.paste(img1, (0, 60))
    showcase.paste(img2, (1200, 60))
    showcase.paste(img3, (2400, 60))
    showcase.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_legible_showcase.png")

    print("Legible WR showcase generated")

if __name__ == "__main__":
    create_legible_showcase()
