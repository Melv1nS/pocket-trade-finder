import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Get user's wishlist from Users collection
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    return NextResponse.json({
      wishlist: userData?.wishlist || [],
    });
  } catch (error) {
    return new NextResponse(`Internal Server Error: ${error}`, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { cardId } = await request.json();
    if (!cardId)
      return new NextResponse("Card ID is required", { status: 400 });

    // Get user's friend code
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    // Add debug logging
    console.log("User Data:", userData);
    console.log("Friend Code:", userData?.["friend-code"]);

    if (!userData?.["friend-code"]) {
      return NextResponse.json(
        { error: "Friend code required to add to wishlist" },
        { status: 400 }
      );
    }

    // Add to user's wishlist
    await db
      .collection("users")
      .doc(userId)
      .update({
        wishlist: [...(userData.wishlist || []), cardId],
      });

    // Add user to card's want list
    await db
      .collection("card-trades")
      .doc(cardId)
      .update({
        want: [...(await getCardWantList(cardId)), userId],
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/users/me/wishlist:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { cardId } = await request.json();
    if (!cardId)
      return new NextResponse("Card ID is required", { status: 400 });

    // Remove from user's wishlist
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const currentWishlist = userDoc.data()?.wishlist || [];

    await userRef.update({
      wishlist: currentWishlist.filter((id: string) => id !== cardId),
    });

    // Remove user from card's want list
    const cardRef = db.collection("card-trades").doc(cardId);
    const cardDoc = await cardRef.get();
    const currentWantList = cardDoc.data()?.want || [];

    await cardRef.update({
      want: currentWantList.filter((id: string) => id !== userId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/users/me/wishlist:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function getCardWantList(cardId: string): Promise<string[]> {
  const cardDoc = await db.collection("card-trades").doc(cardId).get();
  return cardDoc.data()?.want || [];
}
