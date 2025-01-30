import { db } from "@/app/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface TradeProposal {
  friendId: string;
  cardToTrade: string;
  cardToReceive: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposal: TradeProposal = await request.json();

    // Add to proposer's proposed trades
    await db
      .collection("users")
      .doc(userId)
      .update({
        "trades.proposed": FieldValue.arrayUnion({
          ...proposal,
          timestamp: new Date().toISOString(),
        }),
      });

    // Add to receiver's trade requests
    await db
      .collection("users")
      .doc(proposal.friendId)
      .update({
        "trades.requests": FieldValue.arrayUnion({
          friendId: userId,
          cardToTrade: proposal.cardToReceive,
          cardToReceive: proposal.cardToTrade,
          message: proposal.message,
          timestamp: new Date().toISOString(),
        }),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error proposing trade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
