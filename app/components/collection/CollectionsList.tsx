// components/collection/CollectionsList.tsx
import { useEffect, useState } from "react";
import { useCollectionStore } from "@/stores/collectionStore";
import { useUser } from "@/context/UserContext";
import { Collection } from "@/lib/supabase";
import CollectionCard from "./CollectionCard";
import CollectionForm from "./CollectionForm";
import { FiPlusCircle } from "react-icons/fi";

export default function CollectionsList() {
  const { dbUser, isAuthenticated, showAuthPrompt } = useUser();
  const { collections, loading, error, fetchCollections, selectCollection } =
    useCollectionStore();
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null,
  );
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (dbUser?.id) {
      fetchCollections(dbUser.id);
    }
  }, [dbUser, fetchCollections]);

  const handleAddCollection = async () => {
    const isAuth = await showAuthPrompt();
    if (!isAuth) return;

    setShowAddForm(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
  };

  const handleCloseForm = () => {
    setEditingCollection(null);
    setShowAddForm(false);
  };

  const handleSelectCollection = (collection: Collection) => {
    selectCollection(collection);
    // Navigate to collection detail page
    window.location.href = `/collections/${collection.id}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">
          Sign in to view your collections
        </h2>
        <p className="text-gray-600 mb-4">
          Sign in with your Farcaster account to create and manage your
          collections.
        </p>
        <button
          onClick={() => showAuthPrompt()}
          className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
        >
          Sign in with Farcaster
        </button>
      </div>
    );
  }

  if (loading && collections.length === 0) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-pulse text-gray-600">
          Loading collections...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Collections</h1>
        <button
          onClick={handleAddCollection}
          className="flex items-center px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
        >
          <FiPlusCircle size={18} className="mr-2" />
          New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600 mb-4">
            You haven&apos;t created any collections yet.
          </p>
          <button
            onClick={handleAddCollection}
            className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
          >
            Create your first collection
          </button>
        </div>
      ) : (
        <div>
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onEdit={handleEditCollection}
              onSelect={handleSelectCollection}
            />
          ))}
        </div>
      )}

      {editingCollection && (
        <CollectionForm
          existingCollection={editingCollection}
          onClose={handleCloseForm}
          onSuccess={() => fetchCollections(dbUser?.id || "")}
        />
      )}

      {showAddForm && (
        <CollectionForm
          onClose={handleCloseForm}
          onSuccess={() => fetchCollections(dbUser?.id || "")}
        />
      )}
    </div>
  );
}
