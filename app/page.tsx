// app/page.tsx
"use client";

import { useEffect } from "react";
import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import { useUser } from "./context/UserContext";
import BookmarkList from "./components/bookmark/BookmarkList";

export default function Home() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const { signIn, isAuthenticated } = useUser();
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

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

  return (
    <main className="flex min-h-screen flex-col items-center">
      <header className="w-full max-w-3xl flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-purple-600">Castmark</h1>
          <p className="text-sm text-gray-500 ml-2">Save what matters</p>
        </div>
        <div className="flex items-center space-x-4">
          {context?.client?.added ? (
            <span className="text-sm text-gray-500">✓ App saved</span>
          ) : (
            <button
              onClick={handleAddFrame}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Save App
            </button>
          )}
          {isAuthenticated ? (
            <div className="text-sm">Signed in</div>
          ) : (
            <button
              onClick={signIn}
              className="px-3 py-1 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-md"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <div className="w-full max-w-3xl">
        <BookmarkList />
      </div>

      <footer className="w-full max-w-3xl mt-auto border-t border-gray-200 p-4 text-center">
        <button
          onClick={() => openUrl("https://base.org/builderkits/minikit")}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          BUILT ON BASE WITH MINIKIT
        </button>
      </footer>
    </main>
  );
}
