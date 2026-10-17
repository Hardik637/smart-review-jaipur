const FIRESTORE_PROJECT_ID = "saas-64015";
const FIRESTORE_API_KEY = "AIzaSyB7nnrGVSUxVTmKw4t6qXrBVxAGbxarVvE";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents`;

async function verify() {
  const res = await fetch(`${BASE_URL}/businesses/shree-heera-sweets?key=${FIRESTORE_API_KEY}`);
  if (!res.ok) {
    console.log("Error status:", res.status);
    return;
  }
  const data = await res.json();
  const f = data.fields;
  console.log("Name:", f.name.stringValue);
  console.log("Slug:", f.slug.stringValue);
  console.log("Location:", f.location.stringValue);
  console.log("Review URL:", f.googleReviewUrl.stringValue);
  console.log("Services count:", f.services.arrayValue.values.length);
  console.log("Topics count:", f.topics.arrayValue.values.length);
}

verify();
