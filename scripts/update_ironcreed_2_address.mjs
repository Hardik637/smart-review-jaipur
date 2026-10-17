import fetch from "node-fetch";

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

async function main() {
  const slug = "ironcreed-gym-2";
  const email = "sapkebhavesh@gmail.com";
  const userId = "usr_" + Buffer.from(email).toString("hex");

  console.log("Fetching existing business document:", slug);
  const existing = await getDocument("businesses", slug);
  console.log("Existing document found:", !!existing);

  const updatedBusiness = {
    id: slug,
    userId,
    name: "IRONCREED GYM",
    legalName: "IRONCREED GYM (MIDC Branch)",
    slug,
    category: "gym",
    location: "Behind Kashinath Chowk, MIDC, Jalgaon, Maharashtra 425001",
    phone: "88882 40610",
    email,
    googleReviewUrl: "https://g.page/r/CSHdHO8ePUy4EBM/review",
    brandColor: "#e11d48",
    description: "Heavy strength equipment, HIIT classes, nutrition coaching, personal training & hardcore bodybuilding at IRONCREED GYM, Behind Kashinath Chowk, MIDC, Jalgaon.",
    services: [
      "Heavy Strength & Free Weights Zone",
      "Personal Training & Form Coaching",
      "HIIT Exercise Classes & Functional Training",
      "Nutrition Consulting & Diet Plans",
      "Cardio Conditioning & Fat Loss",
      "Muscle Building & Hypertrophy Programs",
      "Locker Rooms & Shower Facilities",
      "Pre/Post Workout Nutrition Guidance"
    ],
    topics: [
      { name: "Heavy Duty Machines & Free Weights", type: "positive" },
      { name: "HIIT Classes & Cardio Conditioning", type: "positive" },
      { name: "Expert Nutrition & Personal Trainers", type: "positive" },
      { name: "Motivating & Energetic Atmosphere", type: "positive" },
      { name: "Spacious & Clean Workout Floor", type: "positive" },
      { name: "Pocket-Friendly Membership Plans", type: "positive" },
      { name: "Peak Hour Rush / Machine Availability", type: "issue" },
      { name: "Ventilation / AC Cooling During Summer", type: "issue" },
      { name: "Membership & Renewal Inquiries", type: "issue" }
    ],
    keywords: "gym near Kashinath Chowk, gym MIDC Jalgaon, Ironcreed Gym Jalgaon, best gym in MIDC Jalgaon, HIIT classes Jalgaon, personal training Jalgaon, nutrition consulting Jalgaon, Ironcreed gym 2",
    planName: "VIP Pro License",
    isPro: true,
    updatedAt: new Date().toISOString(),
  };

  await setDocument("businesses", slug, updatedBusiness);
  console.log("✅ Successfully updated Firestore document businesses/ironcreed-gym-2 with new MIDC location!");

  // Verify fetch
  const verify = await getDocument("businesses", slug);
  console.log("Verified Firestore Location:", verify.fields?.location?.stringValue);
  console.log("Verified Legal Name:", verify.fields?.legalName?.stringValue);
}

main().catch(console.error);
