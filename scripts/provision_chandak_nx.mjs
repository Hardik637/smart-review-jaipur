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
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  const email = "shivam2808@gmail.com".toLowerCase().trim();
  const rawPassword = "Chandak@2026";
  const hashedPassword = hashPassword(rawPassword);
  const userId = "usr_" + Buffer.from(email).toString("hex");
  const slug = "chandak-nx";
  const businessName = "Chandak NX";
  const legalName = "Chandak NX (Men's Ethnic Wear, Designer Suits & Fabrics)";
  const location = "Jagnath Road, Nanga Putla Chowk, Gandhibagh, Nagpur, Maharashtra 440002";
  const googleReviewUrl = "https://search.google.com/local/writereview?placeid=ChIJqSndZcvA1DsRR7yrCOrxx-E";

  const now = new Date();
  console.log("Provisioning Chandak NX for:", { email, userId, slug });

  // 1. Create User Document
  const userDoc = {
    id: userId,
    email,
    password: hashedPassword,
    role: "user",
    planName: "VIP Pro License",
    isPro: true,
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
    legalName,
    slug,
    category: "retail",
    location,
    email,
    googleReviewUrl,
    brandColor: "#b45309", // Warm golden bronze
    description: "Nagpur's premier destination for men's ethnic & wedding wear, designer sherwanis, 3-piece suits, indo-western attire, kurta sets, Modi jackets & luxury branded fabrics in Gandhibagh.",
    services: [
      "Designer Groom Sherwanis & Indo-Western",
      "3-Piece Suits, Blazers & Tuxedos",
      "Kurta Pajama & Modi Jacket Sets",
      "Premium Raymond & Imported Suiting Fabrics",
      "Custom Bespoke Tailoring & Fitting",
      "Festive & Wedding Party Wear",
      "Matching Dupattas, Safas & Groom Accessories",
      "Alteration & Personalized Styling Consultation"
    ],
    topics: [
      { name: "Exquisite Groom & Wedding Collection", type: "positive" },
      { name: "Perfect Custom Fitting & Tailoring", type: "positive" },
      { name: "Premium Quality Fabrics & Stitching", type: "positive" },
      { name: "Helpful, Patient & Polite Staff", type: "positive" },
      { name: "Vast Variety of Colors & Modern Cuts", type: "positive" },
      { name: "Fair, Transparent & Value Pricing", type: "positive" },
      { name: "Wedding Season Rush & Waiting Time", type: "issue" },
      { name: "Custom Tailoring Delivery Schedule", type: "issue" },
      { name: "Specific Fabric or Size Availability", type: "issue" }
    ],
    keywords: "Chandak NX Nagpur, Chandak NX Gandhibagh, mens ethnic wear Nagpur, groom sherwani Nagpur, designer suits Nagpur, Raymond fabric Nagpur, kurta pajama Gandhibagh, wedding wear Nagpur",
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

  const qrFunnelArtifact = path.join(artifactDir, "chandak-nx-qr.png");
  const qrFunnelPublic = path.join(publicDir, "chandak-nx-qr.png");
  const qrDirectArtifact = path.join(artifactDir, "chandak-nx-google-direct-qr.png");
  const qrDirectPublic = path.join(publicDir, "chandak-nx-google-direct-qr.png");

  const qrOptions = {
    errorCorrectionLevel: "H",
    margin: 2,
    scale: 16,
    color: { dark: "#000000", light: "#ffffff" },
  };

  await QRCode.toFile(qrFunnelArtifact, funnelUrl, qrOptions);
  await QRCode.toFile(qrFunnelPublic, funnelUrl, qrOptions);
  console.log("✅ Funnel QR Code created:", qrFunnelPublic);

  await QRCode.toFile(qrDirectArtifact, googleReviewUrl, qrOptions);
  await QRCode.toFile(qrDirectPublic, googleReviewUrl, qrOptions);
  console.log("✅ Direct Google Review QR Code created:", qrDirectPublic);

  console.log("\n========================================================");
  console.log("🎉 CHANDAK NX ONBOARDED SUCCESSFULLY!");
  console.log("Email:", email);
  console.log("Password:", rawPassword);
  console.log("Live Funnel URL:", funnelUrl);
  console.log("Direct Google Review:", googleReviewUrl);
  console.log("========================================================\n");
}

main().catch(console.error);
