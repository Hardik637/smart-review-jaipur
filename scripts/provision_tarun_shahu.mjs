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
  const primaryEmail = "tarunshahu2000@gmail.com".toLowerCase().trim();
  const raastaEmail = "tarunshahu2000+raasta@gmail.com".toLowerCase().trim();
  const rawPassword = "Tarun@2026";
  const hashedPassword = hashPassword(rawPassword);

  const primaryUserId = "usr_" + Buffer.from(primaryEmail).toString("hex");
  const raastaUserId = "usr_" + Buffer.from(raastaEmail).toString("hex");

  const now = new Date();
  console.log("Provisioning Accounts for Tarun Shahu:", { primaryEmail, primaryUserId, raastaUserId });

  // 1. Create Primary User Document (tarunshahu2000@gmail.com)
  const primaryUserDoc = {
    id: primaryUserId,
    email: primaryEmail,
    password: hashedPassword,
    role: "user",
    planName: "VIP Pro License",
    isPro: true,
    businessSlug: "tamtara",
    businessId: "tamtara",
    businessName: "Tamtara",
    branches: ["tamtara", "raasta"],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    lastLoginProvider: "credentials",
    loginCount: 0,
  };
  await setDocument("users", primaryUserId, primaryUserDoc);
  console.log("✅ Primary User created:", primaryUserId);

  // 2. Create Dedicated Raasta User Document (tarunshahu2000+raasta@gmail.com)
  const raastaUserDoc = {
    id: raastaUserId,
    email: raastaEmail,
    password: hashedPassword,
    role: "user",
    planName: "VIP Pro License",
    isPro: true,
    businessSlug: "raasta",
    businessId: "raasta",
    businessName: "Raasta",
    branches: ["raasta", "tamtara"],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    lastLoginProvider: "credentials",
    loginCount: 0,
  };
  await setDocument("users", raastaUserId, raastaUserDoc);
  console.log("✅ Dedicated Raasta User created:", raastaUserId);

  // 3. Create Business Document: Tamtara
  const tamtaraDoc = {
    id: "tamtara",
    userId: primaryUserId,
    name: "Tamtara",
    legalName: "Tamtara Luxury Fine Dine & Cafe",
    slug: "tamtara",
    category: "restaurant",
    location: "Ring Road, Dabha, Nagpur, Maharashtra",
    email: primaryEmail,
    googleReviewUrl: "https://g.page/r/CVTX8Lo-Rci9EAE/review",
    brandColor: "#ea580c", // Luxury terracotta amber
    description: "Luxury fine dining, aesthetic architecture, artisan coffee, signature mocktails & gourmet multi-cuisine at Tamtara, Ring Road, Nagpur.",
    services: [
      "Artisan Cafe & Specialty Coffee",
      "Global Multi-Cuisine Fine Dining",
      "Signature Mocktails & Beverages",
      "Aesthetic Indoor & Outdoor Seating",
      "Weekend Brunch & Chef Specials",
      "Gourmet Desserts & Pastries",
      "Private Dining & Celebrations",
      "Live Acoustic & Ambient Evenings"
    ],
    topics: [
      { name: "Exquisite Food & Authentic Flavors", type: "positive" },
      { name: "Stunning Aesthetic Architecture & Vibe", type: "positive" },
      { name: "Warm, Polite & Attentive Staff", type: "positive" },
      { name: "Fast Service & Beautiful Presentation", type: "positive" },
      { name: "Refreshing Signature Mocktails", type: "positive" },
      { name: "Cozy & Premium Seating Ambiance", type: "positive" },
      { name: "Weekend Peak Rush / Table Wait", type: "issue" },
      { name: "Specific Dish Availability", type: "issue" },
      { name: "Valet / Parking During Events", type: "issue" }
    ],
    keywords: "Tamtara Nagpur, best cafe in Nagpur, fine dining Nagpur, luxury restaurant Nagpur, aesthetic cafe Nagpur, Dabha ring road restaurant, Tamtara restaurant Nagpur",
    planName: "VIP Pro License",
    isPro: true,
    activatedAt: now.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await setDocument("businesses", "tamtara", tamtaraDoc);
  console.log("✅ Business created: tamtara");

  // 4. Create Business Document: Raasta
  const raastaDoc = {
    id: "raasta",
    userId: primaryUserId,
    name: "Raasta",
    legalName: "Raasta Rooftop Restaurant, Cafe & Lounge",
    slug: "raasta",
    category: "restaurant",
    location: "Ved Solitaire, Shivaji Nagar, Dharampeth Ext, Nagpur, Maharashtra",
    email: primaryEmail,
    googleReviewUrl: "https://g.page/r/CetPnX2z7aOxEAE/review",
    brandColor: "#e11d48", // Vibrant electric nightlife crimson
    description: "Multi-level open-air rooftop dining, vibrant lounge nightlife, specialty coffees, continental & modern Indian cuisine with panoramic city views at Raasta, Nagpur.",
    services: [
      "Open-Air Rooftop Terrace Dining",
      "Specialty Coffee & Cafe Bites",
      "Modern Indian & Continental Dishes",
      "Signature Mocktails & Lounge Bar",
      "Live Music & DJ Night Events",
      "Panoramic Skyline Sunset Views",
      "Private Rooftop Party Bookings",
      "Late Night Dining Experience"
    ],
    topics: [
      { name: "Breathtaking Rooftop Skyline View", type: "positive" },
      { name: "Energetic Vibe & Great Music", type: "positive" },
      { name: "Delicious Food & Gourmet Bites", type: "positive" },
      { name: "Courteous & Fast Service Staff", type: "positive" },
      { name: "Amazing Sunset & Evening Ambience", type: "positive" },
      { name: "Refreshing Drinks & Mocktails", type: "positive" },
      { name: "Weekend Party Rush / Seating Wait", type: "issue" },
      { name: "Music Volume Preference", type: "issue" },
      { name: "Table Reservation Inquiries", type: "issue" }
    ],
    keywords: "Raasta Nagpur, rooftop cafe Nagpur, Raasta Dharampeth, lounge in Nagpur, best rooftop restaurant Nagpur, Shivaji Nagar cafe, nightlife Nagpur, Raasta cafe",
    planName: "VIP Pro License",
    isPro: true,
    activatedAt: now.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await setDocument("businesses", "raasta", raastaDoc);
  console.log("✅ Business created: raasta");

  // 5. User-Business Mappings
  await setDocument("user_businesses", primaryUserId, {
    userId: primaryUserId,
    businessSlug: "tamtara",
    businessId: "tamtara",
    name: "Tamtara",
    branches: ["tamtara", "raasta"],
  });
  await setDocument("user_businesses", raastaUserId, {
    userId: raastaUserId,
    businessSlug: "raasta",
    businessId: "raasta",
    name: "Raasta",
    branches: ["raasta", "tamtara"],
  });
  console.log("✅ User-Business mappings linked!");

  // 6. Generate QR Codes
  const artifactDir = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82";
  const publicDir = "e:/anti/google review app/public";

  const qrOptions = {
    errorCorrectionLevel: "H",
    margin: 2,
    scale: 16,
    color: { dark: "#000000", light: "#ffffff" },
  };

  // Tamtara QRs
  const tamtaraFunnel = "https://review.welurik.com/r/tamtara";
  await QRCode.toFile(path.join(artifactDir, "tamtara-qr.png"), tamtaraFunnel, qrOptions);
  await QRCode.toFile(path.join(publicDir, "tamtara-qr.png"), tamtaraFunnel, qrOptions);
  await QRCode.toFile(path.join(artifactDir, "tamtara-google-direct-qr.png"), tamtaraDoc.googleReviewUrl, qrOptions);
  await QRCode.toFile(path.join(publicDir, "tamtara-google-direct-qr.png"), tamtaraDoc.googleReviewUrl, qrOptions);
  console.log("✅ Tamtara QR codes generated!");

  // Raasta QRs
  const raastaFunnel = "https://review.welurik.com/r/raasta";
  await QRCode.toFile(path.join(artifactDir, "raasta-qr.png"), raastaFunnel, qrOptions);
  await QRCode.toFile(path.join(publicDir, "raasta-qr.png"), raastaFunnel, qrOptions);
  await QRCode.toFile(path.join(artifactDir, "raasta-google-direct-qr.png"), raastaDoc.googleReviewUrl, qrOptions);
  await QRCode.toFile(path.join(publicDir, "raasta-google-direct-qr.png"), raastaDoc.googleReviewUrl, qrOptions);
  console.log("✅ Raasta QR codes generated!");

  console.log("\n========================================================");
  console.log("🎉 TARUN SHAHU'S 2 ACCOUNTS PROVISIONED SUCCESSFULLY!");
  console.log("Email:", primaryEmail);
  console.log("Password:", rawPassword);
  console.log("1. Tamtara Funnel: https://review.welurik.com/r/tamtara");
  console.log("   Review Link: https://g.page/r/CVTX8Lo-Rci9EAE/review");
  console.log("2. Raasta Funnel: https://review.welurik.com/r/raasta");
  console.log("   Review Link: https://g.page/r/CetPnX2z7aOxEAE/review");
  console.log("========================================================\n");
}

main().catch(console.error);
