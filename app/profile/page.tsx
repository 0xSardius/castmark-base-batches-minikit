// app/profile/page.tsx
"use client";

import { useEffect } from "react";
import {
  useMiniKit,
  useClose,
  useAddFrame,
} from "@coinbase/onchainkit/minikit";
import { FiArrowLeft } from "react-icons/fi";
import UserProfile from "@/components/user/UserProfile";
import { useUser } from "@/context/UserContext";
import AuthHeader from "@/components/auth/AuthHeader";

export default function ProfilePage() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const close = useClose();
  const { isAuthenticated, signIn } = useUser();
  const addFrame = useAddFrame();

  // Initialize the frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  const handleAddFrame = async () => {
    const result = await addFrame();
    if (result) {
      console.log("Frame added:", result.url, result.token);
    }
  };

  const handleGoBack = () => {
    window.location.href = "/";
  };

  return (
    <main className="flex min-h-screen flex-col items-center pb-16">
      <header className="w-full max-w-3xl flex items-center justify-between p-4 border-b-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="mr-4 p-2 rounded-lg border-4 border-black bg-white hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] transition-all text-xl"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black">Profile</h1>
        </div>
        <AuthHeader context={context} handleAddFrame={handleAddFrame} />
      </header>

      <div className="w-full max-w-3xl p-4">
        {isAuthenticated ? (
          <UserProfile />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center border-4 border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black mb-2">Sign in required</h2>
            <p className="text-gray-600 mb-4">
              Sign in with your Farcaster account to view your profile.
            </p>
            <button
              onClick={signIn}
              className="px-6 py-3 bg-purple-400 text-black border-4 border-black rounded-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]"
            >
              Sign in with Farcaster
            </button>
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
