"use client";

import { useEffect, useState } from "react";
import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import { useUser } from "@/context/UserContext";
import { FiBookmark, FiFolder, FiPlus, FiShare2 } from "react-icons/fi";
import AuthHeader from "@/components/auth/AuthHeader";

export default function Home() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const { signIn, isAuthenticated, loading: userLoading } = useUser();
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the frame and handle loading state
  useEffect(() => {
    const initializeFrame = async () => {
      try {
        console.log("Initializing frame...", { isFrameReady, userLoading });

        if (!isFrameReady) {
          console.log("Setting frame ready...");
          setFrameReady();
        }
      } catch (error) {
        console.error("Error initializing frame:", error);
      } finally {
        console.log("Frame initialization complete");
        setIsLoading(false);
      }
    };

    initializeFrame();
  }, [isFrameReady, setFrameReady, userLoading]);

  // Debug logging for state changes
  useEffect(() => {
    console.log("State changed:", {
      isFrameReady,
      isLoading,
      userLoading,
      isAuthenticated,
      hasContext: !!context,
    });
  }, [isFrameReady, isLoading, userLoading, isAuthenticated, context]);

  // Show loading state while initializing
  if (isLoading || !isFrameReady || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-sm text-gray-500">Loading Castmark...</p>
        </div>
      </div>
    );
  }

  const handleAddFrame = async () => {
    const result = await addFrame();
    if (result) {
      console.log("Frame added:", result.url, result.token);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center pb-16">
      <header className="w-full max-w-3xl flex items-center justify-between p-4 border-b-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-xl font-black">Castmark</h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {context?.client?.added ? (
            <span className="text-sm bg-green-200 border-4 border-black rounded-lg px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ✓ App saved
            </span>
          ) : (
            <button
              onClick={handleAddFrame}
              className="px-4 py-2 text-sm border-4 border-black bg-yellow-300 rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:shadow-none transition-all"
            >
              Save App
            </button>
          )}
          <AuthHeader />
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="w-full max-w-3xl p-6 flex flex-col items-center text-center mt-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
          <h2 className="text-2xl font-bold mb-4">Welcome to Castmark</h2>
          <p className="text-gray-600 mb-6 max-w-lg">
            Save, organize, and share your favorite Farcaster content with the
            community.
          </p>
          <button
            onClick={signIn}
            className="px-6 py-4 rounded-lg border-4 border-black bg-purple-400 text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]"
          >
            Sign in with Farcaster
          </button>
          <div className="grid grid-cols-2 gap-6 mt-12 max-w-md">
            <FeatureCard
              icon={FiBookmark}
              title="Save Casts"
              description="Bookmark your favorite casts to revisit later"
            />
            <FeatureCard
              icon={FiFolder}
              title="Collections"
              description="Organize bookmarks into themed collections"
            />
            <FeatureCard
              icon={FiPlus}
              title="Collaborate"
              description="Build collections with friends"
            />
            <FeatureCard
              icon={FiShare2}
              title="Share"
              description="Share collections with your network"
            />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-3xl p-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickActionCard
                title="View Bookmarks"
                description="Access your saved casts"
                icon={FiBookmark}
                href="/bookmarks"
                color="bg-blue-50 text-blue-600"
              />
              <QuickActionCard
                title="View Collections"
                description="Browse your organized content"
                icon={FiFolder}
                href="/collections"
                color="bg-purple-50 text-purple-600"
              />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Activity Feed</h2>
            <div className="border-4 border-black rounded-lg p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
              <p className="text-gray-600 mb-2">
                Your activity feed will appear here
              </p>
              <p className="text-sm text-gray-500">
                Start bookmarking and collecting to see updates
              </p>
            </div>
          </div>
        </div>
      )}

      <footer className="w-full max-w-3xl mt-auto border-t-4 border-black p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
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

// Feature card component for the landing page
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="border-4 border-black rounded-lg p-6 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
      <div className="p-4 rounded-full bg-yellow-300 mb-4 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <Icon size={32} className="text-black" />
      </div>
      <h3 className="font-bold mb-2 text-lg text-black">{title}</h3>
      <p className="text-sm text-gray-700 text-center font-medium">
        {description}
      </p>
    </div>
  );
}

// Quick action card component for the dashboard
function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}) {
  return (
    <a
      href={href}
      className="border-4 border-black rounded-lg p-6 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] w-full max-w-xs mx-auto min-h-[160px]"
    >
      <div
        className={`p-4 rounded-full ${color} mb-4 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
      >
        <Icon size={32} className="text-black" />
      </div>
      <h3 className="font-bold text-black text-lg mb-1 text-center">{title}</h3>
      <p className="text-sm text-gray-700 font-medium text-center">
        {description}
      </p>
    </a>
  );
}
