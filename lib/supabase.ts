import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  fid: number;
  username: string | null;
  display_name: string | null;
  pfp_url: string | null;
  bio: string | null;
  wallet_address: string | null;
  created_at: string;
  last_login: string;
};

export type Bookmark = {
  id: string;
  user_id: string;
  cast_hash: string;
  cast_author_fid: number | null;
  cast_text: string | null;
  cast_url: string | null;
  note: string | null;
  tags: string[] | null;
  created_at: string;
  is_public: boolean;
};

export type Collection = {
  id: string;
  name: string;
  description: string | null;
  created_by_id: string;
  is_public: boolean;
  is_collaborative: boolean;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
};

export type CollectionItem = {
  id: string;
  collection_id: string;
  bookmark_id: string;
  added_by_id: string;
  order: number | null;
  added_at: string;
};

export type CollectionCollaborator = {
  collection_id: string;
  user_id: string;
  role: "owner" | "editor" | "viewer";
  added_at: string;
};

export type Follow = {
  follower_id: string;
  followee_id: string;
  type: "user" | "collection";
  created_at: string;
};
