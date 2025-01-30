"use client";

import { useState, useEffect } from "react";
import { TradeUser } from "@/app/types/TradeUser";
import {
  fetchTradingUsers,
  markCardForTrade,
  isCardMarkedForTrade,
} from "@/app/lib/api/cards";

interface CardDetailsProps {
  cardId: string;
}

export function CardDetails({ cardId }: CardDetailsProps) {
  const [tradingUsers, setTradingUsers] = useState<TradeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkedForTrade, setIsMarkedForTrade] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [users, marked] = await Promise.all([
          fetchTradingUsers(cardId),
          isCardMarkedForTrade(cardId),
        ]);
        setTradingUsers(users);
        setIsMarkedForTrade(marked);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load card details"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [cardId]);

  const handleMarkForTrade = async () => {
    try {
      await markCardForTrade(cardId);
      setIsMarkedForTrade(true);
      const users = await fetchTradingUsers(cardId);
      setTradingUsers(users);
    } catch (err) {
      setError(`Failed to mark card for trade: ${err}`);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      {!isMarkedForTrade && (
        <button
          onClick={handleMarkForTrade}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Mark This Card for Trade
        </button>
      )}

      <h3 className="text-lg font-bold mt-4">Users Trading This Card:</h3>
      {tradingUsers.length === 0 ? (
        <p>No users are currently trading this card</p>
      ) : (
        <ul className="space-y-4">
          {tradingUsers.map((user) => (
            <li key={user.userId} className="border p-3 rounded">
              <p>Friend Code: {user.friendCode}</p>
              <p>Looking For:</p>
              <ul className="list-disc ml-6">
                {user.wishlist.map((cardId) => (
                  <li key={cardId}>{cardId}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
