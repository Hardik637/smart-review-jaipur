import QRCode from "qrcode";
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

async function getDocument(collection, docId) {
  const url = `${BASE_URL}/${collection}/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

async function main() {
  const slug = "chandak-nx";
  const newReviewUrl = "https://g.page/r/CUe8qwjq8cfhEBM/review";

  console.log("Fetching existing document for:", slug);
  const existing = await getDocument("businesses", slug);
  if (!existing) {
    throw new Error("Business chandak-nx not found!");
  }

  // Update googleReviewUrl field
  const updateUrl = `${BASE_URL}/businesses/${slug}?updateMask.fieldPaths=googleReviewUrl&updateMask.fieldPaths=updatedAt&key=${FIRESTORE_API_KEY}`;
  const patchPayload = {
    fields: {
      googleReviewUrl: { stringValue: newReviewUrl },
      updatedAt: { stringValue: new Date().toISOString() },
    },
  };

  const patchRes = await fetch(updateUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchPayload),
  });

  if (!patchRes.ok) {
    throw new Error(`Failed to patch business: ${await patchRes.text()}`);
  }
  console.log("✅ Successfully updated Firestore document businesses/chandak-nx with new review link:", newReviewUrl);

  // Regenerate direct QR code
  const artifactDir = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82";
  const publicDir = "e:/anti/google review app/public";

  const qrOptions = {
    errorCorrectionLevel: "H",
    margin: 2,
    scale: 16,
    color: { dark: "#000000", light: "#ffffff" },
  };

  const directArtifact = path.join(artifactDir, "chandak-nx-google-direct-qr.png");
  const directPublic = path.join(publicDir, "chandak-nx-google-direct-qr.png");

  await QRCode.toFile(directArtifact, newReviewUrl, qrOptions);
  await QRCode.toFile(directPublic, newReviewUrl, qrOptions);
  console.log("✅ Direct Google Review QR regenerated with new URL!");

  // Verify API
  const verifyDoc = await getDocument("businesses", slug);
  console.log("Verified googleReviewUrl in Firestore:", verifyDoc.fields?.googleReviewUrl?.stringValue);
}

main().catch(console.error);
