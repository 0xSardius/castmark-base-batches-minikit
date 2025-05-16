"use client";

import { useEffect, useState } from "react";
import { useMiniKit, useOpenUrl } from "@coinbase/onchainkit/minikit";
import { FiArrowLeft, FiShare2, FiEdit, FiPlus, FiX } from "react-icons/fi";
import { useCollectionStore } from "@/stores/collectionStore";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useUser } from "@/context/UserContext";
import BookmarkCard from "@/components/bookmark/BookmarkCard";
// import BookmarkForm from "~/components/bookmark/BookmarkForm";
import CollectionForm from "@/components/collection/CollectionForm";
import RegisterButton from "@/components/collection/RegisterButton";
import WalletConnectButton from "@/components/auth/WalletConnectButton";
import { formatDistanceToNow } from "date-fns";

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

export default function CollectionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const openUrl = useOpenUrl();
  const { dbUser } = useUser();

  const {
    selectedCollection,
    collectionItems,
    loading,
    error,
    fetchCollectionItems,
    selectCollection,
    fetchCollections,
  } = useCollectionStore();

  const { bookmarks, fetchBookmarks } = useBookmarkStore();

  const [editingCollection, setEditingCollection] = useState(false);
  const [addingBookmark, setAddingBookmark] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Initialize the frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  // Fetch collection and bookmarks
  useEffect(() => {
    if (dbUser?.id && params.id) {
      fetchCollections(dbUser.id).then(() => {
        // After collections are fetched, set the selected collection
        const collection = useCollectionStore
          .getState()
          .collections.find((c) => c.id === params.id);
        if (collection) {
          selectCollection(collection);
          fetchCollectionItems(params.id);
        }
      });

      fetchBookmarks(dbUser.id);
    }
  }, [
    dbUser,
    params.id,
    fetchCollections,
    fetchCollectionItems,
    fetchBookmarks,
    selectCollection,
  ]);

  // Filter bookmarks to only those in this collection
  const collectionBookmarks = bookmarks.filter((bookmark) =>
    collectionItems.some((item) => item.bookmark_id === bookmark.id),
  );

  // Show loading state
  if (loading && !selectedCollection) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-gray-600">Loading collection...</div>
      </div>
    );
  }

  // Show error state
  if (error || !selectedCollection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Collection not found</h2>
        <p className="text-gray-600 mb-4">
          The collection you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access to it.
        </p>
        <button
          onClick={() => (window.location.href = "/collections")}
          className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
        >
          View Your Collections
        </button>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50">
      <header className="w-full max-w-3xl flex items-center justify-between p-4 border-b-4 border-black bg-white">
        <div className="flex items-center">
          <button
            onClick={() => (window.location.href = "/collections")}
            className="mr-4 p-2 rounded-lg border-4 border-black bg-white hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] transition-all text-xl"
            aria-label="Go back"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-wide border-4 border-black rounded-lg px-3 py-1 bg-white shadow-[4px_4px_0_0_#000] text-center select-none">
              {selectedCollection.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Created{" "}
              {formatDistanceToNow(new Date(selectedCollection.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              // Create a Frame URL for better sharing in Farcaster
              const frameUrl = `${process.env.NEXT_PUBLIC_URL || window.location.origin}/api/frames/collection/${selectedCollection.id}`;

              // Create a compose URL for Warpcast with the frame URL embedded
              const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(`Check out my "${selectedCollection.name}" collection on Castmark!`)}&embeds[]=${encodeURIComponent(frameUrl)}`;

              // First try using openUrl from MiniKit
              try {
                openUrl(shareUrl);
              } catch (error) {
                console.error("Error using openUrl:", error);

                // Fallback: Try opening in a new window/tab
                try {
                  window.open(shareUrl, "_blank");
                } catch (windowError) {
                  console.error("Error opening window:", windowError);

                  // Last resort: Show modal with copy option
                  setShowShareModal(true);
                }
              }
            }}
            className="p-2 border-4 border-black rounded-lg text-gray-600 hover:text-purple-600 bg-white shadow-[2px_2px_0_0_#000] hover:shadow-none active:shadow-none transition-all"
            aria-label="Share collection"
          >
            <FiShare2 size={20} />
          </button>
          <button
            onClick={() => setEditingCollection(true)}
            className="p-2 border-4 border-black rounded-lg text-gray-600 hover:text-purple-600 bg-white shadow-[2px_2px_0_0_#000] hover:shadow-none active:shadow-none transition-all"
            aria-label="Edit collection"
          >
            <FiEdit size={20} />
          </button>
        </div>
      </header>

      {selectedCollection.description && (
        <div className="w-full max-w-3xl p-4 bg-gray-50 border-b-4 border-black">
          <p className="text-gray-700 font-medium">
            {selectedCollection.description}
          </p>
        </div>
      )}

      {/* Share and Register Buttons */}
      <div className="flex justify-end gap-6 mb-6 mt-4 w-full max-w-3xl p-2">
        <WalletConnectButton />
        <RegisterButton collection={selectedCollection} />
        <button
          onClick={() => {
            // Create a Frame URL for better sharing in Farcaster
            const frameUrl = `${process.env.NEXT_PUBLIC_URL || window.location.origin}/api/frames/collection/${selectedCollection.id}`;

            // Create a compose URL for Warpcast with the frame URL embedded
            const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(`Check out my "${selectedCollection.name}" collection on Castmark!`)}&embeds[]=${encodeURIComponent(frameUrl)}`;

            // First try using openUrl from MiniKit
            try {
              openUrl(shareUrl);
            } catch (error) {
              console.error("Error using openUrl:", error);

              // Fallback: Try opening in a new window/tab
              try {
                window.open(shareUrl, "_blank");
              } catch (windowError) {
                console.error("Error opening window:", windowError);

                // Last resort: Show modal with copy option
                setShowShareModal(true);
              }
            }
          }}
          className="flex items-center gap-2 px-5 py-2 bg-purple-400 text-black font-black rounded-lg border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] active:shadow-none transition-all text-lg"
        >
          <FiShare2 /> Share
        </button>
      </div>
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-4 border-black shadow-[4px_4px_0_0_#000]">
            <h2 className="text-xl font-black mb-4">Share Collection</h2>
            <p className="mb-4">
              Choose how you want to share your collection:
            </p>
            <div className="flex flex-col gap-4 mb-4">
              <button
                onClick={() => {
                  // Create a Frame URL for better sharing in Farcaster
                  const frameUrl = `${process.env.NEXT_PUBLIC_URL || window.location.origin}/api/frames/collection/${selectedCollection.id}`;

                  // Create a compose URL for Warpcast with the frame URL embedded
                  const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(`Check out my "${selectedCollection.name}" collection on Castmark!`)}&embeds[]=${encodeURIComponent(frameUrl)}`;

                  // First try using openUrl from MiniKit
                  try {
                    openUrl(shareUrl);
                    setShowShareModal(false);
                  } catch (error) {
                    console.error("Error using openUrl:", error);

                    // Fallback: Try opening in a new window/tab
                    try {
                      window.open(shareUrl, "_blank");
                      setShowShareModal(false);
                    } catch (windowError) {
                      console.error("Error opening window:", windowError);

                      // Last resort: Copy the collection URL to clipboard
                      navigator.clipboard
                        .writeText(shareUrl)
                        .then(() => {
                          alert(
                            "Collection URL copied to clipboard! You can paste it in Warpcast to share.",
                          );
                          setShowShareModal(false);
                        })
                        .catch((clipboardError) => {
                          console.error(
                            "Error copying to clipboard:",
                            clipboardError,
                          );
                          alert(
                            "Could not share automatically. Please copy this URL manually: " +
                              shareUrl,
                          );
                        });
                    }
                  }
                }}
                className="w-full py-4 bg-purple-400 text-black font-black rounded-lg border-4 border-black shadow-[2px_2px_0_0_#000] hover:shadow-none transition-all text-lg flex items-center justify-center gap-2"
              >
                <FiShare2 size={24} /> Share to Farcaster
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg border-4 border-black font-bold hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6 w-full max-w-3xl">
        <h2 className="text-lg font-black tracking-wide border-4 border-black rounded-lg px-3 py-1 bg-white shadow-[2px_2px_0_0_#000] select-none">
          Bookmarks ({collectionBookmarks.length})
        </h2>
        <button
          onClick={() => setAddingBookmark(true)}
          className="flex items-center px-4 py-2 text-sm bg-purple-400 rounded-lg text-black border-4 border-black font-black shadow-[2px_2px_0_0_#000] hover:shadow-none active:shadow-none transition-all gap-2"
        >
          <FiPlus size={16} className="mr-1" /> Add Bookmark
        </button>
      </div>

      {collectionBookmarks.length === 0 ? (
        <div className="text-center p-8 border-4 border-dashed border-black rounded-lg bg-white shadow-[4px_4px_0_0_#000]">
          <p className="text-gray-600 mb-4">This collection is empty.</p>
          <button
            onClick={() => setAddingBookmark(true)}
            className="px-6 py-3 bg-purple-400 text-black border-4 border-black rounded-lg font-black uppercase shadow-[2px_2px_0_0_#000] hover:shadow-none active:shadow-none transition-all"
          >
            Add your first bookmark
          </button>
        </div>
      ) : (
        <div className="space-y-4 w-full max-w-md mx-auto">
          {collectionBookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      )}

      {/* Edit Collection Modal */}
      {editingCollection && (
        <CollectionForm
          existingCollection={selectedCollection}
          onClose={() => setEditingCollection(false)}
          onSuccess={() => {
            fetchCollections(dbUser?.id || "");
            const updatedCollection = useCollectionStore
              .getState()
              .collections.find((c) => c.id === params.id);
            if (updatedCollection) {
              selectCollection(updatedCollection);
            }
          }}
        />
      )}

      {/* Add Bookmark to Collection Modal */}
      {addingBookmark && (
        <AddToCollectionModal
          collectionId={selectedCollection.id}
          onClose={() => setAddingBookmark(false)}
          onSuccess={() => fetchCollectionItems(selectedCollection.id)}
        />
      )}
    </main>
  );
}

// Component to select bookmarks to add to collection
function AddToCollectionModal({
  collectionId,
  onClose,
  onSuccess,
}: {
  collectionId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { dbUser } = useUser();
  const { bookmarks } = useBookmarkStore();
  const { collectionItems, addToCollection } = useCollectionStore();

  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out bookmarks already in the collection
  const availableBookmarks = bookmarks.filter(
    (bookmark) =>
      !collectionItems.some((item) => item.bookmark_id === bookmark.id),
  );

  const handleToggleBookmark = (bookmarkId: string) => {
    if (selectedBookmarks.includes(bookmarkId)) {
      setSelectedBookmarks(selectedBookmarks.filter((id) => id !== bookmarkId));
    } else {
      setSelectedBookmarks([...selectedBookmarks, bookmarkId]);
    }
  };

  const handleSubmit = async () => {
    if (!dbUser?.id || selectedBookmarks.length === 0) return;

    setIsSubmitting(true);

    try {
      // Add each selected bookmark to the collection
      for (const bookmarkId of selectedBookmarks) {
        await addToCollection(collectionId, bookmarkId, dbUser.id);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding bookmarks to collection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Bookmarks to Collection</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        {availableBookmarks.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-gray-600">
              You don&apos;t have any bookmarks to add to this collection.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-grow mb-4">
              {availableBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className={`border p-3 mb-2 rounded-md cursor-pointer ${
                    selectedBookmarks.includes(bookmark.id)
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleToggleBookmark(bookmark.id)}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedBookmarks.includes(bookmark.id)}
                      onChange={() => handleToggleBookmark(bookmark.id)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium">
                        {bookmark.cast_text
                          ? bookmark.cast_text.length > 80
                            ? `${bookmark.cast_text.substring(0, 80)}...`
                            : bookmark.cast_text
                          : "Untitled Cast"}
                      </p>
                      {bookmark.note && (
                        <p className="text-xs text-gray-500 mt-1">
                          {bookmark.note.length > 60
                            ? `${bookmark.note.substring(0, 60)}...`
                            : bookmark.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-purple-600 rounded-md text-white hover:bg-purple-700"
                disabled={isSubmitting || selectedBookmarks.length === 0}
              >
                {isSubmitting
                  ? "Adding..."
                  : `Add ${selectedBookmarks.length} Bookmark${selectedBookmarks.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
