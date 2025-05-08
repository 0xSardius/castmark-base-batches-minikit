"use client";

import { useEffect } from "react";
import { useMiniKit, useClose } from "@coinbase/onchainkit/minikit";
import { FiArrowLeft } from "react-icons/fi";
import CollectionsList from "@/components/collection/CollectionsList";

export default function CollectionsPage() {
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
      <header className="w-full max-w-3xl flex items-center p-4 border-b border-gray-200">
        <button
          onClick={() => window.history.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Your Collections</h1>
      </header>

      <div className="w-full max-w-3xl">
        <CollectionsList />
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
