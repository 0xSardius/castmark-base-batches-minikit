"use client";

import { useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { FiArrowLeft } from "react-icons/fi";
import CastImportForm from "../components/bookmark/CastImportForm";
import { useSearchParams } from "next/navigation";

export default function QuickSavePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const searchParams = useSearchParams();
  const [castInput, setCastInput] = useState<string>("");
  const [autoSubmitTrigger, setAutoSubmitTrigger] = useState<boolean>(false);

  // Get cast hash from URL if available
  useEffect(() => {
    const cast = searchParams.get("cast");
    if (cast) {
      // Format as 0x prefix hash if needed
      const formattedCast = cast.startsWith("0x") ? cast : `0x${cast}`;
      setCastInput(formattedCast);

      // Trigger auto-submit after a short delay for UI to initialize
      setTimeout(() => {
        setAutoSubmitTrigger(true);
      }, 500);
    }
  }, [searchParams]);

  // Initialize the frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  const handleSaveSuccess = () => {
    // Show a success notification and redirect to bookmarks
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
        <CastImportForm
          initialCastUrl={castInput}
          onSuccess={handleSaveSuccess}
          autoSubmit={autoSubmitTrigger}
        />
      </div>
    </main>
  );
}
