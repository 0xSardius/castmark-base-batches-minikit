// components/bookmark/BookmarksList.tsx
import { useEffect, useState } from "react";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useUser } from "@/context/UserContext";
import { Identity, Avatar, Name } from "@coinbase/onchainkit/identity";
import { FiFolder } from "react-icons/fi";
import Loading from "@/components/ui/loading";
import BookmarkCard from "@/components/bookmark/BookmarkCard";

export default function BookmarksList() {
  const { dbUser, loading: userLoading } = useUser();
  const { bookmarks, loading, fetchBookmarks } = useBookmarkStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (dbUser?.id) {
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Your Bookmarks</h1>
        <a
          href="/collections"
          className="flex items-center text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md hover:bg-purple-200"
        >
          <FiFolder size={16} className="mr-1" /> Collections
        </a>
      </div>

      {allTags.length > 0 && (
        <div className="mb-4 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            <button
              className={`whitespace-nowrap px-3 py-1 rounded-full text-sm ${
                selectedTag === null
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedTag(null)}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-sm ${
                  selectedTag === tag
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
        <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600 mb-2">
            You don&apos;t have any bookmarks yet
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Start saving casts that matter to you
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Discover Casts
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((bookmark) => {
            // Generate a proxy address for OnchainKit Identity from FID
            const authorProxyAddress =
              `0x${bookmark.cast_author_fid?.toString(16).padStart(40, "0")}` as `0x${string}`;

            return (
              <div
                key={bookmark.id}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <div className="mb-2">
                  <Identity address={authorProxyAddress}>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2" />
                      <Name className="text-sm font-medium" />
                    </div>
                  </Identity>
                </div>

                <BookmarkCard bookmark={bookmark} />

                {/* Tag display */}
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {bookmark.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border-2 border-black"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
