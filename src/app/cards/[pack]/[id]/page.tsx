"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface TradingUser {
  userId: string;
  friendCode: string;
  wishlist: string[];
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
  const [tradingUsers, setTradingUsers] = useState<TradingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [isMarkingForTrade, setIsMarkingForTrade] = useState(false);
  const [isMarkedForTrade, setIsMarkedForTrade] = useState(false);

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
    try {
      const response = await fetch(`/api/cards/${pack}/${id}/trading-users`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTradingUsers(data.users);
      setIsMarkedForTrade(data.users.some((u) => u.userId === user?.id));
    } catch (error) {
      if (error instanceof Error) {
        setUsersError(error.message);
      }
    } finally {
      setIsLoadingUsers(false);
    }
  }, [pack, id, user?.id]);

  useEffect(() => {
    if (pack && id) {
      loadTradingUsers();
    }
  }, [pack, id, loadTradingUsers]);

  async function handleMarkForTrade() {
    if (!user) return;

    setIsMarkingForTrade(true);
    try {
      const response = await fetch("/api/users/me/cards-for-trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: `${pack}-${id}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark card for trade");
      }

      setIsMarkedForTrade(true);
      await loadTradingUsers();
    } catch (error) {
      console.error("Error marking card for trade:", error);
    } finally {
      setIsMarkingForTrade(false);
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
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.name}
              </h1>
              {user && (
                <button
                  onClick={handleMarkForTrade}
                  disabled={isMarkingForTrade || isMarkedForTrade}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isMarkedForTrade
                      ? "bg-green-600 text-white cursor-not-allowed"
                      : isMarkingForTrade
                      ? "bg-gray-400 text-white cursor-wait"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isMarkedForTrade
                    ? "Marked for Trade"
                    : isMarkingForTrade
                    ? "Marking..."
                    : "Mark for Trade"}
                </button>
              )}
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

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Available for Trade
          </h2>

          {isLoadingUsers ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : usersError ? (
            <div className="text-red-500 text-center py-8">
              Failed to load trading users
            </div>
          ) : tradingUsers.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              No users currently have this card available for trade
            </div>
          ) : (
            <div className="grid gap-4">
              {tradingUsers
                .filter((user) => user.friendCode)
                .map((user) => (
                  <div
                    key={user.userId}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          Friend Code: {user.friendCode}
                        </p>
                        {user.wishlist.length > 0 ? (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Looking for:
                            </p>
                            <ul className="mt-1 space-y-1">
                              {user.wishlist.map((cardPath) => (
                                <li
                                  key={cardPath}
                                  className="text-sm text-gray-600 dark:text-gray-300"
                                >
                                  {cardPath}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            No specific cards wanted
                          </p>
                        )}
                      </div>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => {
                          console.log("Propose trade with:", user.friendCode);
                        }}
                      >
                        Propose Trade
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
