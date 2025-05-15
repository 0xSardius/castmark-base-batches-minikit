// components/collection/CollectionView.tsx
import { useState } from "react";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { Collection, Bookmark } from "@/lib/supabase";
import { FiShare2, FiEdit, FiBookmark, FiCheck } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import CollectionAttestation from "@/components/onchain/CollectionAttestation";

interface CollectionViewProps {
  collection: Collection;
  bookmarks: Bookmark[];
  onEdit?: () => void;
}

export default function CollectionView({
  collection,
  bookmarks,
  onEdit,
}: CollectionViewProps) {
  const openUrl = useOpenUrl();
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
        `Check out my "${collection.name}" collection on Castmark!${collection.description ? "\n\n" + collection.description : ""}`,
      )}&embeds[]=${encodeURIComponent(`${process.env.NEXT_PUBLIC_URL}/collections/${collection.id}`)}`;

      await openUrl(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error("Error sharing collection:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">{collection.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Created{" "}
              {formatDistanceToNow(new Date(collection.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className={`p-2 rounded-lg border-2 border-black ${
                shareSuccess
                  ? "bg-green-400 text-black"
                  : "bg-purple-100 text-black hover:bg-purple-300"
              }`}
              aria-label="Share collection"
            >
              {shareSuccess ? <FiCheck size={20} /> : <FiShare2 size={20} />}
            </button>

            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 rounded-lg border-2 border-black bg-purple-100 text-black hover:bg-purple-300"
                aria-label="Edit collection"
              >
                <FiEdit size={20} />
              </button>
            )}
          </div>
        </div>

        {collection.description && (
          <p className="mt-3 text-gray-700">{collection.description}</p>
        )}

        <CollectionAttestation collection={collection} />
      </div>

      <div className="border-t-4 border-black px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            <FiBookmark className="inline mr-2" />
            Bookmarks ({bookmarks.length})
          </h2>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center p-6 border-4 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600">This collection is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white border-2 border-black rounded-lg p-3 hover:border-purple-500 transition-all"
              >
                <a
                  href={bookmark.cast_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-900 hover:text-purple-600"
                >
                  {bookmark.cast_text
                    ? bookmark.cast_text.length > 100
                      ? `${bookmark.cast_text.substring(0, 100)}...`
                      : bookmark.cast_text
                    : "Untitled Cast"}
                </a>

                {bookmark.note && (
                  <div className="mt-2 text-sm text-gray-600 p-2 bg-gray-50 rounded border border-gray-200">
                    {bookmark.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
