// components/bookmark/BookmarkButton.tsx
import { useState } from "react";
import { FiBookmark } from "react-icons/fi";
import { useUser } from "../../context/UserContext";
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
  const { showAuthPrompt } = useUser();
  const [showForm, setShowForm] = useState(false);

  const handleClick = async () => {
    const isAuth = await showAuthPrompt();
    if (isAuth) {
      setShowForm(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
        aria-label="Bookmark"
      >
        <FiBookmark size={20} className="text-purple-600" />
      </button>

      {showForm && (
        <BookmarkForm castData={castData} onClose={() => setShowForm(false)} />
      )}
    </>
  );
}
