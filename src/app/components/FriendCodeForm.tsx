"use client";

import { useState } from "react";

interface FriendCodeFormProps {
  onComplete: () => void;
}

export function FriendCodeForm({ onComplete }: FriendCodeFormProps) {
  const [friendCode, setFriendCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function formatFriendCode(code: string) {
    // Remove any non-digits and existing hyphens
    const digits = code.replace(/[^\d]/g, "");

    // Add hyphens after every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, "$1-");
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatFriendCode(e.target.value);
    // Only update if we haven't exceeded max length (19 chars: 16 digits + 3 hyphens)
    if (formatted.length <= 19) {
      setFriendCode(formatted);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate format
    if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(friendCode)) {
      setError(
        "Please enter a valid friend code in format: XXXX-XXXX-XXXX-XXXX"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/users/me/friend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save friend code");
      }

      onComplete();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save friend code"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">
          Welcome to Pokemon Pocket Trade!
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          Please enter your friend code to continue. You can find this code by
          clicking on your profile picture in the Pokemon Pocket TCG app.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={friendCode}
            onChange={handleCodeChange}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600"
            maxLength={19}
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Friend Code"}
          </button>
        </form>
      </div>
    </div>
  );
}
