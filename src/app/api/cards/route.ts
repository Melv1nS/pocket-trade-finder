import { db } from "@/app/lib/firebase-admin";
import { NextResponse } from "next/server";

interface CardData {
  name: string;
  image_url: string;
  pack: string;
  rarity: string;
}

interface PackData {
  [key: string]: CardData;
}

// Define pack order
const PACK_ORDER = {
  "Genetic Apex A1": 1,
  "Mythical Islands A2": 2,
};

// This route fetches all cards from all packs
// Database: Reads from "packs" collection
// Purpose:
// - Retrieves all available cards across all packs
// - Sorts them by pack order (Genetic Apex A1 first, then Mythical Islands A2)
// - Returns a list of card previews with basic info (id, image, name, pack, rarity)
export async function GET() {
  try {
    const packsSnapshot = await db.collection("packs").get();
    const cards: Array<CardData & { id: string }> = [];

    packsSnapshot.forEach((packDoc) => {
      const packData = packDoc.data() as PackData;
      Object.entries(packData).forEach(([id, cardData]) => {
        cards.push({
          id,
          ...cardData,
        });
      });
    });

    // Sort cards by pack order and then by card ID
    const sortedCards = cards.sort((a, b) => {
      // First sort by pack order
      const packOrderDiff =
        (PACK_ORDER[a.pack as keyof typeof PACK_ORDER] || 999) -
        (PACK_ORDER[b.pack as keyof typeof PACK_ORDER] || 999);

      if (packOrderDiff !== 0) return packOrderDiff;

      // Then sort by card ID within each pack
      return parseInt(a.id) - parseInt(b.id);
    });

    console.log(`Total cards found: ${sortedCards.length}`); // Debug log

    if (sortedCards.length === 0) {
      console.log("Warning: No cards were found in the database"); // Debug log
    }

    return NextResponse.json(sortedCards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
