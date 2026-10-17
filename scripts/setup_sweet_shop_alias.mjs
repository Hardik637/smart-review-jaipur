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

async function main() {
  const businessName = "Shree Heera Sweets";
  const legalName = "Shree Heera Sweets & Namkeen (Medical Square)";
  const location = "Opp. Haldiram's, Medical Square, Nagpur, Maharashtra 440009";
  const googleReviewUrl = "https://g.page/r/CbGsXVSYVeFSEBM/review";
  const gmbShareUrl = "https://share.google/gJaGtAJcFBroQHlEu";
  const phone = "+91 99608 72777";
  const email = "sugarrushnagpur@gmail.com";
  const userId = "usr_" + Buffer.from(email).toString("hex");

  const commonDoc = {
    userId,
    name: businessName,
    legalName,
    category: "sweets",
    location,
    phone,
    email,
    googleReviewUrl,
    gmbShareUrl,
    brandColor: "#d97706",
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

  // 1. Update sugar-rush
  await setDocument("businesses", "sugar-rush", { ...commonDoc, id: "sugar-rush", slug: "sugar-rush" });
  // 2. Also register shree-heera-sweets slug alias
  await setDocument("businesses", "shree-heera-sweets", { ...commonDoc, id: "shree-heera-sweets", slug: "shree-heera-sweets" });
  console.log("✅ Both slugs (sugar-rush & shree-heera-sweets) active in Firestore!");

  // 3. Generate QR codes for both
  const artifactDir = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82";
  const publicDir = "e:/anti/google review app/public";

  const qrOptions = {
    errorCorrectionLevel: "H",
    margin: 2,
    scale: 16,
    color: { dark: "#000000", light: "#ffffff" },
  };

  await QRCode.toFile(path.join(artifactDir, "shree-heera-sweets-qr.png"), "https://review.welurik.com/r/shree-heera-sweets", qrOptions);
  await QRCode.toFile(path.join(publicDir, "shree-heera-sweets-qr.png"), "https://review.welurik.com/r/shree-heera-sweets", qrOptions);

  await QRCode.toFile(path.join(artifactDir, "sugar-rush-qr.png"), "https://review.welurik.com/r/sugar-rush", qrOptions);
  await QRCode.toFile(path.join(publicDir, "sugar-rush-qr.png"), "https://review.welurik.com/r/sugar-rush", qrOptions);

  console.log("✅ QR codes generated for both URLs!");
}

main().catch(console.error);
