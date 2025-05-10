// context/UserContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useMiniKit, useAuthenticate } from "@coinbase/onchainkit/minikit";
import { supabase, User } from "@/lib/supabase"; // Adjust import path as needed

// Define the context type
interface UserContextType {
  dbUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  showAuthPrompt: () => Promise<boolean>;
  hideAuthPrompt: () => void;
  refreshUser: () => Promise<void>;
}

// Create the context with a default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// AuthPrompt component used within the provider
function AuthPrompt({
  onCancel,
  onSignIn,
}: {
  onCancel: () => void;
  onSignIn: () => Promise<boolean>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await onSignIn();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Sign in required</h2>
        <p className="mb-4 text-gray-600">
          You need to sign in with Farcaster to access this feature. Your
          bookmarks will be saved to your account.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in with Farcaster"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Create the provider component
export function UserProvider({ children }: { children: ReactNode }) {
  // Place hooks inside the component function
  const { context } = useMiniKit();
  const { signIn } = useAuthenticate();

  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthPromptVisible, setIsAuthPromptVisible] = useState(false);

  // Function to load or create a user in the database
  const loadOrCreateUser = async (
    fid: number,
    userData?: {
      username?: string;
      displayName?: string;
      pfpUrl?: string;
    },
  ) => {
    try {
      // Check if user exists in database
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("fid", fid)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "row not found" - we'll handle that below
        throw error;
      }

      if (data) {
        // User exists, update their info
        setDbUser(data as User);
        setIsAuthenticated(true);

        // Update last login
        await supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", data.id);
      } else if (userData) {
        // User doesn't exist, create them
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            fid: fid,
            username: userData.username,
            display_name: userData.displayName,
            pfp_url: userData.pfpUrl,
          })
          .select()
          .single();

        if (createError) throw createError;
        setDbUser(newUser as User);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("session="));

        if (sessionCookie) {
          const session = JSON.parse(
            decodeURIComponent(sessionCookie.split("=")[1]),
          );
          if (session.fid && new Date(session.expiresAt) > new Date()) {
            await loadOrCreateUser(session.fid, {
              username: session.username,
            });
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };

    checkSession();
  }, []);

  // Get user context from MiniKit and load or create user in database
  useEffect(() => {
    if (context?.user?.fid) {
      loadOrCreateUser(context.user.fid, {
        username: context.user.username,
        displayName: context.user.displayName,
        pfpUrl: context.user.pfpUrl,
      });
    } else {
      setLoading(false);
    }
  }, [context]);

  const handleSignIn = async (): Promise<boolean> => {
    try {
      // Authenticate using MiniKit
      const result = await signIn();

      if (result && result.message && result.signature) {
        // Authentication successful
        // If we have user context from Frame SDK, use it
        if (context?.user?.fid) {
          await loadOrCreateUser(context.user.fid, {
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          });
          setIsAuthenticated(true);
          setIsAuthPromptVisible(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Sign-in error:", error);
      return false;
    }
  };

  const handleSignOut = async (): Promise<void> => {
    // Clear authentication state and session cookie
    setIsAuthenticated(false);
    setDbUser(null);
    document.cookie =
      "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const refreshUser = async () => {
    if (!context?.user?.fid) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("fid", context.user.fid)
        .single();

      if (error) throw error;

      if (data) {
        setDbUser(data as User);
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
    }
  };

  const showAuthPrompt = async (): Promise<boolean> => {
    if (isAuthenticated) return true;

    setIsAuthPromptVisible(true);
    return false;
  };

  const hideAuthPrompt = () => {
    setIsAuthPromptVisible(false);
  };

  return (
    <UserContext.Provider
      value={{
        dbUser,
        loading,
        isAuthenticated,
        signIn: handleSignIn,
        signOut: handleSignOut,
        showAuthPrompt,
        hideAuthPrompt,
        refreshUser,
      }}
    >
      {children}
      {isAuthPromptVisible && (
        <AuthPrompt onCancel={hideAuthPrompt} onSignIn={handleSignIn} />
      )}
    </UserContext.Provider>
  );
}

// Create and export the hook
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Export as default for convenience in imports
export default useUser;
