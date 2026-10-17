import crypto from "crypto";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const FIRESTORE_PROJECT_ID = "saas-64015";
const FIRESTORE_API_KEY = "AIzaSyB7nnrGVSUxVTmKw4t6qXrBVxAGbxarVvE";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents`;

function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === "string") {
      fields[key] = { stringValue: value };
    } else if (typeof value === "number") {
      fields[key] = Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    } else if (typeof value === "boolean") {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((item) =>
            typeof item === "string" ? { stringValue: item } : { stringValue: JSON.stringify(item) }
          ),
        },
      };
    } else if (typeof value === "object") {
      fields[key] = { stringValue: JSON.stringify(value) };
    }
  }
  return fields;
}

async function setDocument(collection, docId, data) {
  const url = `${BASE_URL}/${collection}/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}`;
  const fields = toFirestoreFields(data);
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to save to ${collection}/${docId}: ${err}`);
  }
  return await res.json();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 32);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  const email = "sugarrushnagpur@gmail.com".toLowerCase().trim();
  const phone = "+91 99608 72777";
  const rawPassword = "SugarRush@2026";
  const hashedPassword = hashPassword(rawPassword);
  const userId = "usr_" + Buffer.from(email).toString("hex");
  const slug = "sugar-rush";
  const businessName = "Sugar Rush";
  const location = "Nagpur, Maharashtra";
  const googleReviewUrl = "https://g.page/r/CbGsXVSYVeFSEBM/review";

  const now = new Date();
  console.log("Provisioning Sugar Rush:", { email, userId, slug });

  // 1. Create User Document
  const userDoc = {
    id: userId,
    email,
    password: hashedPassword,
    role: "user",
    planName: "VIP Pro License",
    isPro: true,
    phone,
    businessSlug: slug,
    businessId: slug,
    businessName,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    lastLoginProvider: "credentials",
    loginCount: 0,
  };
  await setDocument("users", userId, userDoc);
  console.log("✅ User created:", userId);

  // 2. Create Business Document
  const businessDoc = {
    id: slug,
    userId,
    name: businessName,
    slug,
    category: "cafe",
    location,
    phone,
    googleReviewUrl,
    brandColor: "#e11d48", // Vibrant strawberry / dessert rose
    description: "Delicious gourmet desserts, loaded waffles, thick shakes, artisan ice creams & fresh celebration treats in Nagpur.",
    services: [
      "Loaded Waffles & Pancakes",
      "Thick Shakes & Smoothies",
      "Artisan Ice Creams & Sundaes",
      "Fresh Brownies & Pastries",
      "Celebration Cakes & Hampers",
      "Cold Coffee & Mocktails",
      "Desserts & Sweet Bites"
    ],
    topics: [
      { name: "Delicious Waffles & Shakes", type: "positive" },
      { name: "Mouth-Watering Desserts", type: "positive" },
      { name: "Cozy & Vibrant Vibe", type: "positive" },
      { name: "Super Fast Service", type: "positive" },
      { name: "Polite & Friendly Staff", type: "positive" },
      { name: "Fresh & High Hygiene", type: "positive" },
      { name: "Value for Money", type: "positive" },
      { name: "Table Wait Time", type: "issue" },
      { name: "Specific Flavor Availability", type: "issue" },
      { name: "Seating Space", type: "issue" }
    ],
    keywords: "dessert parlour Nagpur, best waffles Nagpur, thick shakes Nagpur, ice cream parlour Nagpur, cake shop Nagpur, Sugar Rush Nagpur, dessert cafe Nagpur",
    planName: "VIP Pro License",
    isPro: true,
    activatedAt: now.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await setDocument("businesses", slug, businessDoc);
  console.log("✅ Business created:", slug);

  // 3. Create User-Business Mapping Index
  await setDocument("user_businesses", userId, {
    userId,
    businessSlug: slug,
    businessId: slug,
    name: businessName,
  });
  console.log("✅ User-Business mapping linked successfully!");

  // 4. Generate High-Res QR Codes
  const funnelUrl = `https://review.welurik.com/r/${slug}`;
  const artifactDir = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82";
  const publicDir = "e:/anti/google review app/public";

  const qrFunnelArtifact = path.join(artifactDir, "sugar-rush-qr.png");
  const qrFunnelPublic = path.join(publicDir, "sugar-rush-qr.png");
  const qrDirectArtifact = path.join(artifactDir, "sugar-rush-google-direct-qr.png");

  // QR Code Options (ultra-sharp, high-contrast, error correction level H)
  const qrOptions = {
    errorCorrectionLevel: "H",
    margin: 2,
    scale: 16,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  };

  await QRCode.toFile(qrFunnelArtifact, funnelUrl, qrOptions);
  await QRCode.toFile(qrFunnelPublic, funnelUrl, qrOptions);
  console.log("✅ Smart Review Funnel QR Code generated:", qrFunnelArtifact);

  await QRCode.toFile(qrDirectArtifact, googleReviewUrl, qrOptions);
  console.log("✅ Direct Google Review QR Code generated:", qrDirectArtifact);

  console.log("\n========================================================");
  console.log("🎉 SUGAR RUSH ONBOARDED SUCCESSFULLY!");
  console.log("Email:", email);
  console.log("Password:", rawPassword);
  console.log("Phone:", phone);
  console.log("Live Funnel URL:", funnelUrl);
  console.log("Direct Google Review:", googleReviewUrl);
  console.log("========================================================\n");
}

main().catch(console.error);
