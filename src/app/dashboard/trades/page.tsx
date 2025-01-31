"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { TradeWithCards } from "@/app/api/users/me/trades/route";

interface TradeSection {
  title: string;
  trades: TradeWithCards[];
  emptyMessage: string;
  type: "proposed" | "requests";
}

export default function TradesPage() {
  const [trades, setTrades] = useState<{
    proposed: TradeWithCards[];
    requests: TradeWithCards[];
  }>({
    proposed: [],
    requests: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrades() {
      try {
        const response = await fetch("/api/users/me/trades");
        if (!response.ok) throw new Error("Failed to fetch trades");
        const data = await response.json();
        setTrades(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trades");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrades();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const sections: TradeSection[] = [
    {
      title: "Trade Requests",
      trades: trades.requests,
      emptyMessage: "No trade requests yet",
      type: "requests",
    },
    {
      title: "Proposed Trades",
      trades: trades.proposed,
      emptyMessage: "No proposed trades yet",
      type: "proposed",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Trades
          </h1>
        </div>

        {sections.map((section) => (
          <div key={section.type} className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {section.title}
            </h2>

            {section.trades.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                {section.emptyMessage}
              </p>
            ) : (
              <div className="grid gap-6">
                {section.trades.map((trade, index) => (
                  <div
                    key={`${trade.friendId}-${index}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                  >
                    <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Friend ID: {trade.friendId}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(trade.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      {trade.message && (
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          &ldquo;{trade.message}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-center mb-2 font-medium text-gray-700 dark:text-gray-300">
                          Offering
                        </p>
                        <div className="relative aspect-[2/3] w-full">
                          <Image
                            src={trade.cardToTrade.image_url}
                            alt={trade.cardToTrade.name}
                            fill
                            className="object-contain rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <ArrowRightIcon className="w-6 h-6 text-gray-400" />
                        <ArrowLeftIcon className="w-6 h-6 text-gray-400" />
                      </div>

                      <div className="flex-1">
                        <p className="text-center mb-2 font-medium text-gray-700 dark:text-gray-300">
                          Receiving
                        </p>
                        <div className="relative aspect-[2/3] w-full">
                          <Image
                            src={trade.cardToReceive.image_url}
                            alt={trade.cardToReceive.name}
                            fill
                            className="object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
