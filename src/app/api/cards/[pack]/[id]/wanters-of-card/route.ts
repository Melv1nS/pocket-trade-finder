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

    const cardDoc = await db.collection("card-trades").doc(cardId).get();

    return NextResponse.json({
      isMarkedForTrade:
        (cardDoc.exists && cardDoc.data()?.have?.includes(userId)) || false,
    });
  } catch (error) {
    console.error("Error checking trade status:", error);
    return NextResponse.json(
      { error: "Failed to check trade status" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
