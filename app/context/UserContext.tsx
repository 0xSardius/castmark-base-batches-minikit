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

// Session expiration time (30 days)
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000;

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
  const { context } = useMiniKit();
  const { signIn } = useAuthenticate();

  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthPromptVisible, setIsAuthPromptVisible] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);

  // Function to save session to localStorage and cookies
  const saveSession = (userData: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  }) => {
    const expiry = new Date(Date.now() + SESSION_EXPIRY);
    const sessionData = {
      fid: userData.fid,
      username: userData.username,
      displayName: userData.displayName,
      pfpUrl: userData.pfpUrl,
      expiresAt: expiry.toISOString(),
    };

    // Save to localStorage for persistent client access
    localStorage.setItem("castmarkSession", JSON.stringify(sessionData));

    // Also save to cookie for page load
    document.cookie = `session=${encodeURIComponent(
      JSON.stringify(sessionData),
    )}; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;

    console.log("Session saved:", sessionData);
  };

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
      console.log("Loading/creating user...", { fid, userData });

      // Check if user exists in database
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("fid", fid)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        console.log("Existing user found:", data);
        setDbUser(data as User);
        setIsAuthenticated(true);

        // Update last login
        await supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", data.id);

        // Save session
        if (userData) {
          saveSession({
            fid,
            username: userData.username,
            displayName: userData.displayName,
            pfpUrl: userData.pfpUrl,
          });
        }
      } else if (userData) {
        console.log("Creating new user...");
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
        console.log("New user created:", newUser);
        setDbUser(newUser as User);
        setIsAuthenticated(true);

        // Save session
        saveSession({
          fid,
          username: userData.username,
          displayName: userData.displayName,
          pfpUrl: userData.pfpUrl,
        });
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
      setAuthAttempted(true);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking for saved session...");

        // First try localStorage (more reliable)
        const savedSession = localStorage.getItem("castmarkSession");

        if (savedSession) {
          const session = JSON.parse(savedSession);
          if (session.fid && new Date(session.expiresAt) > new Date()) {
            console.log("Valid session found in localStorage:", session);
            await loadOrCreateUser(session.fid, {
              username: session.username,
              displayName: session.displayName,
              pfpUrl: session.pfpUrl,
            });
            return;
          }
        }

        // Fallback to cookie
        const sessionCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("session="));

        if (sessionCookie) {
          const session = JSON.parse(
            decodeURIComponent(sessionCookie.split("=")[1]),
          );
          if (session.fid && new Date(session.expiresAt) > new Date()) {
            console.log("Valid session found in cookie:", session);
            await loadOrCreateUser(session.fid, {
              username: session.username,
              displayName: session.displayName,
              pfpUrl: session.pfpUrl,
            });
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setLoading(false);
        setAuthAttempted(true);
      }
    };

    checkSession();
  }, []);

  // Get user context from MiniKit and load or create user in database
  useEffect(() => {
    console.log("MiniKit context changed:", context);
    if (context?.user?.fid) {
      loadOrCreateUser(context.user.fid, {
        username: context.user.username,
        displayName: context.user.displayName,
        pfpUrl: context.user.pfpUrl,
      });
    } else if (!loading) {
      setAuthAttempted(true);
    }
  }, [context, loading]);

  const handleSignIn = async (): Promise<boolean> => {
    try {
      console.log("Starting sign in process...");
      // Authenticate using MiniKit
      const result = await signIn();

      if (result && result.message && result.signature) {
        console.log("Sign in successful:", result);
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
    // Clear authentication state and session data
    setIsAuthenticated(false);
    setDbUser(null);

    // Clear localStorage
    localStorage.removeItem("castmarkSession");

    // Clear cookie
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
    // If already authenticated, return true immediately
    if (isAuthenticated) return true;

    // If we're still loading, wait a bit to see if authentication completes
    if (loading && !authAttempted) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!loading && isAuthenticated) {
            clearInterval(checkInterval);
            resolve(true);
          } else if (!loading || authAttempted) {
            clearInterval(checkInterval);
            setIsAuthPromptVisible(true);
            resolve(false);
          }
        }, 200);
      });
    }

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

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Export as default for convenience in imports
export default useUser;
