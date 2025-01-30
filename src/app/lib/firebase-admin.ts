import * as admin from "firebase-admin";

// Function to clean and format private key
function formatPrivateKey(key: string | undefined) {
  if (!key)
    throw new Error("FIREBASE_PRIVATE_KEY is not set in environment variables");
  // If the key already contains newline characters, assume it's formatted correctly
  if (key.includes("\n")) return key;
  // Otherwise, replace literal '\n' strings with newline characters
  return key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
