// components/bookmark/BookmarkButton.tsx
import { useState } from "react";
import { FiBookmark, FiCheck, FiLoader } from "react-icons/fi";
import { useUser } from "@/context/UserContext";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useNotification } from "@coinbase/onchainkit/minikit";

interface BookmarkButtonProps {
  castData: {
    hash: string;
    authorFid: number;
    text: string;
    url: string;
  };
  variant?: "default" | "compact";
}

export default function BookmarkButton({
  castData,
  variant = "default",
}: BookmarkButtonProps) {
  const { showAuthPrompt, dbUser } = useUser();
  const { addBookmark } = useBookmarkStore();
  const sendNotification = useNotification();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    // Skip if already saving or success state is showing
    if (isSaving || saveSuccess) return;

    // Check authentication
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

      // Send notification
      try {
        await sendNotification({
          title: "Bookmark Saved!",
          body: `You saved a cast by @${castData.authorFid}`,
        });
      } catch (error) {
        console.error("Failed to send notification:", error);
      }

      // Show success state temporarily
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving bookmark:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Determine icon and state
  const getIcon = () => {
    if (isSaving) return <FiLoader className="animate-spin" />;
    if (saveSuccess) return <FiCheck />;
    return <FiBookmark />;
  };

  // Determine color class based on state
  const getColorClass = () => {
    if (saveSuccess) return "text-green-600";
    return "text-purple-600";
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`p-2 rounded-full hover:bg-gray-100 ${getColorClass()}`}
        aria-label="Save cast"
      >
        {getIcon()}
      </button>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className={`flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-gray-100 ${getColorClass()}`}
      aria-label="Save cast"
    >
      {getIcon()}
      <span className="text-sm font-medium">
        {saveSuccess ? "Saved" : "Save"}
      </span>
    </button>
  );
}
