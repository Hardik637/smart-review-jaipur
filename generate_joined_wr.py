from PIL import Image, ImageDraw

def render_joined_wr_a():
    # Variation A: "Extended Dagger Kick"
    # W and R joined into a single seamless continuous body + elongated sharp R kick tail
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # 1. Main Central Spine Blade
    blade = [
        (660, 190),
        (580, 240),
        (480, 980),
        (560, 930)
    ]
    draw.polygon(blade, fill=(255, 255, 255, 255))

    # 2. Left 'W' Wing (Seamlessly FUSED/JOINED to Spine)
    w_joined = [
        (580, 320),
        (440, 410),
        (350, 560),
        (420, 600),
        (370, 750),
        (450, 780),
        (530, 640),
        (510, 500)
    ]
    draw.polygon(w_joined, fill=(255, 255, 255, 255))

    # Bridge connecting W directly to Spine
    draw.polygon([(440, 410), (580, 240), (580, 400), (510, 500)], fill=(255, 255, 255, 255))

    # 3. 'R' Upper Bowl (Seamlessly fused to Spine)
    r_bowl = [
        (590, 390),
        (760, 420),
        (830, 510),
        (800, 630),
        (700, 670),
        (580, 650),
        (585, 570),
        (700, 590),
        (730, 530),
        (670, 460),
        (595, 440)
    ]
    draw.polygon(r_bowl, fill=(255, 255, 255, 255))

    # 4. Stretched Elongated 'R' Dagger Kick (Extended down to y=1050, x=860)
    r_stretched_leg = [
        (670, 650),
        (840, 810),
        (880, 960), # Extended Stretched Tail!
        (810, 1060), # Razor Point!
        (780, 980),
        (710, 840),
        (620, 730)
    ]
    draw.polygon(r_stretched_leg, fill=(255, 255, 255, 255))

    return img

def render_joined_wr_b():
    # Variation B: "Hyper-Blade Undersweep"
    # W and R joined, and the R tail sweeps forward underneath the whole mark
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # Spine Blade
    draw.polygon([(660, 190), (580, 240), (480, 980), (560, 930)], fill=(255, 255, 255, 255))

    # Joined W
    w_joined = [
        (580, 320),
        (440, 410),
        (350, 560),
        (420, 600),
        (370, 750),
        (450, 780),
        (530, 640),
        (510, 500)
    ]
    draw.polygon(w_joined, fill=(255, 255, 255, 255))
    draw.polygon([(440, 410), (580, 240), (580, 400), (510, 500)], fill=(255, 255, 255, 255))

    # R Bowl
    draw.polygon([
        (590, 390),
        (760, 420),
        (830, 510),
        (800, 630),
        (700, 670),
        (580, 650),
        (585, 570),
        (700, 590),
        (730, 530),
        (670, 460),
        (595, 440)
    ], fill=(255, 255, 255, 255))

    # Stretched Saber Kick (Sweeping dynamic tail)
    r_sweep_leg = [
        (670, 650),
        (830, 790),
        (920, 890),
        (960, 990), # Super stretched apex
        (890, 980),
        (780, 870),
        (690, 780),
        (610, 730)
    ]
    draw.polygon(r_sweep_leg, fill=(255, 255, 255, 255))

    return img

def render_joined_wr_c():
    # Variation C: "Chiseled Katana Extension" (Geometric 45° angle extension)
    size = (1200, 1200)
    img = Image.new("RGBA", size, (10, 11, 14, 255))
    draw = ImageDraw.Draw(img)

    # Spine Blade
    draw.polygon([(660, 190), (580, 240), (480, 980), (560, 930)], fill=(255, 255, 255, 255))

    # Joined W
    w_joined = [
        (580, 320),
        (440, 410),
        (350, 560),
        (420, 600),
        (370, 750),
        (450, 780),
        (530, 640),
        (510, 500)
    ]
    draw.polygon(w_joined, fill=(255, 255, 255, 255))
    draw.polygon([(440, 410), (580, 240), (580, 400), (510, 500)], fill=(255, 255, 255, 255))

    # R Bowl
    draw.polygon([
        (590, 390),
        (760, 420),
        (830, 510),
        (800, 630),
        (700, 670),
        (580, 650),
        (585, 570),
        (700, 590),
        (730, 530),
        (670, 460),
        (595, 440)
    ], fill=(255, 255, 255, 255))

    # Extended Sharp Spear Kick
    r_spear_leg = [
        (670, 660),
        (810, 790),
        (870, 920),
        (830, 1080), # Deep Spear Extension
        (760, 960),
        (700, 830),
        (620, 740)
    ]
    draw.polygon(r_spear_leg, fill=(255, 255, 255, 255))

    return img

def create_joined_showcase():
    img_a = render_joined_wr_a()
    img_b = render_joined_wr_b()
    img_c = render_joined_wr_c()

    img_a.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_joined_a_dagger.png")
    img_b.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_joined_b_sweep.png")
    img_c.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_joined_c_spear.png")

    showcase = Image.new("RGBA", (3600, 1320), (5, 6, 8, 255))
    showcase.paste(img_a, (0, 60))
    showcase.paste(img_b, (1200, 60))
    showcase.paste(img_c, (2400, 60))
    showcase.save(r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\wr_joined_showcase.png")

    print("Joined WR showcase generated successfully")

if __name__ == "__main__":
    create_joined_showcase()
