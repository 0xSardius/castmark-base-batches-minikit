// components/bookmark/BookmarkButton.tsx
import { useState } from "react";
import { FiBookmark } from "react-icons/fi";
import { useUser } from "@/context/UserContext";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import BookmarkForm from "./BookmarkForm";

interface BookmarkButtonProps {
  castData: {
    hash: string;
    authorFid: number;
    text: string;
    url: string;
  };
}

export default function BookmarkButton({ castData }: BookmarkButtonProps) {
  const { showAuthPrompt, dbUser } = useUser();
  const { addBookmark } = useBookmarkStore();
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleQuickSave = async () => {
    if (!dbUser) {
      const isAuth = await showAuthPrompt();
      if (!isAuth) return;
    }

    setIsSaving(true);
    try {
      // Quick save without notes or tags
      await addBookmark({
        user_id: dbUser!.id,
        cast_hash: castData.hash,
        cast_author_fid: castData.authorFid,
        cast_text: castData.text,
        cast_url: castData.url,
        is_public: true,
        note: "",
        tags: [],
      });

      // Show success feedback
      alert("Bookmark saved!");
    } catch (error) {
      console.error("Error saving bookmark:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShowForm = async () => {
    const isAuth = await showAuthPrompt();
    if (isAuth) {
      setShowForm(true);
    }
  };

  return (
    <div className="relative inline-block">
      <div className="flex space-x-1">
        <button
          onClick={handleQuickSave}
          disabled={isSaving}
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
          aria-label="Quick Save"
        >
          <FiBookmark
            size={20}
            className={isSaving ? "text-gray-400" : "text-purple-600"}
          />
        </button>
        <button
          onClick={handleShowForm}
          className="text-xs text-gray-500 hover:text-purple-600"
        >
          Add note
        </button>
      </div>

      {showForm && (
        <BookmarkForm castData={castData} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
