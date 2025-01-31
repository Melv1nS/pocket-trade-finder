import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/app/lib/firebase-admin";

export interface CardDetails {
  id: string;
  name: string;
  image_url: string;
  pack: string;
  rarity: string;
}

export interface TradeWithCards {
  friendId: string;
  timestamp: string;
  message: string;
  cardToTrade: CardDetails;
  cardToReceive: CardDetails;
}

// Add base trade interface for raw data
interface Trade {
  friendId: string;
  timestamp: string;
  message: string;
  cardToTrade: string;
  cardToReceive: string;
}

type TradesResponse =
  | {
      proposed: TradeWithCards[];
      requests: TradeWithCards[];
    }
  | {
      error: string;
    };

async function fetchCardDetails(cardId: string): Promise<CardDetails> {
  const segments = cardId.split("-");
  const id = segments.pop() || "";
  const pack = segments.join("-");

  const packDoc = await db.collection("packs").doc(pack).get();

  if (!packDoc.exists) {
    throw new Error(`Pack not found for card ${cardId}`);
  }

  const packData = packDoc.data();
  const cardData = packData?.[id];

  if (!cardData) {
    throw new Error(`Card not found: ${cardId}`);
  }

  return {
    id,
    name: cardData.name,
    image_url: cardData.image_url,
    pack: cardData.pack || pack,
    rarity: cardData.rarity,
  };
}

export async function GET(): Promise<NextResponse<TradesResponse>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const rawTrades = userData?.trades || { proposed: [], requests: [] };

    // Fetch card details for all trades
    const proposed = await Promise.all(
      rawTrades.proposed.map(async (trade: Trade) => ({
        ...trade,
        cardToTrade: await fetchCardDetails(trade.cardToTrade),
        cardToReceive: await fetchCardDetails(trade.cardToReceive),
      }))
    );

    const requests = await Promise.all(
      rawTrades.requests.map(async (trade: Trade) => ({
        ...trade,
        cardToTrade: await fetchCardDetails(trade.cardToTrade),
        cardToReceive: await fetchCardDetails(trade.cardToReceive),
      }))
    );

    return NextResponse.json({ proposed, requests });
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}
