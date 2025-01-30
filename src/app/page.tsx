"use client";

import { SignInButton, SignUpButton, useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show nothing while loading to prevent hydration mismatch
  if (!isLoaded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {isSignedIn && (
          <div className="flex justify-end mb-8">
            <UserButton afterSignOutUrl="/" />
          </div>
        )}

        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">
            Pokemon Pocket Trade Finder
          </h1>
          <p className="text-xl mb-8">
            Find and trade Pokemon TCG cards with collectors worldwide
          </p>

          {!isSignedIn ? (
            <div className="space-x-4">
              <SignInButton mode="modal">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
