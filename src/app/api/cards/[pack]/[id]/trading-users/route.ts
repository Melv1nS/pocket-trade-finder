import { db } from "@/app/lib/firebase-admin";
import { FieldPath } from "firebase-admin/firestore";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pack: string; id: string }> }
) {
  try {
    const { pack, id } = await params;

    const cardDoc = await db
      .collection("cards-for-trade")
      .doc(`${pack}-${id}`)
      .get();

    if (!cardDoc.exists) {
      return NextResponse.json({ users: [] });
    }

    const cardData = cardDoc.data() || {};
    const userIds = Object.keys(cardData);

    if (userIds.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Fetch user details for all userIds
    const usersSnapshot = await db
      .collection("users")
      .where(FieldPath.documentId(), "in", userIds)
      .get();

    const users = usersSnapshot.docs.map((doc) => ({
      userId: doc.id,
      friendCode: doc.data().friendCode,
      wishlist: doc.data().wishlist || [],
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching trading users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
