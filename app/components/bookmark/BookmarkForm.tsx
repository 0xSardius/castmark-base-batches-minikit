// components/bookmark/BookmarkForm.tsx
import { useState } from "react";
import { Bookmark } from "@/lib/supabase";
import { useBookmarkStore } from "../../stores/bookmarkStore";
import { FiX, FiPlusCircle } from "react-icons/fi";
import { useUser } from "../../context/UserContext";
import { useNotification } from "@coinbase/onchainkit/minikit";

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
  const sendNotification = useNotification();

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
      let savedBookmark;
      if (isEditing && existingBookmark) {
        savedBookmark = await updateBookmark(existingBookmark.id, {
          note,
          tags,
          is_public: isPublic,
        });
      } else if (castData) {
        savedBookmark = await addBookmark({
          user_id: dbUser.id,
          cast_hash: castData.hash,
          cast_author_fid: castData.authorFid,
          cast_text: castData.text,
          cast_url: castData.url,
          note,
          tags,
          is_public: isPublic,
        });

        // Send notification for new bookmarks
        if (savedBookmark) {
          try {
            await sendNotification({
              title: "Bookmark Saved!",
              body: `You saved a cast${tags.length > 0 ? ` with tags: ${tags.join(", ")}` : ""}`,
            });
          } catch (notifError) {
            console.error("Failed to send notification:", notifError);
          }
        }
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
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-4 border-black shadow-[4px_4px_0_0_#000]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black">
            {isEditing ? "Edit Bookmark" : "Save Cast"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 border-2 border-black rounded-lg p-1 ml-2"
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
              className="w-full px-3 py-2 border-4 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400"
              placeholder="Why is this cast important to you?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Add tags */}
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
              className="flex-grow px-3 py-2 border-4 border-black rounded-l-lg focus:outline-none focus:ring-4 focus:ring-purple-400"
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="flex items-center justify-center px-3 py-2 border-4 border-l-0 border-black bg-gray-100 rounded-r-lg hover:bg-gray-200"
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
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-300 text-black border-4 border-black shadow-[2px_2px_0_0_#000]"
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

          {/* Visibility option */}
          <label className="flex items-center mt-4 mb-6 p-3 border-4 border-black rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
            <input
              type="checkbox"
              className="w-5 h-5 border-2 border-black rounded checked:bg-purple-400"
              checked={isPublic}
              onChange={() => setIsPublic(!isPublic)}
            />
            <span className="font-bold ml-3">Make this bookmark public</span>
          </label>

          {/* Action buttons */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 rounded-lg border-4 border-black font-bold shadow-[2px_2px_0_0_#000] hover:shadow-none active:shadow-none transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-purple-400 rounded-lg border-4 border-black font-bold shadow-[2px_2px_0_0_#000] hover:shadow-none active:shadow-none transition-all"
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
