import { useState } from "react";
import { Collection } from "@/lib/supabase";
import { useCollectionStore } from "@/stores/collectionStore";
import { FiX } from "react-icons/fi";
import { useUser } from "@/context/UserContext";

interface CollectionFormProps {
  existingCollection?: Collection;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CollectionForm({
  existingCollection,
  onClose,
  onSuccess,
}: CollectionFormProps) {
  const { dbUser } = useUser();
  const { createCollection, updateCollection } = useCollectionStore();

  const [name, setName] = useState(existingCollection?.name || "");
  const [description, setDescription] = useState(
    existingCollection?.description || "",
  );
  const [isPublic, setIsPublic] = useState(
    existingCollection?.is_public !== false,
  );
  const [isCollaborative, setIsCollaborative] = useState(
    existingCollection?.is_collaborative === true,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!existingCollection;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUser) return;

    setIsSubmitting(true);

    try {
      if (isEditing && existingCollection) {
        await updateCollection(existingCollection.id, {
          name,
          description,
          is_public: isPublic,
          is_collaborative: isCollaborative,
        });
      } else {
        await createCollection({
          name,
          description,
          created_by_id: dbUser.id,
          is_public: isPublic,
          is_collaborative: isCollaborative,
          cover_image: null,
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving collection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditing ? "Edit Collection" : "Create Collection"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Collection Name*
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="My Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={1}
              maxLength={100}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="What is this collection about?"
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="mb-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
              />
              <span className="ml-2 text-sm text-gray-700">
                Make this collection public
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                checked={isCollaborative}
                onChange={() => setIsCollaborative(!isCollaborative)}
              />
              <span className="ml-2 text-sm text-gray-700">
                Allow others to contribute to this collection
              </span>
            </label>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 rounded-md text-white hover:bg-purple-700"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
