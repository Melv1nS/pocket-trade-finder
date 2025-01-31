import { db } from "@/app/lib/firebase-admin";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

type RouteContext = {
  params: {
    pack: string;
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pack, id } = params;
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
