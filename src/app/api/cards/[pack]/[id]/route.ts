import { db } from "@/app/lib/firebase-admin";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    pack: string;
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const packDoc = await db.collection("packs").doc(params.pack).get();

    if (!packDoc.exists) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const packData = packDoc.data();
    const cardData = packData?.[params.id];

    if (!cardData) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: params.id,
      name: cardData.name,
      image_url: cardData.image_url,
      pack: cardData.pack || params.pack,
      rarity: cardData.rarity,
    });
  } catch (error) {
    console.error("Error fetching card:", error);
    return NextResponse.json(
      { error: "Failed to fetch card" },
      { status: 500 }
    );
  }
}
