// components/collection/CollectionCard.tsx
import { Collection } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { FiTrash2, FiEdit, FiShare2, FiLock, FiUsers } from "react-icons/fi";
import { useCollectionStore } from "@/stores/collectionStore";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";

interface CollectionCardProps {
  collection: Collection;
  onEdit?: (collection: Collection) => void;
  onSelect?: (collection: Collection) => void;
}

export default function CollectionCard({
  collection,
  onEdit,
  onSelect,
}: CollectionCardProps) {
  const { deleteCollection } = useCollectionStore();
  const openUrl = useOpenUrl();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this collection?")) {
      await deleteCollection(collection.id);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Create a shareable URL for the collection
    const collectionUrl = `${process.env.NEXT_PUBLIC_URL}/collections/${collection.id}`;

    // Create a compose URL for Warpcast with the collection URL embedded
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(`Check out my "${collection.name}" collection on Castmark!`)}&embeds[]=${encodeURIComponent(collectionUrl)}`;

    // First try using openUrl from MiniKit
    try {
      await openUrl(shareUrl);
    } catch (error) {
      console.error("Error using openUrl:", error);

      // Fallback: Try opening in a new window/tab
      try {
        window.open(shareUrl, "_blank");
      } catch (windowError) {
        console.error("Error opening window:", windowError);

        // Last resort: Copy the collection URL to clipboard
        try {
          await navigator.clipboard.writeText(collectionUrl);
          alert(
            "Collection URL copied to clipboard! You can paste it in Warpcast to share.",
          );
        } catch (clipboardError) {
          console.error("Error copying to clipboard:", clipboardError);
          alert(
            "Could not share automatically. Please copy this URL manually: " +
              collectionUrl,
          );
        }
      }
    }
  };

  return (
    <div
      className="border-4 border-black rounded-lg p-4 mb-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] cursor-pointer"
      onClick={() => onSelect && onSelect(collection)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-black hover:text-purple-600 transition-colors">
            {collection.name}
          </h3>
          <div className="text-sm text-gray-500 mt-1 font-bold">
            Created{" "}
            {formatDistanceToNow(new Date(collection.created_at), {
              addSuffix: true,
            })}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-500 hover:text-green-600 transition-colors border-2 border-black rounded-lg hover:bg-green-100 active:translate-x-[2px] active:translate-y-[2px]"
            aria-label="Share collection"
          >
            <FiShare2 size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit(collection);
            }}
            className="p-2 text-gray-500 hover:text-purple-600 transition-colors border-2 border-black rounded-lg hover:bg-purple-100 active:translate-x-[2px] active:translate-y-[2px]"
            aria-label="Edit collection"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors border-2 border-black rounded-lg hover:bg-red-100 active:translate-x-[2px] active:translate-y-[2px]"
            aria-label="Delete collection"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {collection.description && (
        <div className="mt-2 text-gray-700 font-medium">
          {collection.description}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {!collection.is_public && (
          <span className="inline-flex items-center text-xs font-bold text-gray-600 border-2 border-black rounded-lg px-2 py-1">
            <FiLock size={12} className="mr-1" />
            Private
          </span>
        )}
        {collection.is_collaborative && (
          <span className="inline-flex items-center text-xs font-bold text-gray-600 border-2 border-black rounded-lg px-2 py-1">
            <FiUsers size={12} className="mr-1" />
            Collaborative
          </span>
        )}
      </div>
    </div>
  );
}
