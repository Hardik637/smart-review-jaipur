from PIL import Image

def export_option_1_assets():
    # Load Option 1 image
    opt1_path = r"C:\Users\Nitin Sharma\.gemini\antigravity\brain\53a06f14-de5f-4055-83e6-503359e97f82\exact_font_v1_medium_stretch.png"
    img = Image.open(opt1_path).convert("RGBA")
    datas = img.getdata()

    white_pixels = []
    black_pixels = []

    for item in datas:
        brightness = (item[0] + item[1] + item[2]) // 3
        if brightness > 90:
            white_pixels.append((255, 255, 255, 255))
            black_pixels.append((10, 11, 14, 255))
        else:
            white_pixels.append((0, 0, 0, 0))
            black_pixels.append((0, 0, 0, 0))

    # White on Transparent (for dark backgrounds)
    img_white = Image.new("RGBA", img.size)
    img_white.putdata(white_pixels)
    img_white.save(r"e:\anti\google review app\public\wr-logo-white.png")

    # Black on Transparent (for light backgrounds)
    img_black = Image.new("RGBA", img.size)
    img_black.putdata(black_pixels)
    img_black.save(r"e:\anti\google review app\public\wr-logo-black.png")

    # App Icon Squircle
    icon_tile = Image.new("RGBA", (512, 512), (10, 11, 14, 255))
    scaled_w = img_white.resize((420, 420), Image.Resampling.LANCZOS)
    icon_tile.paste(scaled_w, (46, 46), scaled_w)
    icon_tile.save(r"e:\anti\google review app\public\icon.png")

    print("Option 1 transparent PNG assets exported")

if __name__ == "__main__":
    export_option_1_assets()
