// components/collection/CollectionsList.tsx
import { useEffect, useState } from "react";
import { useCollectionStore } from "@/stores/collectionStore";
import { useUser } from "@/context/UserContext";
import { Collection } from "@/lib/supabase";
import CollectionCard from "./CollectionCard";
import CollectionForm from "./CollectionForm";

export default function CollectionsList() {
  const { collections, loading, error, fetchCollections } =
    useCollectionStore();
  const { dbUser, isAuthenticated, showAuthPrompt } = useUser();
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

  const handleCollectionClick = (collection: Collection) => {
    // Use window.location.href for navigation within MiniKit frame
    window.location.href = `/collections/${collection.id}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border-4 border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-black mb-2">
          Sign in to view your collections
        </h2>
        <p className="text-gray-600 mb-4">
          Sign in with your Farcaster account to create and manage your
          collections.
        </p>
        <button
          onClick={() => showAuthPrompt()}
          className="px-6 py-3 bg-purple-400 text-white border-4 border-black rounded-lg font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]"
        >
          Sign in with Farcaster
        </button>
      </div>
    );
  }

  if (loading && collections.length === 0) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-pulse text-gray-600 font-bold">
          Loading collections...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-6">
        <div className="text-red-500 font-bold">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {collections.length === 0 ? (
        <div className="text-center p-8 border-4 border-dashed border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-gray-600 mb-4 font-bold">
            You haven&apos;t created any collections yet.
          </p>
          <button
            onClick={handleAddCollection}
            className="px-6 py-3 bg-purple-400 text-white border-4 border-black rounded-lg font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]"
          >
            Create your first collection
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onEdit={handleEditCollection}
              onSelect={handleCollectionClick}
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
