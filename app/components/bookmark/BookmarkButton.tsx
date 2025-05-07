// components/bookmark/BookmarkButton.tsx (refined version)
import { useState } from "react";
import { FiBookmark, FiCheck, FiLoader } from "react-icons/fi";
import { useUser } from "@/context/UserContext";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import BookmarkForm from "@/components/bookmark/BookmarkForm";
import { useNotification } from "@coinbase/onchainkit/minikit";

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
  const sendNotification = useNotification();

  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleQuickSave = async () => {
    if (!dbUser) {
      const isAuth = await showAuthPrompt();
      if (!isAuth) return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

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
      setSaveSuccess(true);

      // Send notification
      try {
        await sendNotification({
          title: "Bookmark Saved!",
          body: `You saved a cast: ${castData.text.substring(0, 60)}${castData.text.length > 60 ? "..." : ""}`,
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }

      // Hide success indicator after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving bookmark:", error);
      alert("Failed to save bookmark. Please try again.");
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
          disabled={isSaving || saveSuccess}
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
          aria-label="Quick Save"
        >
          {isSaving ? (
            <FiLoader size={20} className="text-gray-400 animate-spin" />
          ) : saveSuccess ? (
            <FiCheck size={20} className="text-green-600" />
          ) : (
            <FiBookmark size={20} className="text-purple-600" />
          )}
        </button>
        <button
          onClick={handleShowForm}
          className="text-xs text-gray-500 hover:text-purple-600"
          disabled={isSaving || saveSuccess}
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
