import { db } from "@/app/lib/firebase-admin";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pack: string; id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pack, id } = await params;
    const cardId = `${pack}-${id}`.toLowerCase();

    // Get the card document
    const cardDoc = await db.collection("card-trades").doc(cardId).get();
    if (!cardDoc.exists) {
      return NextResponse.json({ users: { have: [], want: [] } });
    }

    const cardData = cardDoc.data();
    // Filter out current user from both arrays
    const haveUserIds = (cardData?.have || []).filter(
      (id: string) => id !== userId
    );
    const wantUserIds = (cardData?.want || []).filter(
      (id: string) => id !== userId
    );

    // Get user details for both arrays
    const [haveUsers, wantUsers] = await Promise.all([
      Promise.all(
        haveUserIds.map(async (userId: string) => {
          const userDoc = await db.collection("users").doc(userId).get();
          const userData = userDoc.data();
          return {
            userId,
            "friend-code": userData?.["friend-code"],
            wishlist: userData?.wishlist || [],
          };
        })
      ),
      Promise.all(
        wantUserIds.map(async (userId: string) => {
          const userDoc = await db.collection("users").doc(userId).get();
          const userData = userDoc.data();
          return {
            userId,
            "friend-code": userData?.["friend-code"],
            "available-to-trade": userData?.["available-to-trade"] || [],
          };
        })
      ),
    ]);

    return NextResponse.json({
      users: {
        have: haveUsers,
        want: wantUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching trading users:", error);
    return NextResponse.json(
      { error: "Failed to fetch trading users" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
