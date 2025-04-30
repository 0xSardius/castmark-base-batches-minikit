// app/demo/page.tsx
"use client";

import { useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import CastCard from "../components/cast/CastCard";
import { useUser } from "../context/UserContext";

// Demo cast data
const DEMO_CASTS = [
  {
    hash: "hash1",
    authorFid: 1,
    authorUsername: "alice",
    authorDisplayName: "Alice",
    authorPfp: "https://placehold.co/100x100?text=A",
    text: "Exploring the possibilities of mini apps on Farcaster. So many interesting ideas to build!",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    url: "https://warpcast.com/~/cast/hash1",
  },
  {
    hash: "hash2",
    authorFid: 2,
    authorUsername: "bob",
    authorDisplayName: "Bob",
    authorPfp: "https://placehold.co/100x100?text=B",
    text: "Just published my research on decentralized social graphs. Feedback welcome! https://example.com/research",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    url: "https://warpcast.com/~/cast/hash2",
  },
  {
    hash: "hash3",
    authorFid: 3,
    authorUsername: "carol",
    authorDisplayName: "Carol",
    authorPfp: "https://placehold.co/100x100?text=C",
    text: "Check out this new tool for organizing your bookmarks. Absolutely changed my workflow! #productivity",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    url: "https://warpcast.com/~/cast/hash3",
  },
];

export default function DemoPage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { isAuthenticated, signIn } = useUser();

  // Initialize the frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  return (
    <main className="flex min-h-screen flex-col items-center">
      <header className="w-full max-w-3xl p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Demo Feed</h1>
        <p className="text-sm text-gray-500">
          Try bookmarking these demo casts
        </p>
      </header>

      <div className="w-full max-w-3xl p-4">
        {!isAuthenticated && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-purple-700 mb-2">Sign in to bookmark casts</p>
            <button
              onClick={signIn}
              className="px-4 py-2 bg-purple-600 rounded-md text-white hover:bg-purple-700"
            >
              Sign in with Farcaster
            </button>
          </div>
        )}

        <div className="space-y-4">
          {DEMO_CASTS.map((cast) => (
            <CastCard key={cast.hash} cast={cast} />
          ))}
        </div>
      </div>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <a
          href="/bookmarks"
          className="px-4 py-2 bg-purple-600 rounded-full text-white font-medium shadow-lg hover:bg-purple-700 transition-colors"
        >
          View Your Bookmarks
        </a>
      </div>
    </main>
  );
}
