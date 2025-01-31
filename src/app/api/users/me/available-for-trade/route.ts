// Handles both:
// GET - fetch my cards for trade
// POST - mark a card as available for trade
// DELETE - remove a card from trade

import { db } from "@/app/lib/firebase-admin";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET - fetch my cards for trade
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's available-to-trade list from Users collection
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    return NextResponse.json({
      availableToTrade: userData?.["available-to-trade"] || [],
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

    // Get user's friend code
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.["friend-code"]) {
      return NextResponse.json(
        { error: "Friend code required to trade" },
        { status: 400 }
      );
    }

    // Add to user's available-to-trade list
    await db
      .collection("users")
      .doc(userId)
      .update({
        "available-to-trade": [
          ...(userData["available-to-trade"] || []),
          cardId,
        ],
      });

    // Add user to card's have list
    await db
      .collection("card-trades")
      .doc(cardId)
      .update({
        have: [...(await getCardHaveList(cardId)), userId],
      });

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

    // Remove from user's available-to-trade list
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const currentAvailableToTrade =
      userDoc.data()?.["available-to-trade"] || [];

    await userRef.update({
      "available-to-trade": currentAvailableToTrade.filter(
        (id: string) => id !== cardId
      ),
    });

    // Remove user from card's have list
    const cardRef = db.collection("card-trades").doc(cardId);
    const cardDoc = await cardRef.get();
    const currentHaveList = cardDoc.data()?.have || [];

    await cardRef.update({
      have: currentHaveList.filter((id: string) => id !== userId),
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

async function getCardHaveList(cardId: string): Promise<string[]> {
  const cardDoc = await db.collection("card-trades").doc(cardId).get();
  return cardDoc.data()?.have || [];
}
