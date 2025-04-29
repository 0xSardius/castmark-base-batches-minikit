import { create } from "zustand";
import { supabase, Bookmark } from "../../lib/supabase";

interface BookmarkStore {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  fetchBookmarks: (userId: string) => Promise<void>;
  addBookmark: (
    bookmark: Omit<Bookmark, "id" | "created_at">,
  ) => Promise<Bookmark | null>;
  updateBookmark: (
    id: string,
    updates: Partial<Bookmark>,
  ) => Promise<Bookmark | null>;
  deleteBookmark: (id: string) => Promise<boolean>;
}

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  bookmarks: [],
  loading: false,
  error: null,

  fetchBookmarks: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ bookmarks: data as Bookmark[], loading: false });
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      set({ error: "Failed to fetch bookmarks", loading: false });
    }
  },

  addBookmark: async (bookmark) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert(bookmark)
        .select()
        .single();

      if (error) throw error;

      const newBookmark = data as Bookmark;
      set((state) => ({
        bookmarks: [newBookmark, ...state.bookmarks],
        loading: false,
      }));

      return newBookmark;
    } catch (error) {
      console.error("Error adding bookmark:", error);
      set({ error: "Failed to add bookmark", loading: false });
      return null;
    }
  },

  updateBookmark: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedBookmark = data as Bookmark;
      set((state) => ({
        bookmarks: state.bookmarks.map((b) =>
          b.id === id ? updatedBookmark : b,
        ),
        loading: false,
      }));

      return updatedBookmark;
    } catch (error) {
      console.error("Error updating bookmark:", error);
      set({ error: "Failed to update bookmark", loading: false });
      return null;
    }
  },

  deleteBookmark: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
        loading: false,
      }));

      return true;
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      set({ error: "Failed to delete bookmark", loading: false });
      return false;
    }
  },
}));
