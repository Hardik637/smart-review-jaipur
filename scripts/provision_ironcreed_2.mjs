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
  const email = "agrawalmayank397@gmail.com".toLowerCase().trim();
  const rawPassword = "IronCreed@2026";
  const hashedPassword = hashPassword(rawPassword);
  const userId = "usr_" + Buffer.from(email).toString("hex");
  const slug = "ironcreed-gym-2";
  const businessName = "IRONCREED GYM (Branch 2)";
  const legalName = "IRONCREED GYM (Branch 2 - Nimkhedi Road)";
  const location = "Nimkhedi Road, Pimprala, Jalgaon, Maharashtra";
  const phone = "88882 40610";
  const googleReviewUrl = "https://g.page/r/CSHdHO8ePUy4EBM/review";

  const now = new Date();
  console.log("Provisioning IRONCREED GYM Branch 2:", { email, userId, slug });

  // 1. Update/Set User Document for Mayank Agrawal
  const userDoc = {
    id: userId,
    email,
    password: hashedPassword,
    role: "user",
    phone,
    planName: "VIP Pro License",
    isPro: true,
    businessSlug: slug,
    businessId: slug,
    businessName: "IRONCREED GYM",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    lastLoginProvider: "credentials",
    loginCount: 1,
  };
  await setDocument("users", userId, userDoc);
  console.log("✅ User created/updated:", userId);

  // 2. Create Business Document for Branch 2
  const businessDoc = {
    id: slug,
    userId,
    name: "IRONCREED GYM",
    legalName,
    slug,
    category: "gym",
    location,
    phone,
    email,
    googleReviewUrl,
    brandColor: "#e11d48", // Vibrant gym red
    description: "Premier strength training, heavy free weights, cardio deck, functional fitness & personal coaching at IRONCREED GYM Branch 2 in Jalgaon.",
    services: [
      "Heavy Strength & Free Weights Zone",
      "Personal Training & Form Coaching",
      "Cardio Conditioning & Fat Loss",
      "Muscle Building & Bulk / Cut Programs",
      "Customized Diet & Workout Plans",
      "CrossFit & Functional Training",
      "Locker Rooms & Shower Facilities",
      "Pre/Post Workout Nutrition Guidance"
    ],
    topics: [
      { name: "State-of-the-Art Heavy Machines", type: "positive" },
      { name: "Motivating Hardcore Gym Environment", type: "positive" },
      { name: "Expert & Supportive Personal Trainers", type: "positive" },
      { name: "Spacious & Clean Workout Floor", type: "positive" },
      { name: "Disciplined & Energetic Community", type: "positive" },
      { name: "Pocket-Friendly Membership Plans", type: "positive" },
      { name: "Great Music & Workout Atmosphere", type: "positive" },
      { name: "Peak Hour Rush / Machine Availability", type: "issue" },
      { name: "Ventilation / AC Cooling During Summer", type: "issue" },
      { name: "Membership & Renewal Inquiries", type: "issue" }
    ],
    keywords: "Ironcreed gym Jalgaon, best gym in Jalgaon, gym near Pimprala, fitness center Jalgaon, weight lifting Jalgaon, personal trainer Jalgaon, Ironcreed gym 2",
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
    name: "IRONCREED GYM",
  });
  console.log("✅ User-Business mapping linked successfully!");

  // 4. Generate High-Res QR Codes
  const funnelUrl = `https://review.welurik.com/r/${slug}`;
  const artifactDir = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82";
  const publicDir = "e:/anti/google review app/public";

  const qrFunnelArtifact = path.join(artifactDir, "ironcreed-gym-2-qr.png");
  const qrFunnelPublic = path.join(publicDir, "ironcreed-gym-2-qr.png");
  const qrDirectArtifact = path.join(artifactDir, "ironcreed-gym-2-google-direct-qr.png");
  const qrDirectPublic = path.join(publicDir, "ironcreed-gym-2-google-direct-qr.png");

  const qrOptions = {
    errorCorrectionLevel: "H",
    margin: 2,
    scale: 16,
    color: { dark: "#000000", light: "#ffffff" },
  };

  await QRCode.toFile(qrFunnelArtifact, funnelUrl, qrOptions);
  await QRCode.toFile(qrFunnelPublic, funnelUrl, qrOptions);
  console.log("✅ Smart Review Funnel QR Code generated:", qrFunnelArtifact);

  await QRCode.toFile(qrDirectArtifact, googleReviewUrl, qrOptions);
  await QRCode.toFile(qrDirectPublic, googleReviewUrl, qrOptions);
  console.log("✅ Direct Google Review QR Code generated:", qrDirectArtifact);

  console.log("\n========================================================");
  console.log("🎉 IRONCREED GYM (BRANCH 2) ONBOARDED SUCCESSFULLY!");
  console.log("Email:", email);
  console.log("Password:", rawPassword);
  console.log("Phone:", phone);
  console.log("Live Funnel URL:", funnelUrl);
  console.log("Direct Google Review:", googleReviewUrl);
  console.log("========================================================\n");
}

main().catch(console.error);
