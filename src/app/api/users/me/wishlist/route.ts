import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const userDoc = await db.collection("users").doc(userId).get();
    const wishlist = userDoc.data()?.wishlist || [];

    return NextResponse.json({ wishlist });
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

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const currentWishlist = userDoc.data()?.wishlist || [];

    // Check if card is already in wishlist
    if (currentWishlist.includes(cardId)) {
      return NextResponse.json({ success: true });
    }

    await userRef.update({
      wishlist: [...currentWishlist, cardId],
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

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const currentWishlist = userDoc.data()?.wishlist || [];

    await userRef.update({
      wishlist: currentWishlist.filter((id: string) => id !== cardId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/users/me/wishlist:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
