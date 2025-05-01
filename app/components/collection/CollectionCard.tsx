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
    try {
      const shareUrl = `${process.env.NEXT_PUBLIC_URL}/collections/${collection.id}`;
      await openUrl(shareUrl);
    } catch (error) {
      console.error("Error sharing collection:", error);
    }
  };

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect && onSelect(collection)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium hover:text-purple-600 transition-colors">
            {collection.name}
          </h3>
          <div className="text-sm text-gray-500 mt-1">
            Created{" "}
            {formatDistanceToNow(new Date(collection.created_at), {
              addSuffix: true,
            })}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-500 hover:text-green-600 transition-colors"
            aria-label="Share collection"
          >
            <FiShare2 size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit(collection);
            }}
            className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
            aria-label="Edit collection"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            aria-label="Delete collection"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {collection.description && (
        <div className="mt-2 text-gray-700">{collection.description}</div>
      )}

      <div className="mt-3 flex items-center space-x-3">
        {!collection.is_public && (
          <span className="inline-flex items-center text-xs text-gray-600">
            <FiLock size={12} className="mr-1" />
            Private
          </span>
        )}
        {collection.is_collaborative && (
          <span className="inline-flex items-center text-xs text-gray-600">
            <FiUsers size={12} className="mr-1" />
            Collaborative
          </span>
        )}
      </div>
    </div>
  );
}
