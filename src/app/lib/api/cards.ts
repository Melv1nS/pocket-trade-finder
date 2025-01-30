import { TradeUser } from "@/app/types/TradeUser";

export async function fetchTradingUsers(cardId: string): Promise<TradeUser[]> {
  const [pack, id] = cardId.split("-");
  const response = await fetch(`/api/cards/${pack}/${id}/trading-users`);

  if (!response.ok) {
    throw new Error("Failed to fetch trading users");
  }

  const data = await response.json();
  return data.users;
}

export async function markCardForTrade(cardId: string): Promise<void> {
  const response = await fetch("/api/cards/trade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cardId }),
  });

  if (!response.ok) {
    throw new Error("Failed to mark card for trade");
  }
}

export async function isCardMarkedForTrade(cardId: string): Promise<boolean> {
  const response = await fetch(`/api/cards/${cardId}/is-marked`);
  if (!response.ok) {
    throw new Error("Failed to check card status");
  }
  const data = await response.json();
  return data.isMarked;
}
