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
    authorUsername?: string;
    authorDisplayName?: string;
    authorPfpUrl?: string;
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
    if (isSaving || saveSuccess) return;

    if (!dbUser) {
      const isAuth = await showAuthPrompt();
      if (!isAuth) return;
    }

    setIsSaving(true);

    try {
      await addBookmark({
        user_id: dbUser!.id,
        cast_hash: castData.hash,
        cast_author_fid: castData.authorFid,
        cast_author_username: castData.authorUsername || null,
        cast_author_display_name: castData.authorDisplayName || null,
        cast_author_pfp_url: castData.authorPfpUrl || null,
        cast_text: castData.text,
        cast_url: castData.url,
        is_public: true,
        note: "",
        tags: [],
      });

      try {
        await sendNotification({
          title: "Saved! 🎉",
          body: "Cast added to your collection",
        });
      } catch (error) {
        console.error("Failed to send notification:", error);
      }

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

  const getIcon = () => {
    if (isSaving) return <FiLoader className="animate-spin" />;
    if (saveSuccess) return <FiCheck />;
    return <FiBookmark />;
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`
          p-3 
          rounded-lg 
          border-4 
          border-black 
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          active:shadow-none
          transition-all
          ${saveSuccess ? "bg-green-400" : isSaving ? "bg-yellow-300" : "bg-purple-400"}
          hover:translate-x-[2px] 
          hover:translate-y-[2px]
          active:translate-x-[4px] 
          active:translate-y-[4px]
        `}
        aria-label="Save cast"
      >
        <div className="text-black">{getIcon()}</div>
      </button>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className={`
        flex items-center gap-2
        px-4 py-2
        rounded-lg 
        border-4 
        border-black 
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
        hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
        active:shadow-none
        transition-all
        ${saveSuccess ? "bg-green-400" : isSaving ? "bg-yellow-300" : "bg-purple-400"}
        hover:translate-x-[2px] 
        hover:translate-y-[2px]
        active:translate-x-[4px] 
        active:translate-y-[4px]
      `}
      aria-label="Save cast"
    >
      <div className="text-black">{getIcon()}</div>
      <span className="font-bold text-black">
        {saveSuccess ? "Saved!" : isSaving ? "Saving..." : "Save Cast"}
      </span>
    </button>
  );
}
