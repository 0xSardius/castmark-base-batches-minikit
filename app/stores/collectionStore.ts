// stores/collectionStore.ts
import { create } from "zustand";
import { supabase, Collection, CollectionItem } from "@/lib/supabase";

interface CollectionStore {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  selectedCollection: Collection | null;
  collectionItems: CollectionItem[];
  fetchCollections: (userId: string) => Promise<void>;
  fetchCollectionItems: (collectionId: string) => Promise<void>;
  createCollection: (
    collection: Omit<Collection, "id" | "created_at" | "updated_at">,
  ) => Promise<Collection | null>;
  updateCollection: (
    id: string,
    updates: Partial<Collection>,
  ) => Promise<Collection | null>;
  deleteCollection: (id: string) => Promise<boolean>;
  addToCollection: (
    collectionId: string,
    bookmarkId: string,
    userId: string,
  ) => Promise<CollectionItem | null>;
  removeFromCollection: (collectionItemId: string) => Promise<boolean>;
  selectCollection: (collection: Collection | null) => void;
}

export const useCollectionStore = create<CollectionStore>((set) => ({
  collections: [],
  loading: false,
  error: null,
  selectedCollection: null,
  collectionItems: [],

  fetchCollections: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("created_by_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ collections: data as Collection[], loading: false });
    } catch (error) {
      console.error("Error fetching collections:", error);
      set({ error: "Failed to fetch collections", loading: false });
    }
  },

  fetchCollectionItems: async (collectionId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("collection_items")
        .select("*")
        .eq("collection_id", collectionId)
        .order("order", { ascending: true });

      if (error) throw error;
      set({ collectionItems: data as CollectionItem[], loading: false });
    } catch (error) {
      console.error("Error fetching collection items:", error);
      set({ error: "Failed to fetch collection items", loading: false });
    }
  },

  createCollection: async (collection) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("collections")
        .insert({
          ...collection,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newCollection = data as Collection;
      set((state) => ({
        collections: [newCollection, ...state.collections],
        loading: false,
      }));

      return newCollection;
    } catch (error) {
      console.error("Error creating collection:", error);
      set({ error: "Failed to create collection", loading: false });
      return null;
    }
  },

  updateCollection: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("collections")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedCollection = data as Collection;
      set((state) => ({
        collections: state.collections.map((c) =>
          c.id === id ? updatedCollection : c,
        ),
        selectedCollection:
          state.selectedCollection?.id === id
            ? updatedCollection
            : state.selectedCollection,
        loading: false,
      }));

      return updatedCollection;
    } catch (error) {
      console.error("Error updating collection:", error);
      set({ error: "Failed to update collection", loading: false });
      return null;
    }
  },

  deleteCollection: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        collections: state.collections.filter((c) => c.id !== id),
        selectedCollection:
          state.selectedCollection?.id === id ? null : state.selectedCollection,
        loading: false,
      }));

      return true;
    } catch (error) {
      console.error("Error deleting collection:", error);
      set({ error: "Failed to delete collection", loading: false });
      return false;
    }
  },

  addToCollection: async (collectionId, bookmarkId, userId) => {
    set({ loading: true, error: null });
    try {
      // Get the highest order number for this collection
      const { data: orderData, error: orderError } = await supabase
        .from("collection_items")
        .select("order")
        .eq("collection_id", collectionId)
        .order("order", { ascending: false })
        .limit(1);

      if (orderError) throw orderError;

      const nextOrder =
        orderData.length > 0 ? (orderData[0].order || 0) + 1 : 0;

      const { data, error } = await supabase
        .from("collection_items")
        .insert({
          collection_id: collectionId,
          bookmark_id: bookmarkId,
          added_by_id: userId,
          order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;

      const newItem = data as CollectionItem;
      set((state) => ({
        collectionItems: [...state.collectionItems, newItem],
        loading: false,
      }));

      return newItem;
    } catch (error) {
      console.error("Error adding to collection:", error);
      set({ error: "Failed to add to collection", loading: false });
      return null;
    }
  },

  removeFromCollection: async (collectionItemId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("collection_items")
        .delete()
        .eq("id", collectionItemId);

      if (error) throw error;

      set((state) => ({
        collectionItems: state.collectionItems.filter(
          (item) => item.id !== collectionItemId,
        ),
        loading: false,
      }));

      return true;
    } catch (error) {
      console.error("Error removing from collection:", error);
      set({ error: "Failed to remove from collection", loading: false });
      return false;
    }
  },

  selectCollection: (collection) => {
    set({ selectedCollection: collection });
  },
}));
