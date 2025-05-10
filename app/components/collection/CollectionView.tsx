// components/collection/CollectionView.tsx
import { useState } from "react";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { Collection, Bookmark } from "@/lib/supabase";
import { FiShare2, FiEdit, FiBookmark } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import SimpleAttestation from "@/components/onchain/SimpleAttestation";

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
  const composeCast = useComposeCast();
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await composeCast({
        text: `Check out my "${collection.name}" collection on Castmark!${collection.description ? "\n\n" + collection.description : ""}`,
        embeds: [`${process.env.NEXT_PUBLIC_URL}/collections/${collection.id}`],
      });
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error("Error sharing collection:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
              className={`p-2 rounded-full ${
                shareSuccess
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600"
              }`}
              aria-label="Share collection"
            >
              {shareSuccess ? <FiCheck size={20} /> : <FiShare2 size={20} />}
            </button>

            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600"
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

        <SimpleAttestation collection={collection} />
      </div>

      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            <FiBookmark className="inline mr-2" />
            Bookmarks ({bookmarks.length})
          </h2>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600">This collection is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-all"
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
                  <div className="mt-2 text-sm text-gray-600 p-2 bg-gray-50 rounded">
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
