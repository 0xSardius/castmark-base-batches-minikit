// components/bookmark/AddToCollectionModal.tsx
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useCollectionStore } from "@/stores/collectionStore";
import { useUser } from "@/context/UserContext";

interface AddToCollectionModalProps {
  bookmarkId: string;
  onClose: () => void;
}

export default function AddToCollectionModal({
  bookmarkId,
  onClose,
}: AddToCollectionModalProps) {
  const { dbUser } = useUser();
  const { collections, fetchCollections, addToCollection } =
    useCollectionStore();
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dbUser?.id) {
      fetchCollections(dbUser.id);
    }
  }, [dbUser, fetchCollections]);

  const handleToggleCollection = (collectionId: string) => {
    if (selectedCollections.includes(collectionId)) {
      setSelectedCollections(
        selectedCollections.filter((id) => id !== collectionId),
      );
    } else {
      setSelectedCollections([...selectedCollections, collectionId]);
    }
  };

  const handleSubmit = async () => {
    if (!dbUser?.id || selectedCollections.length === 0) return;

    setIsSubmitting(true);

    try {
      // Add the bookmark to each selected collection
      for (const collectionId of selectedCollections) {
        await addToCollection(collectionId, bookmarkId, dbUser.id);
      }

      onClose();
    } catch (error) {
      console.error("Error adding bookmark to collections:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col border-4 border-black shadow-[4px_4px_0_0_#000]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black">Add to Collection</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 border-2 border-black rounded-lg p-1 ml-2"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        {collections.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-gray-600">
              You don&apos;t have any collections yet.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-grow mb-4">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`border-4 p-3 mb-2 rounded-lg cursor-pointer ${
                    selectedCollections.includes(collection.id)
                      ? "border-purple-500 bg-purple-50"
                      : "border-black"
                  }`}
                  onClick={() => handleToggleCollection(collection.id)}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(collection.id)}
                      onChange={() => handleToggleCollection(collection.id)}
                      className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-2 border-black rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-bold">{collection.name}</p>
                      {collection.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {collection.description.length > 60
                            ? `${collection.description.substring(0, 60)}...`
                            : collection.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 rounded-lg border-4 border-black font-bold shadow-[2px_2px_0_0_#000] hover:shadow-none active:shadow-none transition-all"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-3 bg-purple-400 rounded-lg border-4 border-black font-bold shadow-[2px_2px_0_0_#000] hover:shadow-none active:shadow-none transition-all"
                disabled={isSubmitting || selectedCollections.length === 0}
              >
                {isSubmitting
                  ? "Adding..."
                  : `Add to ${selectedCollections.length} Collection${selectedCollections.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
