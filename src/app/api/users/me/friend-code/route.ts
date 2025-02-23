import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/lib/firebase-admin";
import { NextResponse } from "next/server";

export const revalidate = 60;

// GET - check if user has set their friend code
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userDoc = await db.collection("users").doc(userId).get();
    const friendCode = userDoc.get("friend-code");

    return NextResponse.json({
      hasFriendCode: userDoc.exists && friendCode ? true : false,
    });
  } catch (error) {
    console.error("Error checking friend code:", error);
    return NextResponse.json(
      { error: "Failed to check friend code" },
      { status: 500 }
    );
  }
}

// POST - set user's friend code
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const { friendCode } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate friend code format XXXX-XXXX-XXXX-XXXX
    if (!friendCode || !/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(friendCode)) {
      return NextResponse.json(
        {
          error:
            "Invalid friend code format. Please use format: XXXX-XXXX-XXXX-XXXX",
        },
        { status: 400 }
      );
    }

    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          "friend-code": friendCode,
          "available-to-trade": [],
          wishlist: [],
          trades: { proposed: [], requests: [] },
        },
        { merge: true }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving friend code:", error);
    return NextResponse.json(
      { error: "Failed to save friend code" },
      { status: 500 }
    );
  }
}
