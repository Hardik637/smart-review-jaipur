import crypto from "crypto";

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

async function getDocument(collection, docId) {
  const url = `${BASE_URL}/${collection}/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  const email = "sapkebhavesh@gmail.com".toLowerCase().trim();
  const userId = "usr_" + Buffer.from(email).toString("hex");
  const slug = "ironcreed-gym-2";
  const rawPassword = "IronCreed@2026";
  const hashedPassword = hashPassword(rawPassword);

  console.log("Linking Bhavesh Sapke to ironcreed-gym-2:", { email, userId, slug });

  // 1. Update user document
  const userDoc = {
    id: userId,
    email,
    password: hashedPassword,
    role: "user",
    phone: "88882 40610",
    planName: "VIP Pro License",
    isPro: true,
    businessSlug: slug,
    businessId: slug,
    businessName: "IRONCREED GYM",
    updatedAt: new Date().toISOString(),
    lastLoginProvider: "credentials",
  };
  await setDocument("users", userId, userDoc);
  console.log("✅ User document updated to ironcreed-gym-2 for:", email);

  // 2. Update businesses/ironcreed-gym-2
  const bizDoc = await getDocument("businesses", slug);
  if (bizDoc) {
    await setDocument("businesses", slug, {
      id: slug,
      userId,
      name: "IRONCREED GYM",
      legalName: "IRONCREED GYM (Branch 2 - Nimkhedi Road)",
      slug,
      category: "gym",
      location: "Nimkhedi Road, Pimprala, Jalgaon, Maharashtra",
      phone: "88882 40610",
      email,
      googleReviewUrl: "https://g.page/r/CSHdHO8ePUy4EBM/review",
      brandColor: "#e11d48",
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
      updatedAt: new Date().toISOString(),
    });
    console.log("✅ Business document ironcreed-gym-2 updated with userId:", userId);
  }

  // 3. Update user_businesses mapping
  await setDocument("user_businesses", userId, {
    userId,
    businessSlug: slug,
    businessId: slug,
    name: "IRONCREED GYM",
    branches: ["ironcreed-gym", "ironcreed-gym-2"],
  });
  console.log("✅ user_businesses mapping updated for:", userId);

  console.log("\n========================================================");
  console.log("🎉 BHAVESH SAPKE (sapkebhavesh@gmail.com) LINKED TO IRONCREED GYM BRANCH 2!");
  console.log("Email:", email);
  console.log("Password:", rawPassword);
  console.log("Phone: 88882 40610");
  console.log("Live Funnel URL: https://review.welurik.com/r/ironcreed-gym-2");
  console.log("Direct Google Review: https://g.page/r/CSHdHO8ePUy4EBM/review");
  console.log("========================================================\n");
}

main().catch(console.error);
