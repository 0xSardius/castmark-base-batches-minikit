// components/bookmark/BookmarkCard.tsx
import { Bookmark } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { FiTrash2, FiEdit, FiTag } from "react-icons/fi";
import { useBookmarkStore } from "../../stores/bookmarkStore";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
}

export default function BookmarkCard({ bookmark, onEdit }: BookmarkCardProps) {
  const { deleteBookmark } = useBookmarkStore();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this bookmark?")) {
      await deleteBookmark(bookmark.id);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <a
            href={bookmark.cast_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium hover:text-purple-600 transition-colors"
          >
            {bookmark.cast_text
              ? bookmark.cast_text.length > 100
                ? `${bookmark.cast_text.substring(0, 100)}...`
                : bookmark.cast_text
              : "Untitled Cast"}
          </a>
          <div className="text-sm text-gray-500 mt-1">
            Saved{" "}
            {formatDistanceToNow(new Date(bookmark.created_at), {
              addSuffix: true,
            })}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit && onEdit(bookmark)}
            className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
            aria-label="Edit bookmark"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            aria-label="Delete bookmark"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {bookmark.note && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md text-gray-700">
          {bookmark.note}
        </div>
      )}

      {bookmark.tags && bookmark.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {bookmark.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
            >
              <FiTag size={12} className="mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
