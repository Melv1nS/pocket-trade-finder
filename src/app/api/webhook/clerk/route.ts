import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db, auth } from "../../../lib/firebase-admin";
import { UserDocument } from "../../../types/trades";

export async function POST(req: Request) {
  // Verify webhook signature
  const WEBHOOK_SECRET = process.env.SIGNING_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("Missing WEBHOOK_SECRET environment variable");
    return new Response("Missing webhook secret", {
      status: 500,
    });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Log headers for debugging
  console.log("Webhook Headers:", {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature?.substring(0, 10) + "...", // Log partial signature for security
  });

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing required Svix headers");
    return new Response("Missing required headers", {
      status: 400,
    });
  }

  let payload;
  try {
    // Get the body as text first
    const rawBody = await req.text();
    console.log("Raw webhook payload:", rawBody);

    // Then parse it as JSON
    payload = JSON.parse(rawBody);

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);

    // Verify the webhook
    const evt = wh.verify(rawBody, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    // Handle the webhook
    const eventType = evt.type;
    console.log("Processing webhook event type:", eventType);

    if (eventType === "user.created") {
      const { id } = evt.data;
      if (!id) {
        return new Response("Missing user ID", { status: 400 });
      }

      try {
        // Create Firebase auth user with minimal info
        await auth.createUser({
          uid: id,
        });

        // Create user document in Firestore with minimal structure
        const userData: UserDocument = {
          friendCode: null,
          cardsForTrade: [],
          wishlist: [],
          trades: {
            proposed: [],
            requests: [],
          },
        };

        // Document ID will be the user's UID
        await db.collection("users").doc(id).set(userData);
      } catch (error) {
        console.error("Error syncing user to Firebase:", error);
        return new Response("Error syncing user", { status: 500 });
      }
    }

    if (eventType === "user.updated") {
      // Skip updating Firestore document since we're not tracking these fields anymore
      const { id } = evt.data;
      if (!id) {
        return new Response("Missing user ID", { status: 400 });
      }

      try {
        // Only update Firebase auth user
        await auth.updateUser(id, {});
      } catch (error) {
        console.error("Error updating user in Firebase:", error);
        return new Response("Error updating user", { status: 500 });
      }
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;
      if (!id) {
        return new Response("Missing user ID", { status: 400 });
      }

      try {
        // Delete Firebase auth user
        await auth.deleteUser(id);
        // Delete user document from Firestore
        await db.collection("users").doc(id).delete();
      } catch (error) {
        console.error("Error deleting user from Firebase:", error);
        return new Response("Error deleting user", { status: 500 });
      }
    }
  } catch (err) {
    console.error("Webhook processing failed:", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      payload: payload ? JSON.stringify(payload) : "No payload",
    });

    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
