import { useEffect, useState } from "react";
import { useBookmarkStore } from "../../stores/bookmarkStore";
import { useUser } from "../../context/UserContext";
import { Bookmark } from "@/lib/supabase";
import BookmarkCard from "./BookmarkCard";
import BookmarkForm from "./BookmarkForm";
import { FiPlusCircle } from "react-icons/fi";

export default function BookmarkList() {
  const { dbUser, isAuthenticated, showAuthPrompt } = useUser();
  const { bookmarks, loading, error, fetchBookmarks } = useBookmarkStore();
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [castData, setCastData] = useState<{
    hash: string;
    authorFid: number;
    text: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    if (dbUser?.id) {
      fetchBookmarks(dbUser.id);
    }
  }, [dbUser, fetchBookmarks]);

  const handleAddBookmark = async () => {
    const isAuth = await showAuthPrompt();
    if (!isAuth) return;

    // In a real implementation, we would get this data from the SDK or API
    setCastData({
      hash: "samplehash123",
      authorFid: 123456,
      text: "This is a sample cast that we want to bookmark.",
      url: "https://warpcast.com/~/cast/samplehash123",
    });
    setShowAddForm(true);
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
  };

  const handleCloseForm = () => {
    setEditingBookmark(null);
    setShowAddForm(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">
          Sign in to view your bookmarks
        </h2>
        <p className="text-gray-600 mb-4">
          Sign in with your Farcaster account to save and manage your bookmarks.
        </p>
        <button
          onClick={() => showAuthPrompt()}
          className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
        >
          Sign in with Farcaster
        </button>
      </div>
    );
  }

  if (loading && bookmarks.length === 0) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-pulse text-gray-600">Loading bookmarks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Bookmarks</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAddBookmark}
            className="flex items-center px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
          >
            <FiPlusCircle size={18} className="mr-2" />
            Add Bookmark
          </button>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600 mb-4">
            You haven&apos;t saved any bookmarks yet.
          </p>
          <button
            onClick={handleAddBookmark}
            className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
          >
            Add your first bookmark
          </button>
        </div>
      ) : (
        <div>
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={handleEditBookmark}
            />
          ))}
        </div>
      )}

      {editingBookmark && (
        <BookmarkForm
          existingBookmark={editingBookmark}
          onClose={handleCloseForm}
          onSuccess={() => fetchBookmarks(dbUser?.id || "")}
        />
      )}

      {showAddForm && castData && (
        <BookmarkForm
          castData={castData}
          onClose={handleCloseForm}
          onSuccess={() => fetchBookmarks(dbUser?.id || "")}
        />
      )}
    </div>
  );
}
