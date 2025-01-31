"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface Card {
  id: string;
  name: string;
  image_url: string;
  pack: string;
  rarity: string;
}

export default function WishList(): React.ReactElement {
  const { user } = useUser();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchWishlist() {
      try {
        const wishlistResponse = await fetch("/api/users/me/wishlist");
        if (!wishlistResponse.ok) throw new Error("Failed to fetch wishlist");
        const { wishlist } = await wishlistResponse.json();

        // Then fetch the details for each card
        const cardPromises = wishlist.map(async (cardId: string) => {
          const lastDashIndex = cardId.lastIndexOf("-");
          const pack = cardId.substring(0, lastDashIndex);
          const id = cardId.substring(lastDashIndex + 1);

          const response = await fetch(`/api/cards/${pack}/${id}`);
          if (!response.ok) throw new Error(`Failed to fetch card ${cardId}`);
          return response.json();
        });

        const cardDetails = await Promise.all(cardPromises);
        setCards(cardDetails);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load wishlist"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchWishlist();
  }, [user]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">My Wish List</h1>
        <div className="text-red-500 text-center py-8">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">My Wish List</h1>
        <div className="text-center py-8">
          Please sign in to view your wishlist
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-block mb-8 text-blue-500 hover:text-blue-600 transition-colors"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-8">My Wish List</h1>

      {cards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Your wishlist is empty. Browse cards to add them to your wishlist.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <Link
              key={`${card.pack}-${card.id}`}
              href={`/cards/${card.pack.toLowerCase().replace(/\s+/g, "-")}/${
                card.id
              }`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={card.image_url}
                    alt={card.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {card.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {card.pack} · {card.rarity}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
