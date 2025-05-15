// app/discover/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
// import { useUser } from "@/context/UserContext";
import { Collection } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import CollectionCard from "@/components/collection/CollectionCard";
import { FiTrendingUp } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function DiscoverPage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  //   const { isAuthenticated, showAuthPrompt } = useUser();
  const [trendingCollections, setTrendingCollections] = useState<Collection[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize the frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  // Fetch trending collections
  useEffect(() => {
    const fetchTrendingCollections = async () => {
      setLoading(true);
      try {
        // For now, we'll just fetch public collections
        // In a real implementation, we could order by popularity metrics
        const { data, error } = await supabase
          .from("collections")
          .select("*")
          .eq("is_public", true)
          .order("updated_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setTrendingCollections(data as Collection[]);
      } catch (error) {
        console.error("Error fetching trending collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingCollections();
  }, []);

  const handleCollectionClick = (collection: Collection) => {
    router.push(`/collections/${collection.id}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center pb-16">
      <header className="w-full max-w-3xl p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-sm text-gray-500">
          Find collections and bookmarks from the community
        </p>
      </header>

      <section className="w-full max-w-3xl p-4">
        <div className="flex items-center mb-4">
          <FiTrendingUp size={20} className="text-purple-600 mr-2" />
          <h2 className="text-xl font-semibold">Trending Collections</h2>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 mb-4"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : trendingCollections.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600">No trending collections found.</p>
          </div>
        ) : (
          <div>
            {trendingCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onSelect={handleCollectionClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* Additional sections could be added here, such as:
          - Popular bookmarks
          - Featured curators
          - Collections you might like
      */}
    </main>
  );
}
