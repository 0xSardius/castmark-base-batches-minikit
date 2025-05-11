// app/collections/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useMiniKit, useClose, useOpenUrl } from "@coinbase/onchainkit/minikit";
import { FiArrowLeft, FiShare2, FiEdit, FiPlus, FiX } from "react-icons/fi";
import { useCollectionStore } from "@/stores/collectionStore";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useUser } from "@/context/UserContext";
import BookmarkCard from "@/components/bookmark/BookmarkCard";
// import BookmarkForm from "~/components/bookmark/BookmarkForm";
import CollectionForm from "@/components/collection/CollectionForm";
import { formatDistanceToNow } from "date-fns";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import type { Eip1193Provider } from "ethers";

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
  const close = useClose();
  const openUrl = useOpenUrl();
  const { dbUser } = useUser();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

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
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestSuccess, setAttestSuccess] = useState<string | null>(null);
  const [attestError, setAttestError] = useState<string | null>(null);

  // EAS contract address for Base mainnet/testnet
  const EAS_CONTRACT = "0x4200000000000000000000000000000000000021";
  // Example schema UID (replace with your deployed schema UID)
  const COLLECTION_SCHEMA_UID = "0x..."; // TODO: Replace with your schema UID

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
    <main className="flex min-h-screen flex-col items-center">
      <header className="w-full max-w-3xl flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={() => (window.location.href = "/collections")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{selectedCollection.name}</h1>
            <p className="text-sm text-gray-500">
              Created{" "}
              {formatDistanceToNow(new Date(selectedCollection.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 text-gray-600 hover:text-purple-600 rounded-full hover:bg-gray-100"
            aria-label="Share collection"
          >
            <FiShare2 size={20} />
          </button>
          <button
            onClick={() => setEditingCollection(true)}
            className="p-2 text-gray-600 hover:text-purple-600 rounded-full hover:bg-gray-100"
            aria-label="Edit collection"
          >
            <FiEdit size={20} />
          </button>
        </div>
      </header>

      {selectedCollection.description && (
        <div className="w-full max-w-3xl p-4 bg-gray-50 border-b border-gray-200">
          <p className="text-gray-700">{selectedCollection.description}</p>
        </div>
      )}

      <div className="max-w-3xl mx-auto p-4">
        {/* Share Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg shadow hover:bg-purple-700 border-4 border-black transition-all"
          >
            <FiShare2 /> Share
          </button>
        </div>
        {/* Share Modal Placeholder */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full border-4 border-black shadow-lg">
              <h2 className="text-xl font-bold mb-4">Share Collection</h2>
              <p className="mb-4">
                Choose how you want to share your collection:
              </p>
              <div className="flex flex-col gap-4 mb-4">
                <button
                  onClick={() => {
                    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(`Check out my "${selectedCollection.name}" collection on Castmark!`)}&embeds[]=${encodeURIComponent(`${process.env.NEXT_PUBLIC_URL}/collections/${selectedCollection.id}`)}`;
                    openUrl(shareUrl);
                  }}
                  className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg border-2 border-black shadow hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <FiShare2 /> Share to Farcaster
                </button>
                <button
                  onClick={async () => {
                    setIsAttesting(true);
                    setAttestError(null);
                    setAttestSuccess(null);
                    try {
                      if (!address || !walletClient)
                        throw new Error("Connect your wallet");
                      if (!selectedCollection)
                        throw new Error("No collection selected");
                      if (
                        !COLLECTION_SCHEMA_UID ||
                        COLLECTION_SCHEMA_UID === "0x..."
                      )
                        throw new Error("Schema UID not set");

                      // Prepare EAS SDK
                      const eas = new EAS(EAS_CONTRACT);
                      // Get ethers.js signer from walletClient
                      const provider = new ethers.BrowserProvider(
                        window.ethereum as Eip1193Provider,
                      );
                      const signer = await provider.getSigner();
                      eas.connect(signer);

                      // Prepare schema encoder (example: name, description, url, owner)
                      const encoder = new SchemaEncoder(
                        "string name,string description,string url,address owner",
                      );
                      const encodedData = encoder.encodeData([
                        {
                          name: "name",
                          value: selectedCollection.name,
                          type: "string",
                        },
                        {
                          name: "description",
                          value: selectedCollection.description || "",
                          type: "string",
                        },
                        {
                          name: "url",
                          value: `${process.env.NEXT_PUBLIC_URL}/collections/${selectedCollection.id}`,
                          type: "string",
                        },
                        { name: "owner", value: address, type: "address" },
                      ]);

                      // Send attestation
                      const tx = await eas.attest({
                        schema: COLLECTION_SCHEMA_UID,
                        data: {
                          recipient: address,
                          expirationTime: BigInt(0),
                          revocable: true,
                          data: encodedData,
                        },
                      });
                      const attestationUID = await tx.wait();
                      setAttestSuccess(
                        `Attestation successful! UID: ${attestationUID}`,
                      );
                    } catch (err: unknown) {
                      setAttestError(
                        err instanceof Error
                          ? err.message
                          : "Attestation failed",
                      );
                    } finally {
                      setIsAttesting(false);
                    }
                  }}
                  disabled={isAttesting}
                  className={`w-full py-3 bg-green-600 text-white font-bold rounded-lg border-2 border-black shadow hover:bg-green-700 transition-all flex items-center justify-center gap-2 ${isAttesting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isAttesting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Attesting...
                    </>
                  ) : (
                    <>🔗 Make Public Onchain</>
                  )}
                </button>
              </div>
              {attestSuccess && (
                <div className="mb-2 text-green-700 font-bold">
                  {attestSuccess}
                  {/* Link to EAS Explorer */}
                  <a
                    href={`https://explorer.attest.sh/attestation/${attestSuccess.split("UID: ")[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 underline text-blue-700"
                  >
                    View on EAS Explorer
                  </a>
                </div>
              )}
              {attestError && (
                <div className="mb-2 text-red-700 font-bold">{attestError}</div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg border-2 border-black font-bold hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            Bookmarks ({collectionBookmarks.length})
          </h2>
          <button
            onClick={() => setAddingBookmark(true)}
            className="flex items-center px-3 py-1 text-sm bg-purple-600 rounded-md text-white hover:bg-purple-700"
          >
            <FiPlus size={16} className="mr-1" />
            Add Bookmark
          </button>
        </div>

        {collectionBookmarks.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600 mb-4">This collection is empty.</p>
            <button
              onClick={() => setAddingBookmark(true)}
              className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
            >
              Add your first bookmark
            </button>
          </div>
        ) : (
          <div>
            {collectionBookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-4 right-4">
        <button
          onClick={close}
          className="px-4 py-2 bg-gray-200 rounded-full text-gray-700 font-medium shadow-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>

      {/* Edit Collection Modal */}
      {editingCollection && selectedCollection && (
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
