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

async function main() {
  const slug = "sugar-rush";
  const exactLocation = "Shree Heera Sweets, Opp. Haldiram's, Medical Square, Nagpur, Maharashtra 440009";

  const updateData = {
    id: slug,
    name: "Sugar Rush",
    legalName: "Sugar Rush (Shree Heera Sweets, Medical Square)",
    slug,
    category: "cafe",
    location: exactLocation,
    phone: "+91 99608 72777",
    email: "sugarrushnagpur@gmail.com",
    googleReviewUrl: "https://g.page/r/CbGsXVSYVeFSEBM/review",
    gmbShareUrl: "https://share.google/gJaGtAJcFBroQHlEu",
    brandColor: "#e11d48",
    description: "Artisan desserts, loaded waffles, thick shakes, gourmet ice creams, sundaes & sweet celebration treats at Shree Heera Sweets, Medical Square, Nagpur.",
    services: [
      "Loaded Waffles & Pancakes",
      "Thick Shakes & Smoothies",
      "Artisan Ice Creams & Sundaes",
      "Fresh Pastries & Brownies",
      "Traditional & Fusion Sweets",
      "Celebration Cakes & Hampers",
      "Cold Coffee & Mocktails"
    ],
    topics: [
      { name: "Delicious Waffles & Shakes", type: "positive" },
      { name: "Mouth-Watering Desserts", type: "positive" },
      { name: "Cozy & Premium Vibe", type: "positive" },
      { name: "Super Fast Service", type: "positive" },
      { name: "Fresh & High Hygiene", type: "positive" },
      { name: "Friendly & Polite Staff", type: "positive" },
      { name: "Value for Money", type: "positive" },
      { name: "Table Wait Time", type: "issue" },
      { name: "Item Availability", type: "issue" },
      { name: "Parking near Medical Square", type: "issue" }
    ],
    keywords: "Sugar Rush Nagpur, Shree Heera Sweets Medical Square, best waffles Nagpur, thick shakes Medical Square, dessert cafe Nagpur, ice cream parlour Medical Square Nagpur, sweets near me, cake shop Nagpur",
    planName: "VIP Pro License",
    isPro: true,
    updatedAt: new Date().toISOString(),
  };

  await setDocument("businesses", slug, updateData);
  console.log("✅ Updated Sugar Rush in Firestore with exact Medical Square GMB details!");
}

main().catch(console.error);
