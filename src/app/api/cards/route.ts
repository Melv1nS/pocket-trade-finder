import { db } from "@/app/lib/firebase-admin";
import { NextResponse } from "next/server";

interface CardPreview {
  id: string;
  image_url: string;
}

interface CardData {
  image_url: string;
  [key: string]: unknown;
}

interface CardsByPack {
  [packName: string]: CardPreview[];
}

export async function GET() {
  try {
    const packsRef = db.collection("packs");
    const packsSnapshot = await packsRef.get();
    const cardsByPack: CardsByPack = {};

    for (const packDoc of packsSnapshot.docs) {
      const packName = packDoc.id;
      const packData = packDoc.data();
      const cards: CardPreview[] = [];

      // Each field in the document is a card number with its data
      Object.entries(packData).forEach(([cardNumber, cardData]) => {
        if (typeof cardData === "object" && cardData !== null) {
          const typedCardData = cardData as CardData;
          cards.push({
            id: cardNumber,
            image_url: typedCardData.image_url || "",
          });
        }
      });

      // Sort cards by their number
      cards.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      cardsByPack[packName] = cards;
    }

    return NextResponse.json(cardsByPack);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}
