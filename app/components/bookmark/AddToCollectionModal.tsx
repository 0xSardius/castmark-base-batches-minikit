// components/bookmark/AddToCollectionModal.tsx
import { useState, useEffect } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import { useCollectionStore } from "~/stores/collectionStore";
import { useUser } from "~/context/UserContext";
import CollectionForm from "~/components/collection/CollectionForm";

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
  const [showCreateForm, setShowCreateForm] = useState(false);

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
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {showCreateForm ? (
          <CollectionForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              fetchCollections(dbUser?.id || "");
            }}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add to Collection</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <FiX size={24} />
              </button>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center justify-center w-full p-3 mb-4 border border-dashed border-gray-300 rounded-md text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <FiPlus size={18} className="mr-2" />
              Create New Collection
            </button>

            {collections.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-gray-600">
                  You don't have any collections yet.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-y-auto flex-grow mb-4">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className={`border p-3 mb-2 rounded-md cursor-pointer ${
                        selectedCollections.includes(collection.id)
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => handleToggleCollection(collection.id)}
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={selectedCollections.includes(collection.id)}
                          onChange={() => handleToggleCollection(collection.id)}
                          className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium">
                            {collection.name}
                          </p>
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
                    disabled={isSubmitting || selectedCollections.length === 0}
                  >
                    {isSubmitting
                      ? "Adding..."
                      : `Add to ${selectedCollections.length} Collection${selectedCollections.length !== 1 ? "s" : ""}`}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
