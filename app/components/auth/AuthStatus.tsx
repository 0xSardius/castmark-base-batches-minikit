// components/auth/AuthStatus.tsx
import { useUser } from "@/context/UserContext";

export default function AuthStatus() {
  const { isAuthenticated, signIn, signOut, dbUser } = useUser();

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="font-medium mb-2">Authentication Status</h3>
      <div className="mb-2">
        Status:{" "}
        {isAuthenticated ? (
          <span className="text-green-600 font-medium">Signed In</span>
        ) : (
          <span className="text-red-600 font-medium">Signed Out</span>
        )}
      </div>

      {isAuthenticated && dbUser && (
        <div className="text-sm text-gray-600 mb-3">
          Signed in as:{" "}
          {dbUser.display_name || dbUser.username || `FID: ${dbUser.fid}`}
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={signIn}
          disabled={isAuthenticated}
          className={`px-3 py-1 rounded-md ${
            isAuthenticated
              ? "bg-gray-200 text-gray-500"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={signOut}
          disabled={!isAuthenticated}
          className={`px-3 py-1 rounded-md ${
            !isAuthenticated
              ? "bg-gray-200 text-gray-500"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
