"use client";

import { useEffect, useState } from "react";
import { useMiniKit, useNotification } from "@coinbase/onchainkit/minikit";
import { useUser } from "@/context/UserContext";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useCollectionStore } from "@/stores/collectionStore";
// import Loading from "@/components/ui/Loading";
import { FiCheck, FiFolder, FiAlertCircle } from "react-icons/fi";

export default function SavePage() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const sendNotification = useNotification();
  const { showAuthPrompt, dbUser } = useUser();
  const { addBookmark } = useBookmarkStore();
  const { collections, fetchCollections } = useCollectionStore();

  const [isSaving, setIsSaving] = useState(false);
  const [note, setNote] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

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
        tags: tags,
        is_public: true,
      });

      // Update UI state
      setIsSaving(false);
      setSaveSuccess(true);
      await sendNotification({
        title: "Saved! 🎉",
        body: "Cast has been bookmarked",
      });

      // Navigate home after successful save
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error("Error saving bookmark:", error);
      setError("Failed to save. Please try again.");
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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (saveSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
        <div className="bg-green-400 rounded-lg p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <FiCheck size={40} className="text-black mb-4" />
          <h2 className="text-2xl font-black mb-2">Saved Successfully!</h2>
          <p className="text-black font-medium">
            Cast has been added to your bookmarks
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <header className="w-full max-w-md flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Save Cast</h1>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-400 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <FiAlertCircle size={24} className="text-black" />
            <p className="text-black font-bold">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-6 p-4 bg-gray-100 rounded-lg border-4 border-black">
        <p className="text-black font-medium">
          {castData.text || "No text content"}
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="note" className="block font-bold mb-2 text-lg">
          Add a note (optional)
        </label>
        <textarea
          id="note"
          rows={3}
          className="w-full px-4 py-3 border-4 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400"
          placeholder="Why is this cast important to you?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isSaving}
        />
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-3 text-lg flex items-center gap-2">
          <FiFolder size={20} />
          Add to collection (optional)
        </h3>
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {collections.map((collection) => (
            <label
              key={collection.id}
              className={`flex items-center p-3 border-4 border-black rounded-lg cursor-pointer transition-colors ${
                selectedCollections.includes(collection.id)
                  ? "bg-purple-400"
                  : "bg-white hover:bg-purple-100"
              } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                className="w-5 h-5 border-2 border-black rounded checked:bg-black"
                checked={selectedCollections.includes(collection.id)}
                onChange={() => toggleCollection(collection.id)}
                disabled={isSaving}
              />
              <span className="ml-3 font-bold text-black">
                {collection.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="tags" className="block font-bold mb-2 text-lg">
          Add tags (optional)
        </label>
        <div className="flex">
          <input
            id="tags"
            type="text"
            className="flex-grow px-4 py-3 border-4 border-black rounded-l-lg focus:outline-none focus:ring-4 focus:ring-purple-400"
            placeholder="Add a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            disabled={isSaving}
          />
          <button
            type="button"
            className="px-4 py-3 border-4 border-l-0 border-black bg-gray-100 rounded-r-lg hover:bg-gray-200 font-bold"
            onClick={handleAddTag}
            disabled={isSaving}
          >
            +
          </button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border-2 border-black"
              >
                {tag}
                <button
                  type="button"
                  className="ml-1.5 text-purple-600 hover:text-purple-900"
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isSaving}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`
          w-full py-4 rounded-lg border-4 border-black font-bold text-black
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          active:shadow-none
          transition-all
          hover:translate-x-[2px] 
          hover:translate-y-[2px]
          active:translate-x-[4px] 
          active:translate-y-[4px]
          ${isSaving ? "bg-yellow-300" : "bg-purple-400"}
          disabled:opacity-50 
          disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        `}
      >
        {isSaving ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
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
    </main>
  );
}
