"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Pokemon Pocket Trade Finder
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
            Find and trade Pokemon TCG cards with collectors worldwide
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/search"
              className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-medium border border-gray-200 dark:border-gray-700 transition-colors"
            >
              Search Cards
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Image
                src="/icons/search.svg"
                alt="Search icon"
                width={24}
                height={24}
                className="dark:invert"
                priority
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Find Cards</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Search through thousands of Pokemon TCG cards available for trade
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Image
                src="/icons/trade.svg"
                alt="Trade icon"
                width={24}
                height={24}
                className="dark:invert"
                priority
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trade Cards</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with other collectors and arrange trades easily
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Image
                src="/icons/collection.svg"
                alt="Collection icon"
                width={24}
                height={24}
                className="dark:invert"
                priority
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Manage Collection</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Keep track of your cards and manage your trade list
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-blue-50 dark:bg-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to start trading?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join our community of Pokemon card traders today
          </p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium inline-block transition-colors"
          >
            Sign Up Now
          </Link>
        </section>
      </div>
    </div>
  );
}
