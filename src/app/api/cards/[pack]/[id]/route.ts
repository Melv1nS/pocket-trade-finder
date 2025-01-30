import { db } from "@/app/lib/firebase-admin";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pack: string; id: string }> }
) {
  try {
    const { pack, id } = await params;

    const packDoc = await db.collection("packs").doc(pack).get();

    if (!packDoc.exists) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const packData = packDoc.data();
    const cardData = packData?.[id];

    if (!cardData) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      id,
      name: cardData.name,
      image_url: cardData.image_url,
      pack: cardData.pack || pack,
      rarity: cardData.rarity,
    });
  } catch (error) {
    console.error("Error fetching card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
