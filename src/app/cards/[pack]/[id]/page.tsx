"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CardThumbnail } from "@/app/components/CardThumbnail";

interface TradingUser {
  userId: string;
  "friend-code": string;
  wishlist?: string[];
  "available-to-trade"?: string[];
}

interface Card {
  id: string;
  name: string;
  image_url: string;
  pack: string;
  rarity: string;
}

export default function CardPage(): React.ReactElement {
  const { user } = useUser();
  const params = useParams();
  const pack = params.pack as string;
  const id = params.id as string;
  const [card, setCard] = useState<Card | null>(null);
  const [tradingUsers, setTradingUsers] = useState<{
    have: TradingUser[];
    want: TradingUser[];
  }>({ have: [], want: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingForTrade, setIsMarkingForTrade] = useState(false);
  const [isMarkedForTrade, setIsMarkedForTrade] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [showTraders, setShowTraders] = useState(false);
  const [showWanters, setShowWanters] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCard() {
      try {
        const response = await fetch(`/api/cards/${pack}/${id}`, {
          signal: controller.signal,
          cache: "force-cache",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCard(data);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchCard();

    return () => controller.abort();
  }, [pack, id]);

  const loadTradingUsers = useCallback(async () => {
    if (!showTraders && !showWanters) return;

    try {
      const response = await fetch(`/api/cards/${pack}/${id}/owners-of-card`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTradingUsers(data.users);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoadingUsers(false);
    }
  }, [pack, id, showTraders, showWanters]);

  useEffect(() => {
    if (pack && id) {
      loadTradingUsers();
    }
  }, [pack, id, loadTradingUsers]);

  useEffect(() => {
    if (!user) return;

    async function checkWishlist() {
      try {
        const response = await fetch("/api/users/me/wishlist");
        if (!response.ok) throw new Error("Failed to fetch wishlist status");

        const data = await response.json();
        const cardId = `${pack}-${id}`.toLowerCase();
        setIsInWishlist(data.wishlist.includes(cardId));
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    }

    checkWishlist();
  }, [user, pack, id]);

  useEffect(() => {
    setShowWanters(isMarkedForTrade);
  }, [isMarkedForTrade]);

  useEffect(() => {
    setShowTraders(isInWishlist);
  }, [isInWishlist]);

  useEffect(() => {
    if (showTraders || showWanters) {
      loadTradingUsers();
    }
  }, [showTraders, showWanters, loadTradingUsers]);

  async function handleMarkForTrade() {
    if (!user) return;

    setIsMarkingForTrade(true);
    try {
      const cardId = `${pack}-${id}`.toLowerCase();

      const response = await fetch("/api/users/me/available-for-trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark card for trade");
      }

      setIsMarkedForTrade(true);
      await loadTradingUsers();
    } catch (error) {
      console.error("Error marking card for trade:", error);
      // Show error to user
      setError(
        error instanceof Error ? error.message : "Failed to mark card for trade"
      );
    } finally {
      setIsMarkingForTrade(false);
    }
  }

  async function handleRemoveFromTrade() {
    if (!user) return;

    setIsMarkingForTrade(true);
    try {
      const cardId = `${pack}-${id}`.toLowerCase();

      const response = await fetch("/api/users/me/available-for-trade", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove card from trade");
      }

      setIsMarkedForTrade(false);
      await loadTradingUsers();
    } catch (error) {
      console.error("Error removing card from trade:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to remove card from trade"
      );
    } finally {
      setIsMarkingForTrade(false);
    }
  }

  async function handleWishlistToggle() {
    if (!user) return;
    setIsUpdatingWishlist(true);

    try {
      const cardId = `${pack}-${id}`.toLowerCase();

      const response = await fetch("/api/users/me/wishlist", {
        method: isInWishlist ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update wishlist");
      }

      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error("Error updating wishlist:", error);
      // Show error to user
      setError(
        error instanceof Error ? error.message : "Failed to update wishlist"
      );
    } finally {
      setIsUpdatingWishlist(false);
    }
  }

  if (isLoading || !card) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
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
      <div className="container mx-auto px-4 max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-block mb-8 text-blue-500 hover:text-blue-600 transition-colors"
        >
          ← Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:max-w-md mx-auto w-full">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl">
              <Image
                src={card.image_url}
                alt={card.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {user && (
              <div className="mt-4 space-y-2">
                {isMarkedForTrade ? (
                  <button
                    onClick={handleRemoveFromTrade}
                    disabled={isMarkingForTrade}
                    className={`w-full px-4 py-2 rounded-lg transition-colors 
                      bg-red-600 text-white hover:bg-red-700
                      ${isMarkingForTrade ? "opacity-50 cursor-wait" : ""}`}
                  >
                    {isMarkingForTrade ? "Removing..." : "Remove from Trade"}
                  </button>
                ) : (
                  <button
                    onClick={handleMarkForTrade}
                    disabled={isMarkingForTrade}
                    className={`w-full px-4 py-2 rounded-lg transition-colors 
                      ${
                        isMarkingForTrade
                          ? "bg-gray-400 text-white cursor-wait"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    {isMarkingForTrade ? "Marking..." : "Mark for Trade"}
                  </button>
                )}
                <button
                  onClick={handleWishlistToggle}
                  disabled={isUpdatingWishlist}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    isInWishlist
                      ? "bg-yellow-600 text-white hover:bg-yellow-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  } ${isUpdatingWishlist ? "opacity-50 cursor-wait" : ""}`}
                >
                  {isUpdatingWishlist
                    ? "Updating..."
                    : isInWishlist
                    ? "Remove from Wishlist"
                    : "Add to Wishlist"}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.name}
              </h1>
            </div>
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

        <div
          className={`mt-8 ${
            showTraders && showWanters
              ? "grid grid-cols-1 md:grid-cols-2 gap-8"
              : "space-y-8"
          }`}
        >
          {showTraders && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">
                People who have this card
              </h2>
              {isLoadingUsers ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : tradingUsers.have.length === 0 ? (
                <p className="text-gray-500">
                  No one is trading this card yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {tradingUsers.have.map((user) => (
                    <li
                      key={user.userId}
                      className="border-b pb-4 last:border-0"
                    >
                      <p className="font-medium">
                        Friend Code: {user["friend-code"]}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        They are looking for:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {user.wishlist?.map((cardId) => (
                          <CardThumbnail key={cardId} cardId={cardId} />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {showWanters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">
                People who want this card
              </h2>
              {isLoadingUsers ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : tradingUsers.want.length === 0 ? (
                <p className="text-gray-500">
                  No one is looking for this card yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {tradingUsers.want.map((user) => (
                    <li
                      key={user.userId}
                      className="border-b pb-4 last:border-0"
                    >
                      <p className="font-medium">
                        Friend Code: {user["friend-code"]}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        They have the following available to trade:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {user["available-to-trade"]?.map((cardId) => (
                          <CardThumbnail key={cardId} cardId={cardId} />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
