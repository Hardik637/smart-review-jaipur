import QRCode from "qrcode";
import path from "path";
import fs from "fs";

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
  const slug = "welurik-media";
  const email = "welurik.media@gmail.com";
  const userId = "usr_" + Buffer.from(email).toString("hex");
  const googleReviewUrl = "https://g.page/r/CQwNStINFiQ2EBM/review";

  console.log("Fetching existing business document for:", slug);
  const existingDoc = await getDocument("businesses", slug);
  console.log("Existing document found:", !!existingDoc);

  const updatedBusiness = {
    id: slug,
    userId,
    name: "welurik.media",
    legalName: "Welurik Media (Digital Marketing & Software Agency)",
    slug,
    category: "services",
    location: "Nagpur, Maharashtra",
    email,
    googleReviewUrl,
    brandColor: "#0ea5e9", // Electric cyan / modern tech blue
    description: "Full-service digital media & creative tech agency in Nagpur specializing in performance marketing, web development, brand strategy, content production & Google review automation.",
    services: [
      "Social Media Marketing & Management",
      "Custom Website Design & Development",
      "Google Business Profile & Review Growth",
      "Performance Marketing & Meta/Google Ads",
      "Search Engine Optimization (SEO)",
      "Brand Identity & Visual Design",
      "Video Production & Creative Content",
      "Custom Software & SaaS Solutions"
    ],
    topics: [
      { name: "Creative & High-Impact Campaigns", type: "positive" },
      { name: "Fast & Professional Communication", type: "positive" },
      { name: "Stunning Web Design & UI/UX", type: "positive" },
      { name: "Measurable ROI & Lead Growth", type: "positive" },
      { name: "Dedicated & Responsive Support", type: "positive" },
      { name: "Innovative Digital Strategies", type: "positive" },
      { name: "Campaign Timeline Queries", type: "issue" },
      { name: "Custom Scope / Revisions Discussion", type: "issue" },
      { name: "Budget & Ad Spend Optimization", type: "issue" }
    ],
    keywords: "welurik media, digital marketing nagpur, web development nagpur, social media agency nagpur, google review saas, brand strategy nagpur, performance marketing agency",
    planName: "Lifetime License (Admin Granted)",
    isPro: true,
    updatedAt: new Date().toISOString(),
  };

  await setDocument("businesses", slug, updatedBusiness);
  console.log("✅ Successfully updated businesses/welurik-media with review link:", googleReviewUrl);

  // Verify fetch
  const verify = await getDocument("businesses", slug);
  console.log("Verified Review URL:", verify.fields?.googleReviewUrl?.stringValue);
  console.log("Verified Category:", verify.fields?.category?.stringValue);

  // Generate High-Res QR codes
  const funnelUrl = `https://review.welurik.com/r/${slug}`;
  const artifactDir = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82";
  const publicDir = "e:/anti/google review app/public";

  const qrFunnelArtifact = path.join(artifactDir, "welurik-media-qr.png");
  const qrFunnelPublic = path.join(publicDir, "welurik-media-qr.png");
  const qrDirectArtifact = path.join(artifactDir, "welurik-media-google-direct-qr.png");
  const qrDirectPublic = path.join(publicDir, "welurik-media-google-direct-qr.png");

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
}

main().catch(console.error);
