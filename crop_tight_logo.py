from PIL import Image

def crop_and_export_tight_logo():
    # Load white and black transparent images
    img_white = Image.open(r"e:\anti\google review app\public\wr-logo-white.png")
    img_black = Image.open(r"e:\anti\google review app\public\wr-logo-black.png")

    # Get non-zero alpha bounding box (tight crop)
    bbox_white = img_white.getbbox()
    bbox_black = img_black.getbbox()
    print("Bounding box:", bbox_white, bbox_black)

    # Crop tightly to the actual glyph pixels (no huge empty margins)
    cropped_white = img_white.crop(bbox_white)
    cropped_black = img_black.crop(bbox_black)

    # Save tightly cropped assets
    cropped_white.save(r"e:\anti\google review app\public\wr-logo-white.png")
    cropped_black.save(r"e:\anti\google review app\public\wr-logo-black.png")
    
    print(f"Tight crop complete! New dimensions: {cropped_black.size}")

if __name__ == "__main__":
    crop_and_export_tight_logo()
