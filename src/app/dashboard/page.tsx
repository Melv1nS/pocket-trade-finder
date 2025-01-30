"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { FriendCodeForm } from "@/app/components/FriendCodeForm";
import Link from "next/link";
import Image from "next/image";
import React from "react";

interface CardPreview {
  id: string;
  image_url: string;
}

interface CardsByPack {
  [packName: string]: CardPreview[];
}

export default function Dashboard(): React.ReactElement {
  const { user, isLoaded } = useUser();
  const [hasFriendCode, setHasFriendCode] = useState<boolean | null>(null);
  const [cardsByPack, setCardsByPack] = useState<CardsByPack>({});
  const [isLoadingCards, setIsLoadingCards] = useState(true);

  useEffect(() => {
    async function checkFriendCode() {
      if (!user?.id) return;

      try {
        const response = await fetch("/api/user/friend-code");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to check friend code");
        }

        setHasFriendCode(data.hasFriendCode);
      } catch (error) {
        console.error("Error checking friend code:", error);
      }
    }

    async function fetchCards() {
      try {
        const response = await fetch("/api/cards");
        if (!response.ok) {
          throw new Error("Failed to fetch cards");
        }
        const data = await response.json();
        setCardsByPack(data);
      } catch (error) {
        console.error("Error fetching cards:", error);
      } finally {
        setIsLoadingCards(false);
      }
    }

    if (user?.id) {
      checkFriendCode();
      fetchCards();
    }
  }, [user?.id]);

  // Show loading state while checking friend code
  if (!isLoaded || hasFriendCode === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!hasFriendCode ? (
        <FriendCodeForm onComplete={() => setHasFriendCode(true)} />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome, {user?.firstName || "Trainer"}!
            </h1>
            <UserButton />
          </div>

          <div className="flex gap-4 mb-8">
            <Link
              href="/dashboard/trade-list"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Trade List
            </Link>
            <Link
              href="/dashboard/wish-list"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Wish List
            </Link>
          </div>

          {isLoadingCards ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : Object.keys(cardsByPack).length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No cards available
            </div>
          ) : (
            Object.entries(cardsByPack).map(([packName, cards]) => (
              <div key={packName} className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {packName}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {cards.map((card) => (
                    <Link
                      key={card.id}
                      href={`/cards/${packName}/${card.id}`}
                      className="relative aspect-[2/3] group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
                    >
                      <Image
                        src={card.image_url}
                        alt={`Card ${card.id}`}
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
