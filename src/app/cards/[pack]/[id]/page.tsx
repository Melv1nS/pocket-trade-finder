"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Card {
  id: string;
  name: string;
  image_url: string;
  pack: string;
  rarity: string;
}

interface PageProps {
  params: {
    pack: string;
    id: string;
  };
}

export default function CardDetail({
  params: rawParams,
}: PageProps): React.ReactElement {
  const params = rawParams;
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCard() {
      try {
        const response = await fetch(`/api/cards/${params.pack}/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch card");
        }
        const data = await response.json();
        setCard(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load card"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchCard();
  }, [params.pack, params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || "Card not found"}</p>
        <Link
          href="/dashboard"
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <Link
          href="/dashboard"
          className="inline-block mb-8 text-blue-500 hover:text-blue-600 transition-colors"
        >
          ← Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl">
            <Image
              src={card.image_url}
              alt={card.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {card.name}
            </h1>
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pack
                </h2>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">
                  {card.pack}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Card Number
                </h2>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">
                  {card.id}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rarity
                </h2>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">
                  {card.rarity}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
