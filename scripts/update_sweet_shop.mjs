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
  const businessName = "Shree Heera Sweets";
  const legalName = "Shree Heera Sweets & Namkeen (Medical Square)";
  const location = "Opp. Haldiram's, Medical Square, Nagpur, Maharashtra 440009";
  const googleReviewUrl = "https://g.page/r/CbGsXVSYVeFSEBM/review";
  const gmbShareUrl = "https://share.google/gJaGtAJcFBroQHlEu";
  const phone = "+91 99608 72777";
  const email = "sugarrushnagpur@gmail.com";

  const businessDoc = {
    id: slug,
    name: businessName,
    legalName,
    slug,
    category: "sweets",
    location,
    phone,
    email,
    googleReviewUrl,
    gmbShareUrl,
    brandColor: "#d97706", // Rich royal kesar / saffron mithai gold
    description: "Nagpur's famous sweet destination at Medical Square known for authentic Santra Burfi (Orange Barfi), Pure Desi Ghee Ladoos, Kaju Katli, Soan Papdi, Bengali Sweets, Hot Samosa, Kachori & Namkeen.",
    services: [
      "Famous Nagpur Santra Burfi (Orange Barfi)",
      "Pure Desi Ghee Ladoos (Motichoor & Besan)",
      "Premium Kaju Katli & Dry Fruit Sweets",
      "Signature Soan Papdi & Soan Roll",
      "Fresh Bengali Sweets (Rasmalai & Rasgulla)",
      "Hot Fresh Samosa, Kachori & Dhokla",
      "Farsan, Namkeen & Chivda",
      "Festival Mithai Gift Boxes & Wedding Hampers"
    ],
    topics: [
      { name: "Iconic Santra Burfi (Orange Barfi)", type: "positive" },
      { name: "Pure Desi Ghee Freshness", type: "positive" },
      { name: "Rich Kaju Katli & Dry Fruit Sweets", type: "positive" },
      { name: "Crispy Hot Samosa & Kachori", type: "positive" },
      { name: "Soft & Fresh Rasmalai", type: "positive" },
      { name: "Hygienic Packaging & Fresh Taste", type: "positive" },
      { name: "Polite Staff & Quick Service", type: "positive" },
      { name: "Best Festive Gift Hampers", type: "positive" },
      { name: "Festival Rush / Queue", type: "issue" },
      { name: "Specific Sweet Out of Stock", type: "issue" },
      { name: "Parking near Medical Square", type: "issue" }
    ],
    keywords: "Shree Heera Sweets Nagpur, best Santra Burfi Nagpur, orange barfi Nagpur, sweet shop Medical Square, pure ghee sweets Nagpur, kaju katli Nagpur, best samosa Medical Square Nagpur, mithai shop Nagpur, Heera Sweets",
    planName: "VIP Pro License",
    isPro: true,
    updatedAt: new Date().toISOString(),
  };

  await setDocument("businesses", slug, businessDoc);
  console.log("✅ Business updated to 100% Traditional Sweet Shop (Shree Heera Sweets)!");

  // Also update user document businessName
  const userId = "usr_" + Buffer.from(email).toString("hex");
  const userDoc = {
    id: userId,
    email,
    role: "user",
    planName: "VIP Pro License",
    isPro: true,
    phone,
    businessSlug: slug,
    businessId: slug,
    businessName,
    updatedAt: new Date().toISOString(),
  };
  await setDocument("users", userId, userDoc);
  console.log("✅ User profile updated!");

  // Update user_businesses mapping
  await setDocument("user_businesses", userId, {
    userId,
    businessSlug: slug,
    businessId: slug,
    name: businessName,
  });
  console.log("✅ User-Business mapping updated!");
}

main().catch(console.error);
