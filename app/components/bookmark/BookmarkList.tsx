// components/bookmark/BookmarksList.tsx
import { useEffect, useState, useRef } from "react";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useUser } from "@/context/UserContext";
import { FiFolder, FiTag } from "react-icons/fi";
import Loading from "@/components/ui/loading";
import BookmarkCard from "@/components/bookmark/BookmarkCard";
import BookmarkForm from "./BookmarkForm";
import { Bookmark } from "@/lib/supabase";

export default function BookmarksList() {
  const { dbUser, loading: userLoading } = useUser();
  const { bookmarks, loading, fetchBookmarks } = useBookmarkStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (dbUser?.id && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchBookmarks(dbUser.id);
    }
  }, [dbUser, fetchBookmarks]);

  // Extract all unique tags from bookmarks
  const allTags = Array.from(
    new Set(
      bookmarks.flatMap((bookmark) => bookmark.tags || []).filter(Boolean),
    ),
  );

  // Filter bookmarks by selected tag
  const filteredBookmarks = selectedTag
    ? bookmarks.filter((bookmark) => bookmark.tags?.includes(selectedTag))
    : bookmarks;

  if (userLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-4 w-full">
        <button
          onClick={() => setShowTagFilter((prev) => !prev)}
          className="flex items-center bg-yellow-300 text-black px-4 py-2 border-4 border-black rounded-lg font-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] active:shadow-none transition-all gap-2 w-full sm:w-auto justify-center select-none"
        >
          <FiTag size={20} /> Sort by Tag
        </button>
        <a
          href="/collections"
          className="flex items-center text-base bg-purple-400 text-white px-5 py-2 border-4 border-black rounded-lg font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:shadow-none transition-all gap-2 w-full sm:w-auto justify-center"
        >
          <FiFolder size={20} /> Collections
        </a>
      </div>

      {showTagFilter && allTags.length > 0 && (
        <div className="mb-4 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            <button
              className={`whitespace-nowrap px-3 py-1 rounded-full text-sm ${
                selectedTag === null
                  ? "bg-purple-400 text-black border-4 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-black border-4 border-black font-bold hover:bg-purple-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
              onClick={() => setSelectedTag(null)}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-sm border-4 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  selectedTag === tag
                    ? "bg-purple-400 text-black"
                    : "bg-white text-black hover:bg-purple-100"
                }`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredBookmarks.length === 0 ? (
        <div className="text-center p-8 border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
          <p className="text-gray-600 mb-2">
            You don&apos;t have any bookmarks yet
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Start saving casts that matter to you
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-purple-400 text-black border-4 border-black rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:shadow-none transition-all"
          >
            Discover Casts
          </a>
        </div>
      ) : (
        <div className="space-y-6 w-full max-w-md mx-auto">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="border-4 border-black rounded-lg p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full"
            >
              <BookmarkCard bookmark={bookmark} onEdit={setEditingBookmark} />

              {/* Tag display */}
              {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {bookmark.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-300 text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editingBookmark && (
        <BookmarkForm
          existingBookmark={editingBookmark}
          onClose={() => setEditingBookmark(null)}
          onSuccess={() => {
            setEditingBookmark(null);
            hasFetchedRef.current = false; // Reset the fetch flag to allow a fresh fetch
            fetchBookmarks(dbUser?.id || "");
          }}
        />
      )}
    </div>
  );
}
