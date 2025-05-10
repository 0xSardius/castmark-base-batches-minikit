// components/collection/SimpleCollectionView.tsx
import { useEffect } from "react";
import { useCollectionStore } from "@/stores/collectionStore";
import { useUser } from "@/context/UserContext";
import { FiPlus, FiShare2 } from "react-icons/fi";
import { useComposeCast } from "@coinbase/onchainkit/minikit";

export default function SimpleCollectionView() {
  const { dbUser } = useUser();
  const { collections, fetchCollections } = useCollectionStore();
  const composeCast = useComposeCast();

  useEffect(() => {
    if (dbUser?.id) {
      fetchCollections(dbUser.id);
    }
  }, [dbUser, fetchCollections]);

  const handleShare = async (collectionId: string, name: string) => {
    try {
      await composeCast({
        text: `Check out my "${name}" collection on Castmark!`,
        embeds: [`${process.env.NEXT_PUBLIC_URL}/collections/${collectionId}`],
      });
    } catch (error) {
      console.error("Error sharing collection:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Collections</h2>
        <button className="flex items-center text-sm bg-purple-600 text-white px-3 py-1.5 rounded-md">
          <FiPlus size={16} className="mr-1" /> New
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center p-6 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600 mb-2">
            You haven&apos;t created any collections yet
          </p>
          <p className="text-sm text-gray-500">
            Collections help you organize your bookmarks
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{collection.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {/* Show bookmark count when we have it */}0 bookmarks
                  </p>
                </div>
                <button
                  onClick={() => handleShare(collection.id, collection.name)}
                  className="p-1.5 text-gray-500 hover:text-purple-600 rounded-full hover:bg-gray-100"
                >
                  <FiShare2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
