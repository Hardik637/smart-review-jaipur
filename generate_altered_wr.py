import math
from PIL import Image, ImageDraw

def render_variation_1a():
    # 1A: Dual-Blade Aerospace WR (Aerodynamic interlocking wings + Open Negative Space R loop)
    size = (1200, 1200)
    img = Image.new("RGBA", size, (8, 9, 12, 255))
    draw = ImageDraw.Draw(img)

    # Main Katana Blade Slash
    blade = [(660, 200), (580, 250), (480, 990), (560, 940)]
    draw.polygon(blade, fill=(255, 255, 255, 255))

    # Upper W Blade Wing (Sharp, extended apex)
    w_wing_1 = [(560, 360), (450, 420), (360, 560), (440, 590), (530, 480)]
    draw.polygon(w_wing_1, fill=(255, 255, 255, 255))

    # Lower W Blade Wing (Offset speed cut)
    w_wing_2 = [(520, 540), (430, 610), (390, 750), (470, 770), (500, 680)]
    draw.polygon(w_wing_2, fill=(255, 255, 255, 255))

    # Modern Luxury Open-Loop 'R' (Disconnected modern aesthetic)
    r_top = [(610, 400), (760, 440), (840, 530), (810, 640), (720, 680), (600, 640), (600, 570), (710, 590), (740, 540), (690, 480), (615, 460)]
    draw.polygon(r_top, fill=(255, 255, 255, 255))

    # Floating Razor Kick Leg of R
    r_leg = [(680, 710), (790, 830), (740, 920), (650, 770)]
    draw.polygon(r_leg, fill=(255, 255, 255, 255))

    return img

def render_variation_1b():
    # 1B: The Triple-Slit Velocity WR (Speed grooves in W + Integrated Chisel R)
    size = (1200, 1200)
    img = Image.new("RGBA", size, (8, 9, 12, 255))
    draw = ImageDraw.Draw(img)

    # Main Blade
    blade = [(670, 220), (590, 270), (490, 970), (570, 920)]
    draw.polygon(blade, fill=(255, 255, 255, 255))

    # Left W with 3 Precision Slices (Speed/Review Soundwave)
    draw.polygon([(560, 380), (450, 440), (370, 550), (430, 570), (530, 480)], fill=(255, 255, 255, 255))
    draw.polygon([(530, 520), (440, 580), (390, 670), (450, 690), (500, 610)], fill=(255, 255, 255, 255))
    draw.polygon([(490, 650), (430, 700), (410, 790), (470, 800), (480, 720)], fill=(255, 255, 255, 255))

    # Right R with Sharp Geometric Return
    r_body = [
        (610, 420),
        (770, 460),
        (830, 550),
        (790, 660),
        (690, 700),
        (790, 830),
        (730, 920),
        (650, 770),
        (590, 750),
        (600, 670),
        (710, 640),
        (740, 560),
        (680, 500),
        (615, 480)
    ]
    draw.polygon(r_body, fill=(255, 255, 255, 255))

    return img

def render_variation_1c():
    # 1C: The Apex Falcon WR (Aerodynamic Falcon Wing W + Razor Bevel R)
    size = (1200, 1200)
    img = Image.new("RGBA", size, (8, 9, 12, 255))
    draw = ImageDraw.Draw(img)

    # Falcon Center Spine Blade
    blade = [(680, 180), (600, 240), (480, 980), (560, 920)]
    draw.polygon(blade, fill=(255, 255, 255, 255))

    # Swept-Back Falcon Wing W (Curved razor sweep)
    w_wing = [
        (560, 390),
        (430, 470),
        (330, 620),
        (400, 650),
        (350, 780),
        (430, 800),
        (480, 670),
        (430, 630),
        (520, 510)
    ]
    draw.polygon(w_wing, fill=(255, 255, 255, 255))

    # Continuous Chiseled R (Sleek aerodynamic loop + extended dagger kick)
    r_shape = [
        (620, 400),
        (780, 440),
        (850, 530),
        (810, 640),
        (710, 680),
        (820, 820),
        (760, 930),
        (670, 760),
        (590, 750),
        (600, 660),
        (720, 620),
        (750, 540),
        (680, 480),
        (625, 460)
    ]
    draw.polygon(r_shape, fill=(255, 255, 255, 255))

    return img

def create_altered_showcase():
    img_1a = render_variation_1a()
    img_1b = render_variation_1b()
    img_1c = render_variation_1c()

    img_1a.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_altered_1a_aerospace.png")
    img_1b.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_altered_1b_velocity.png")
    img_1c.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_altered_1c_falcon.png")

    showcase = Image.new("RGBA", (3600, 1320), (5, 6, 8, 255))
    showcase.paste(img_1a, (0, 60))
    showcase.paste(img_1b, (1200, 60))
    showcase.paste(img_1c, (2400, 60))
    showcase.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_altered_showcase.png")
    print("Altered showcase generated")

if __name__ == "__main__":
    create_altered_showcase()
