"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface CardThumbnailProps {
  cardId: string;
}

interface CardData {
  name: string;
  image_url: string;
}

export function CardThumbnail({ cardId }: CardThumbnailProps) {
  const [card, setCard] = useState<CardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCard() {
      try {
        const lastDashIndex = cardId.lastIndexOf("-");
        const pack = cardId.substring(0, lastDashIndex);
        const id = cardId.substring(lastDashIndex + 1);

        const response = await fetch(`/api/cards/${pack}/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCard(data);
        }
      } catch (error) {
        console.error(`Failed to fetch card ${cardId}:`, error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCard();
  }, [cardId]);

  if (isLoading) {
    return (
      <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    );
  }

  if (!card) {
    return null;
  }

  return (
    <div className="relative group">
      <div className="relative w-16 h-24 overflow-hidden rounded-lg">
        <Image
          src={card.image_url}
          alt={card.name}
          fill
          className="object-cover"
          sizes="64px"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-xs text-center px-1">
              {card.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
