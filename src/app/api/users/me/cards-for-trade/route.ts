// Handles both:
// GET - fetch my cards for trade
// POST - mark a card as available for trade
// DELETE - remove a card from trade

import { db } from "@/app/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET - fetch my cards for trade
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      const newUser = {
        cardsForTrade: [],
        wishlist: [],
        friendCode: "",
        trades: {
          proposed: [],
          requests: [],
        },
      };

      await db.collection("users").doc(userId).set(newUser);
      return NextResponse.json({ cardsForTrade: [] });
    }

    const userData = userDoc.data();
    return NextResponse.json({
      cardsForTrade: userData?.cardsForTrade || [],
    });
  } catch (error) {
    console.error("Error fetching user cards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - mark a card as available for trade
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cardId } = await request.json();

    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user's cardsForTrade
    await db
      .collection("users")
      .doc(userId)
      .update({
        cardsForTrade: [...(userData.cardsForTrade || []), cardId],
      });

    // Add userId directly to the card document
    await db
      .collection("cards-for-trade")
      .doc(cardId)
      .set(
        {
          [userId]: true, // Using true as a simple value to indicate presence
        },
        { merge: true }
      ); // Use merge to not overwrite other users

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking card for trade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - remove a card from trade
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cardId } = await request.json();

    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove card from user's cardsForTrade
    await db
      .collection("users")
      .doc(userId)
      .update({
        cardsForTrade: (userData.cardsForTrade || []).filter(
          (id: string) => id !== cardId
        ),
      });

    // Remove userId from card document
    await db
      .collection("cards-for-trade")
      .doc(cardId)
      .update({
        [userId]: FieldValue.delete(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing card from trade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
