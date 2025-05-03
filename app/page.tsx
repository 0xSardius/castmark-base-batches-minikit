// app/page.tsx (updated)
"use client";

import { useEffect } from "react";
import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import { useUser } from "@/context/UserContext";
import { FiBookmark, FiFolder, FiPlus, FiShare2 } from "react-icons/fi";

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
    <main className="flex min-h-screen flex-col items-center pb-16">
      <header className="w-full max-w-3xl flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-purple-600">Castmark</h1>
          <p className="text-sm text-gray-500 ml-2">Save what matters</p>
        </div>
        <div className="flex items-center space-x-4">
          {context?.client?.added ? (
            <span className="text-sm text-green-500">✓ App saved</span>
          ) : (
            <button
              onClick={handleAddFrame}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Save App
            </button>
          )}
          {isAuthenticated ? (
            <div className="text-sm bg-purple-100 px-2 py-1 rounded-md">
              Signed in
            </div>
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

      {!isAuthenticated ? (
        <div className="w-full max-w-3xl p-6 flex flex-col items-center text-center mt-8">
          <h2 className="text-2xl font-bold mb-4">Welcome to Castmark</h2>
          <p className="text-gray-600 mb-6 max-w-lg">
            Save, organize, and share your favorite Farcaster content with the
            community.
          </p>
          <button
            onClick={signIn}
            className="px-6 py-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 font-medium"
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
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
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center">
      <div className="p-3 rounded-full bg-purple-100 mb-3">
        <Icon size={20} className="text-purple-600" />
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-xs text-gray-600 text-center">{description}</p>
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
      className="border border-gray-200 rounded-lg p-4 flex items-center hover:shadow-md transition-shadow"
    >
      <div className={`p-3 rounded-full ${color} mr-4`}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </a>
  );
}
