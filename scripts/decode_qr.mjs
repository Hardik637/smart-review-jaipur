import { createCanvas, loadImage } from "canvas";
import jsQR from "jsqr";

async function testCrop() {
  const imagePath = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82/.user_uploaded/media_1792145150913_0b94e61e.jpg";
  const img = await loadImage(imagePath);
  console.log("Original dimensions:", img.width, img.height);

  // The QR is centered roughly between y: 15% and 65%, x: 5% and 95%
  // Let's test various crops and binarization thresholds
  const scales = [1, 0.75, 0.5];
  for (const scale of scales) {
    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const idata = ctx.getImageData(0, 0, w, h);
    const res = jsQR(idata.data, w, h, { inversionAttempts: "attemptBoth" });
    if (res) {
      console.log(`SUCCESS at scale ${scale}:`, res.data);
      return;
    }
  }

  // Crop the central QR area
  const cropBox = {
    x: Math.floor(img.width * 0.08),
    y: Math.floor(img.height * 0.14),
    w: Math.floor(img.width * 0.84),
    h: Math.floor(img.height * 0.50),
  };

  const canvasCrop = createCanvas(cropBox.w, cropBox.h);
  const ctxCrop = canvasCrop.getContext("2d");
  ctxCrop.drawImage(img, cropBox.x, cropBox.y, cropBox.w, cropBox.h, 0, 0, cropBox.w, cropBox.h);

  const cropData = ctxCrop.getImageData(0, 0, cropBox.w, cropBox.h);
  const resCrop = jsQR(cropData.data, cropBox.w, cropBox.h, { inversionAttempts: "attemptBoth" });
  if (resCrop) {
    console.log("SUCCESS on cropped QR:", resCrop.data);
    return;
  }

  // Grayscale & threshold
  for (let threshold = 80; threshold <= 180; threshold += 20) {
    const binCanvas = createCanvas(cropBox.w, cropBox.h);
    const bctx = binCanvas.getContext("2d");
    bctx.drawImage(img, cropBox.x, cropBox.y, cropBox.w, cropBox.h, 0, 0, cropBox.w, cropBox.h);
    const id = bctx.getImageData(0, 0, cropBox.w, cropBox.h);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const val = gray > threshold ? 255 : 0;
      d[i] = val;
      d[i + 1] = val;
      d[i + 2] = val;
    }
    const bres = jsQR(id.data, cropBox.w, cropBox.h, { inversionAttempts: "attemptBoth" });
    if (bres) {
      console.log(`SUCCESS with threshold ${threshold}:`, bres.data);
      return;
    }
  }

  console.log("Still failed to decode via basic jsQR.");
}

testCrop().catch(console.error);
