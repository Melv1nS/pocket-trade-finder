"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

interface CardForTrade {
  id: string;
  name: string;
  image_url: string;
  pack: string;
  rarity: string;
}

export default function TradeList(): React.ReactElement {
  const { user } = useUser();
  const [cards, setCards] = useState<CardForTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTradeList() {
      try {
        // First get the list of card IDs from the user's trade list
        const response = await fetch("/api/users/me/cards-for-trade");
        if (!response.ok) {
          throw new Error("Failed to fetch trade list");
        }
        const data = await response.json();

        // For each card ID, fetch the card details
        const cardPromises = data.cardsForTrade.map(async (cardId: string) => {
          // Fix the parsing of cardId
          const lastHyphenIndex = cardId.lastIndexOf("-");
          const pack = cardId.substring(0, lastHyphenIndex);
          const id = cardId.substring(lastHyphenIndex + 1);

          const cardResponse = await fetch(`/api/cards/${pack}/${id}`);
          if (!cardResponse.ok) {
            throw new Error(`Failed to fetch card ${cardId}`);
          }
          return cardResponse.json();
        });

        const cardDetails = await Promise.all(cardPromises);
        setCards(cardDetails);
      } catch (error) {
        console.error("Error fetching trade list:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load trade list"
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.id) {
      fetchTradeList();
    }
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Trade List
          </h1>
          <Link
            href="/dashboard"
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : cards.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">
            You haven&apos;t marked any cards for trade yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cards.map((card) => (
              <Link
                key={`${card.pack}-${card.id}`}
                href={`/cards/${card.pack}/${card.id}`}
                className="relative aspect-[2/3] group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <Image
                  src={card.image_url}
                  alt={card.name}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-sm">
                  <p className="truncate">{card.name}</p>
                  <p className="text-xs opacity-75">{card.rarity}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
