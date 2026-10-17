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

async function deleteDocument(collection, docId) {
  const url = `${BASE_URL}/${collection}/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}`;
  const res = await fetch(url, { method: "DELETE" });
  console.log(`Deleted ${collection}/${docId}: status ${res.status}`);
}

async function main() {
  const primarySlug = "shree-heera-sweets";
  const email = "sugarrushnagpur@gmail.com";
  const userId = "usr_" + Buffer.from(email).toString("hex");

  // 1. Update user profile
  await setDocument("users", userId, {
    id: userId,
    email,
    businessSlug: primarySlug,
    businessId: primarySlug,
    businessName: "Shree Heera Sweets",
    role: "user",
    planName: "VIP Pro License",
    isPro: true,
    phone: "+91 99608 72777",
    updatedAt: new Date().toISOString(),
  });
  console.log("✅ User profile linked exclusively to shree-heera-sweets");

  // 2. Update user_businesses mapping
  await setDocument("user_businesses", userId, {
    userId,
    businessSlug: primarySlug,
    businessId: primarySlug,
    name: "Shree Heera Sweets",
  });
  console.log("✅ user_businesses mapping updated");

  // 3. Remove old sugar-rush business doc from Firestore
  await deleteDocument("businesses", "sugar-rush");

  console.log("✅ Cleanup complete! Single exclusive slug is now:", primarySlug);
}

main().catch(console.error);
