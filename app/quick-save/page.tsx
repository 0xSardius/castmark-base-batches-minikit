"use client";

import { useEffect } from "react";
import { useMiniKit, useClose } from "@coinbase/onchainkit/minikit";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import CastImportForm from "../components/bookmark/CastImportForm";

export default function QuickSavePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const close = useClose();
  const router = useRouter();
  const { showAuthPrompt, dbUser, loading } = useUser();

  // Initialize the frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  // Prompt for authentication if needed
  useEffect(() => {
    const authenticate = async () => {
      if (!loading && !dbUser) {
        const isAuth = await showAuthPrompt();
        if (!isAuth) {
          // Redirect to home if not authenticated
          router.push("/");
        }
      }
    };

    authenticate();
  }, [dbUser, loading, router, showAuthPrompt]);

  const handleSuccess = () => {
    // Navigate to bookmarks after successful save
    setTimeout(() => {
      router.push("/bookmarks");
    }, 1500);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <header className="w-full max-w-md flex items-center mb-6">
        <button
          onClick={() => window.history.back()}
          className="mr-4 p-2 rounded-lg border-4 border-black bg-white hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] transition-all text-xl"
          aria-label="Go back"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black tracking-wide border-4 border-black rounded-lg px-3 py-1 bg-white text-center select-none">
          Quick Castmark
        </h1>
      </header>

      <div className="w-full max-w-md">
        <CastImportForm onSuccess={handleSuccess} />
        <p className="text-center mt-4 text-gray-500">
          Paste a Farcaster cast URL or hash to save it to your bookmarks
        </p>
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
