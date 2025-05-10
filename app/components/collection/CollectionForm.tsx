import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useCollectionStore } from "@/stores/collectionStore";
import { Collection } from "@/lib/supabase";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-4 border-black p-4">
          <h2 className="text-2xl font-black">
            {isEditing ? "Edit Collection" : "New Collection"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div>
            <label htmlFor="name" className="block font-bold mb-2 text-lg">
              Collection Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-4 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400"
              placeholder="My Awesome Collection"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block font-bold mb-2 text-lg"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border-4 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400"
              placeholder="What's this collection about?"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border-4 border-black rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
                className="w-5 h-5 border-2 border-black rounded checked:bg-purple-400"
              />
              <span className="font-bold">Make this collection public</span>
            </label>

            <label className="flex items-center gap-3 p-3 border-4 border-black rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
              <input
                type="checkbox"
                checked={isCollaborative}
                onChange={() => setIsCollaborative(!isCollaborative)}
                className="w-5 h-5 border-2 border-black rounded checked:bg-purple-400"
              />
              <span className="font-bold">Allow others to add casts</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t-4 border-black">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 rounded-lg border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-400 rounded-lg border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
