// app/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useMiniKit, useClose } from "@coinbase/onchainkit/minikit";
import { FiArrowLeft } from "react-icons/fi";
import UserProfile from "@/components/user/UserProfile";
import { useUser } from "@/context/UserContext";
import AuthStatus from "@/components/auth/AuthStatus";

export default function ProfilePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const close = useClose();
  const { isAuthenticated, signIn } = useUser();

  // Initialize the frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  return (
    <main className="flex min-h-screen flex-col items-center pb-16">
      <header className="w-full max-w-3xl flex items-center p-4 border-b border-gray-200">
        <button
          onClick={() => window.history.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Profile</h1>
      </header>

      <div className="w-full max-w-3xl p-4">
        {isAuthenticated ? (
          <UserProfile />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Sign in required</h2>
            <p className="text-gray-600 mb-4">
              Sign in with your Farcaster account to view your profile.
            </p>
            <button
              onClick={signIn}
              className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
            >
              Sign in with Farcaster
            </button>
          </div>
        )}

        {/* Temporarily add this for testing */}
        <div className="mt-4">
          <AuthStatus />
        </div>
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
