// app/bookmarks/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useMiniKit, useClose } from "@coinbase/onchainkit/minikit";
import { FiArrowLeft, FiLink, FiList } from "react-icons/fi";
import BookmarkList from "../components/bookmark/BookmarkList";
import CastImportForm from "../components/bookmark/CastImportForm";

export default function BookmarksPage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const close = useClose();
  const [activeTab, setActiveTab] = useState<"list" | "import">("list");
  const [showImported, setShowImported] = useState(false);

  // Initialize the frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  const handleImportSuccess = () => {
    setShowImported(true);
    // Auto-switch to list tab after successful import
    setTimeout(() => {
      setActiveTab("list");
      setShowImported(false);
    }, 1500);
  };

  const handleGoBack = () => {
    // Navigate to home page for MiniKit compatibility
    window.location.href = "/";
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <header className="w-full max-w-3xl flex items-center justify-between p-4 border-b-4 border-black bg-white">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="mr-4 p-2 rounded-lg border-4 border-black bg-white hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] transition-all text-xl"
            aria-label="Go back"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-base font-black tracking-wide border-4 border-black rounded-lg px-3 py-1 bg-white text-center select-none">
            Your Bookmarks
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`p-2 rounded-lg border-4 border-black hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] transition-all ${
              activeTab === "list" ? "bg-purple-400" : "bg-white"
            }`}
            aria-label="View bookmarks"
          >
            <FiList size={24} />
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`p-2 rounded-lg border-4 border-black hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] transition-all ${
              activeTab === "import" ? "bg-purple-400" : "bg-white"
            }`}
            aria-label="Import cast"
          >
            <FiLink size={24} />
          </button>
        </div>
      </header>

      <div className="w-full max-w-3xl p-4">
        {showImported && (
          <div className="mb-4 p-3 bg-green-400 text-black font-bold rounded-lg border-4 border-black shadow-[4px_4px_0_0_#000] text-center animate-pulse">
            Cast saved successfully! Showing your bookmarks...
          </div>
        )}

        {activeTab === "list" ? (
          <BookmarkList />
        ) : (
          <div className="mt-4">
            <CastImportForm onSuccess={handleImportSuccess} />
            <p className="text-center mt-4 text-gray-500 text-sm">
              Paste a Farcaster cast URL or hash to save it to your bookmarks
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-4 right-4">
        <button
          onClick={close}
          className="px-4 py-2 bg-gray-200 rounded-full text-gray-700 font-medium shadow-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </main>
  );
}
