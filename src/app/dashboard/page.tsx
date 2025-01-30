"use client";

import { UserButton, useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const { user, isLoaded } = useUser();

  // Show nothing while loading to prevent hydration mismatch
  if (!isLoaded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            Welcome, {user?.firstName || "Trainer"}!
          </h1>
          <UserButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">My Trade List</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You haven&apos;t added any cards for trade yet.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Looking For</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You haven&apos;t added any cards to your wishlist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
