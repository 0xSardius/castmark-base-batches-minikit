"use client";

import { useEffect, useState } from "react";
import { useMiniKit, useClose } from "@coinbase/onchainkit/minikit";
import { useUser } from "@/context/UserContext";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useCollectionStore } from "@/stores/collectionStore";
// import Loading from "@/components/ui/Loading";
import { FiCheck, FiFolder, FiX, FiAlertCircle } from "react-icons/fi";
import { sendFrameNotification } from "@/lib/notification-client";

export default function SavePage() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const close = useClose();
  const { showAuthPrompt, dbUser } = useUser();
  const { addBookmark } = useBookmarkStore();
  const { collections, fetchCollections } = useCollectionStore();

  const [isSaving, setIsSaving] = useState(false);
  const [note, setNote] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  // Prompt for authentication if needed
  useEffect(() => {
    const authenticate = async () => {
      if (!dbUser) {
        await showAuthPrompt();
      }
    };

    authenticate();
  }, [dbUser, showAuthPrompt]);

  // Fetch user's collections
  useEffect(() => {
    if (dbUser?.id) {
      fetchCollections(dbUser.id);
    }
  }, [dbUser, fetchCollections]);

  // Extract cast data from context
  const castData =
    context?.location?.type === "cast_embed"
      ? {
          hash: context.location.cast.hash,
          authorFid: context.location.cast.fid,
          text:
            (context.location as unknown as { cast: { text?: string } }).cast
              .text || "",
          url: `https://warpcast.com/~/cast/${context.location.cast.hash}`,
        }
      : {
          // Fallback for testing
          hash: "test-hash",
          authorFid: 123456,
          text: "This is a sample cast for testing",
          url: "https://warpcast.com/~/cast/test-hash",
        };

  const handleSave = async () => {
    if (!dbUser) {
      await showAuthPrompt();
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await addBookmark({
        user_id: dbUser.id,
        cast_hash: castData.hash,
        cast_author_fid: castData.authorFid,
        cast_text: castData.text,
        cast_url: castData.url,
        note: note,
        tags: [],
        is_public: true,
      });

      // Send notification
      if (context?.user?.fid) {
        await sendFrameNotification({
          fid: context.user.fid,
          title: "Cast Saved",
          body: "Your cast has been saved to Castmark",
        });
      }

      setSaveSuccess(true);

      // Close automatically after successful save
      setTimeout(() => {
        close();
      }, 1500);
    } catch (error) {
      console.error("Error saving bookmark:", error);
      setError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCollection = (collectionId: string) => {
    if (selectedCollections.includes(collectionId)) {
      setSelectedCollections(
        selectedCollections.filter((id) => id !== collectionId),
      );
    } else {
      setSelectedCollections([...selectedCollections, collectionId]);
    }
  };

  if (saveSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-green-100 rounded-full p-3 mb-4">
          <FiCheck size={30} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Saved Successfully!</h2>
        <p className="text-gray-600 mb-4">
          Cast has been added to your bookmarks.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Save Cast</h1>
        <button
          onClick={close}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <FiAlertCircle className="text-red-500 mr-2" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
        <p className="text-gray-700 line-clamp-3">
          {castData.text || "No text content"}
        </p>
      </div>

      <div className="mb-4">
        <label
          htmlFor="note"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Add a note (optional)
        </label>
        <textarea
          id="note"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="Why is this cast important to you?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isSaving}
        />
      </div>

      {collections.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FiFolder size={16} className="mr-2" />
            Add to collection (optional)
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {collections.map((collection) => (
              <label
                key={collection.id}
                className={`flex items-center p-2 border rounded-md cursor-pointer ${
                  selectedCollections.includes(collection.id)
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200"
                } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  checked={selectedCollections.includes(collection.id)}
                  onChange={() => toggleCollection(collection.id)}
                  disabled={isSaving}
                />
                <span className="ml-2 text-sm">{collection.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Saving...
            </>
          ) : (
            "Save to Castmark"
          )}
        </button>
      </div>
    </div>
  );
}
