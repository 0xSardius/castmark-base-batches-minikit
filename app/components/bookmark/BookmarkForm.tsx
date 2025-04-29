// components/bookmark/BookmarkForm.tsx
import { useState } from "react";
import { Bookmark } from "@/lib/supabase";
import { useBookmarkStore } from "../../stores/bookmarkStore";
import { FiX, FiPlusCircle } from "react-icons/fi";
import { useUser } from "../../context/UserContext";

interface BookmarkFormProps {
  existingBookmark?: Bookmark;
  castData?: {
    hash: string;
    authorFid: number;
    text: string;
    url: string;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookmarkForm({
  existingBookmark,
  castData,
  onClose,
  onSuccess,
}: BookmarkFormProps) {
  const { dbUser } = useUser();
  const { addBookmark, updateBookmark } = useBookmarkStore();

  const [note, setNote] = useState(existingBookmark?.note || "");
  const [isPublic, setIsPublic] = useState(
    existingBookmark?.is_public !== false,
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(existingBookmark?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!existingBookmark;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUser) return;

    setIsSubmitting(true);

    try {
      if (isEditing && existingBookmark) {
        await updateBookmark(existingBookmark.id, {
          note,
          tags,
          is_public: isPublic,
        });
      } else if (castData) {
        await addBookmark({
          user_id: dbUser.id,
          cast_hash: castData.hash,
          cast_author_fid: castData.authorFid,
          cast_text: castData.text,
          cast_url: castData.url,
          note,
          tags,
          is_public: isPublic,
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving bookmark:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditing ? "Edit Bookmark" : "Save Cast"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Cast preview (for new bookmarks) */}
          {!isEditing && castData && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-gray-700 line-clamp-3">
                {castData.text || "No text content"}
              </p>
            </div>
          )}

          {/* Add note */}
          <div className="mb-4">
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Add a note (optional)
            </label>
            <textarea
              id="note"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Why is this cast important to you?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Add tags */}
          <div className="mb-4">
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Add tags (optional)
            </label>
            <div className="flex">
              <input
                id="tags"
                type="text"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="flex items-center justify-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-100 rounded-r-md hover:bg-gray-200"
                onClick={handleAddTag}
              >
                <FiPlusCircle size={20} />
              </button>
            </div>

            {/* Tag list */}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1.5 text-purple-600 hover:text-purple-900"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility option */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
              />
              <span className="ml-2 text-sm text-gray-700">
                Make this bookmark public
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 rounded-md text-white hover:bg-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
