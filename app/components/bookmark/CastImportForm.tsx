import { useState } from "react";
import { FiBookmark, FiLoader, FiLink } from "react-icons/fi";
import { useUser } from "@/context/UserContext";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useNotification } from "@coinbase/onchainkit/minikit";

export default function CastImportForm() {
  const { showAuthPrompt, dbUser } = useUser();
  const { addBookmark } = useBookmarkStore();
  const sendNotification = useNotification();

  const [castUrl, setCastUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const extractCastData = async (url: string) => {
    // Handle different formats of Farcaster URLs and hashes
    let castHash = "";

    // Check if input is a direct hash
    if (/^0x[a-fA-F0-9]{64}$/.test(url)) {
      castHash = url;
    }
    // Handle warpcast.com URLs
    else if (url.includes("warpcast.com")) {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/");
        // Extract hash from URL path
        // Typical format: /~/0x...
        for (const part of pathParts) {
          if (part.startsWith("0x")) {
            castHash = part;
            break;
          }
        }
      } catch (_) {
        throw new Error("Invalid Warpcast URL format");
      }
    }
    // Handle other Farcaster clients
    else if (url.includes("farcaster.xyz") || url.includes("far.quest")) {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/");
        // Look for the hash in the path
        for (const part of pathParts) {
          if (part.startsWith("0x")) {
            castHash = part;
            break;
          }
        }
      } catch (_) {
        throw new Error("Invalid Farcaster URL format");
      }
    } else {
      throw new Error(
        "Unsupported URL format. Please use a Warpcast or Farcaster URL.",
      );
    }

    if (!castHash) {
      throw new Error("Could not extract cast hash from the URL");
    }

    // For the MVP, we'll use a simplified approach
    // In a production app, you would call the Farcaster API to get cast details
    // For now, we'll just return the hash and placeholder data

    return {
      hash: castHash,
      authorFid: 0, // This would come from API
      text: "Cast content will appear here", // This would come from API
      url: url,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!castUrl.trim()) {
      setError("Please enter a Farcaster cast URL or hash");
      return;
    }

    if (!dbUser) {
      const isAuth = await showAuthPrompt();
      if (!isAuth) return;
    }

    setIsProcessing(true);

    try {
      // Extract cast data from the URL
      const castData = await extractCastData(castUrl);

      // Save the bookmark
      await addBookmark({
        user_id: dbUser!.id,
        cast_hash: castData.hash,
        cast_author_fid: castData.authorFid,
        cast_text: castData.text,
        cast_url: castData.url,
        is_public: true,
        note: "",
        tags: [],
      });

      // Send notification
      try {
        await sendNotification({
          title: "Saved! 🎉",
          body: "Cast added to your collection",
        });
      } catch (error) {
        console.error("Failed to send notification:", error);
      }

      // Reset form
      setCastUrl("");
    } catch (error: unknown) {
      console.error("Error importing cast:", error);
      setError(
        error instanceof Error ? error.message : "Failed to import cast",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-bold mb-4">Import Cast</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="castUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Paste Farcaster Cast URL or Hash
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <FiLink />
            </span>
            <input
              id="castUrl"
              type="text"
              value={castUrl}
              onChange={(e) => setCastUrl(e.target.value)}
              placeholder="https://warpcast.com/~/0x... or 0x..."
              className="w-full border-2 border-gray-300 pl-10 pr-3 py-2 rounded-md focus:ring-purple-500 focus:border-purple-500"
              disabled={isProcessing}
            />
          </div>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isProcessing || !castUrl.trim()}
          className={`
            w-full flex items-center justify-center gap-2
            px-4 py-3
            rounded-lg 
            border-4 
            border-black 
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
            hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            active:shadow-none
            transition-all
            ${isProcessing ? "bg-yellow-300" : "bg-purple-400"}
            hover:translate-x-[2px] 
            hover:translate-y-[2px]
            active:translate-x-[4px] 
            active:translate-y-[4px]
            disabled:opacity-50
            disabled:cursor-not-allowed
          `}
        >
          {isProcessing ? (
            <>
              <FiLoader className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <FiBookmark />
              <span>Save Cast</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
