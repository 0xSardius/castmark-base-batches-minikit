// app/bookmarks/page.tsx
"use client";

import { useEffect } from "react";
import { useMiniKit, useClose } from "@coinbase/onchainkit/minikit";
import { FiArrowLeft } from "react-icons/fi";
import BookmarkList from "../components/bookmark/BookmarkList";

export default function BookmarksPage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const close = useClose();

  // Initialize the frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  return (
    <main className="flex min-h-screen flex-col items-center">
      <header className="w-full max-w-3xl flex items-center justify-between p-4 border-b-4 border-black bg-white">
        <div className="flex items-center">
          <button
            onClick={() => window.history.back()}
            className="mr-4 p-2 rounded-lg border-4 border-black bg-white hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] transition-all text-xl"
            aria-label="Go back"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-base font-black tracking-wide border-4 border-black rounded-lg px-3 py-1 bg-white text-center select-none">
            Your Bookmarks
          </h1>
        </div>
      </header>

      <div className="w-full max-w-3xl">
        <BookmarkList />
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
