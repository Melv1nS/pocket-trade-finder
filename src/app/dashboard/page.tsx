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
  name: string;
  pack: string;
  rarity: string;
}

export default function Dashboard(): React.ReactElement {
  const { user, isLoaded } = useUser();
  const [hasFriendCode, setHasFriendCode] = useState<boolean | null>(null);
  const [cards, setCards] = useState<CardPreview[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPack, setSelectedPack] = useState<string>("");
  const [selectedRarity, setSelectedRarity] = useState<string>("");

  // Derived values
  const uniquePacks = [...new Set(cards.map((card) => card.pack))];
  const uniqueRarities = [...new Set(cards.map((card) => card.rarity))];

  const filteredCards = cards.filter((card) => {
    const matchesSearch = card.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPack = !selectedPack || card.pack === selectedPack;
    const matchesRarity = !selectedRarity || card.rarity === selectedRarity;
    return matchesSearch && matchesPack && matchesRarity;
  });

  useEffect(() => {
    async function checkFriendCode() {
      if (!user?.id) return;

      try {
        const response = await fetch("/api/users/me/friend-code");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setHasFriendCode(data.hasFriendCode);
      } catch (error) {
        console.error("Error checking friend code:", error);
        setHasFriendCode(false);
      }
    }

    async function fetchCards() {
      try {
        const response = await fetch("/api/cards", {
          cache: "force-cache",
          next: {
            revalidate: 3600,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCards(data);

        sessionStorage.setItem("dashboardCards", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching cards:", error);
        setCards([]);
      } finally {
        setIsLoadingCards(false);
      }
    }

    const cachedCards = sessionStorage.getItem("dashboardCards");
    if (cachedCards) {
      setCards(JSON.parse(cachedCards));
      setIsLoadingCards(false);
    } else if (user?.id) {
      fetchCards();
    }

    if (user?.id) {
      checkFriendCode();
    }
  }, [user?.id]);

  // Add debug logging for filtered cards
  console.log("Filtered cards:", filteredCards); // Debug log
  console.log("Search term:", searchTerm); // Debug log
  console.log("Selected pack:", selectedPack); // Debug log
  console.log("Selected rarity:", selectedRarity); // Debug log

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
            <Link
              href="/dashboard/trades"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Trades
            </Link>
          </div>

          {isLoadingCards ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
                <select
                  value={selectedPack}
                  onChange={(e) => setSelectedPack(e.target.value)}
                  className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">All Packs</option>
                  {uniquePacks.map((pack) => (
                    <option key={pack} value={pack}>
                      {pack}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">All Rarities</option>
                  {uniqueRarities.map((rarity) => (
                    <option key={rarity} value={rarity}>
                      {rarity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredCards.map((card) => (
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

              {filteredCards.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No cards found matching your criteria
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
