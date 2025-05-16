"use client";

import { useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { FiArrowLeft } from "react-icons/fi";
import CastImportForm from "../components/bookmark/CastImportForm";

export default function QuickSavePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  // Initialize the frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  const handleSaveSuccess = () => {
    // Delay for UI feedback, then navigate to bookmarks
    setTimeout(() => {
      window.location.href = "/bookmarks";
    }, 1500);
  };

  const handleGoBack = () => {
    window.location.href = "/";
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <header className="w-full max-w-md flex items-center mb-6">
        <button
          onClick={handleGoBack}
          className="mr-4 p-2 rounded-lg border-4 border-black bg-white hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] transition-all text-xl"
          aria-label="Go back"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black">Quick Save</h1>
      </header>

      <div className="w-full max-w-md">
        <CastImportForm onSuccess={handleSaveSuccess} />
      </div>
    </main>
  );
}
