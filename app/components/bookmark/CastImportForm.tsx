"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiBookmark,
  FiLoader,
  FiLink,
  FiCheck,
  FiClipboard,
} from "react-icons/fi";
import { useUser } from "@/context/UserContext";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useNotification } from "@coinbase/onchainkit/minikit";
import Image from "next/image";

interface CastImportFormProps {
  onSuccess?: () => void;
  initialCastUrl?: string;
  autoSubmit?: boolean;
}

// Define a type for the Neynar cast preview
interface NeynarCastPreview {
  text?: string;
  author?: {
    fid?: number;
    username?: string;
    display_name?: string;
    displayName?: string;
    pfp_url?: string;
    pfp?: {
      url?: string;
    };
  };
  error?: string;
}

export default function CastImportForm({
  onSuccess,
  initialCastUrl,
  autoSubmit = false,
}: CastImportFormProps) {
  const { showAuthPrompt, dbUser } = useUser();
  const { addBookmark } = useBookmarkStore();
  const sendNotification = useNotification();
  const inputRef = useRef<HTMLInputElement>(null);

  const [castUrl, setCastUrl] = useState(initialCastUrl || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [extractedHash, setExtractedHash] = useState<string | null>(null);
  const [castPreview, setCastPreview] = useState<NeynarCastPreview | null>(
    null,
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Auto-detect URL from clipboard on component mount
  useEffect(() => {
    const tryReadClipboard = async () => {
      try {
        // Only try to access clipboard if the user has interacted with the page
        if (document.hasFocus() && inputRef.current) {
          const clipboardText = await navigator.clipboard.readText();

          // Check if clipboard contains what looks like a Farcaster URL or hash
          if (isValidFarcasterInput(clipboardText) && !castUrl) {
            // Don't auto-fill, just show the paste button
            setPasteSuccess(true);
          }
        }
      } catch {
        // Clipboard access may be denied, that's fine
        console.log("Clipboard access not available");
      }
    };

    // Only try to read clipboard if we don't have an initial URL
    if (!initialCastUrl) {
      tryReadClipboard();
    }

    // TEST: Try parsing example URL to verify fix (will show in console)
    const testUrl = "https://warpcast.com/overproticol/0x5cd3f740";
    const testFullHash = "0x5cd3f74090cf546afcc8d5e5398740adea6b380d";

    console.log("TEST - Is URL valid:", isValidFarcasterInput(testUrl));
    console.log(
      "TEST - Is full hash valid:",
      isValidFarcasterInput(testFullHash),
    );

    try {
      const urlObj = new URL(testUrl);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      console.log("TEST - URL path parts:", pathParts);

      const hashPart = pathParts.find((part) => part.startsWith("0x"));
      console.log("TEST - Extracted hash part:", hashPart);

      console.log("TEST - Hash match:", hashPart === "0x5cd3f740");
      console.log(
        "TEST - Hash is prefix of full hash:",
        testFullHash.startsWith(hashPart || ""),
      );
    } catch (e) {
      console.error("TEST - Error parsing URL:", e);
    }
  }, [castUrl, initialCastUrl]);

  // When extractedHash changes, fetch preview
  useEffect(() => {
    if (extractedHash && !error) {
      fetchCastPreview(extractedHash);
    } else {
      setCastPreview(null);
    }
  }, [extractedHash, error]);

  // Check if input looks like a valid Farcaster input
  const isValidFarcasterInput = (input: string): boolean => {
    if (!input) return false;

    // Normalize input by trimming whitespace and removing quotes
    input = input.trim().replace(/['"]/g, "");

    // Check for standard hash format (with 0x prefix)
    if (/^0x[a-fA-F0-9]{64}$/.test(input)) return true;

    // Check for hash without 0x prefix
    if (/^[a-fA-F0-9]{64}$/.test(input)) return true;

    // Check for Farcaster's 42-character hash format (0x + 40 hex chars)
    if (/^0x[a-fA-F0-9]{40}$/.test(input)) return true;

    // Check for shortened hash format (common in Warpcast URLs)
    if (/^0x[a-fA-F0-9]{8,16}$/.test(input)) return true;

    // Check for common Farcaster URLs
    try {
      const url = new URL(input);
      const isKnownDomain =
        url.hostname.includes("warpcast.com") ||
        url.hostname.includes("farcaster.xyz") ||
        url.hostname.includes("far.quest") ||
        url.hostname.includes("fcast.me");

      // Additional validation for pathname
      // Allow if the URL has a path that might contain a cast
      if (isKnownDomain) {
        // Check if there's a path with potential hash (any format)
        if (url.pathname.length > 1) {
          // For URLs with pattern /username/0xSHORTHASH
          const pathParts = url.pathname.split("/").filter(Boolean);
          if (pathParts.length >= 2) {
            // Check if any part starts with 0x (could be a hash)
            const hasHashPart = pathParts.some((part) => part.startsWith("0x"));
            if (hasHashPart) return true;
          }
          return true; // Any path on a known domain might be valid
        }
      }

      return false;
    } catch {
      return false;
    }
  };

  const extractCastData = async (url: string) => {
    // Handle different formats of Farcaster URLs and hashes
    let castHash = "";
    let urlWithoutParams = url;

    // Clean up the input - trim whitespace and remove quotes
    url = url.trim().replace(/['"]/g, "");

    // Direct input checks
    // Check if input is a direct hash (full 66-char format)
    if (/^0x[a-fA-F0-9]{64}$/.test(url)) {
      console.log("Detected direct full hash input");
      castHash = url;
    }
    // Check if input is a Farcaster 42-char hash format
    else if (/^0x[a-fA-F0-9]{40}$/.test(url)) {
      console.log("Detected direct 42-char hash input");
      castHash = url;
    }
    // Check if input is a shorter hash format (common in Warpcast URLs)
    else if (/^0x[a-fA-F0-9]{8,16}$/.test(url)) {
      console.log("Detected direct shortened hash input");
      castHash = url;
    }
    // Handle warpcast.com URLs
    else if (url.includes("warpcast.com")) {
      try {
        const urlObj = new URL(url);

        // Remove URL parameters that might interfere with parsing
        urlWithoutParams = urlObj.origin + urlObj.pathname;

        const pathParts = urlObj.pathname.split("/").filter(Boolean);

        console.log("Warpcast URL path parts:", pathParts); // Debug log

        // Check for the modern /~/cast/HASH format first
        if (
          pathParts.length >= 3 &&
          pathParts[0] === "~" &&
          pathParts[1] === "cast"
        ) {
          const potentialHash = pathParts[2];
          if (
            potentialHash.startsWith("0x") &&
            /^0x[a-fA-F0-9]+$/.test(potentialHash)
          ) {
            console.log("Found hash in /~/cast/ format:", potentialHash);
            castHash = potentialHash;
          }
        }
        // Check for older formats like /~/0x...
        else if (pathParts.length >= 2 && pathParts[0] === "~") {
          const potentialHash = pathParts[1];
          if (
            potentialHash.startsWith("0x") &&
            /^0x[a-fA-F0-9]+$/.test(potentialHash)
          ) {
            console.log("Found hash in /~/ format:", potentialHash);
            castHash = potentialHash;
          }
        }
        // Check for format /username/0x...
        else if (pathParts.length >= 2) {
          // Typically the second part would be the hash
          const potentialHash = pathParts[1];
          if (
            potentialHash.startsWith("0x") &&
            /^0x[a-fA-F0-9]+$/.test(potentialHash)
          ) {
            console.log("Found hash in /username/ format:", potentialHash);
            castHash = potentialHash;
          }
        }

        // If no pattern matched, try to find any path part that looks like a hash
        if (!castHash) {
          for (const part of pathParts) {
            if (part.startsWith("0x") && /^0x[a-fA-F0-9]+$/.test(part)) {
              console.log("Found hash in general path scan:", part);
              castHash = part;
              break;
            }
          }
        }

        // Last resort: try to find a hash without 0x prefix
        if (!castHash && pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1];
          if (/^[a-fA-F0-9]{40,64}$/.test(lastPart)) {
            console.log("Found hash without 0x prefix:", lastPart);
            castHash = "0x" + lastPart;
          }
        }
      } catch (error) {
        console.error("Error parsing Warpcast URL:", error);
        throw new Error(
          "Invalid Warpcast URL format. Please check the URL and try again.",
        );
      }
    }
    // Handle other Farcaster clients
    else if (
      url.includes("farcaster.xyz") ||
      url.includes("far.quest") ||
      url.includes("fcast.me")
    ) {
      try {
        const urlObj = new URL(url);

        // Remove URL parameters
        urlWithoutParams = urlObj.origin + urlObj.pathname;

        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        console.log("Farcaster URL path parts:", pathParts); // Debug log

        // Look for the hash in the path - check all path parts
        for (const part of pathParts) {
          if (part.startsWith("0x") && /^0x[a-fA-F0-9]+$/.test(part)) {
            console.log("Found hash in farcaster client URL:", part);
            castHash = part;
            break;
          }
        }

        // Try to find hash without 0x prefix in the URL path
        if (!castHash && pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1];
          if (/^[a-fA-F0-9]{40,64}$/.test(lastPart)) {
            console.log(
              "Found hash without 0x prefix in farcaster client URL:",
              lastPart,
            );
            castHash = "0x" + lastPart;
          }
        }
      } catch (error) {
        console.error("Error parsing Farcaster URL:", error);
        throw new Error(
          "Invalid Farcaster URL format. Please check the URL and try again.",
        );
      }
    } else {
      throw new Error(
        "Unsupported URL format. Please use a Warpcast or Farcaster URL or paste a cast hash starting with 0x.",
      );
    }

    if (!castHash) {
      console.error("Failed to extract hash from URL:", url);
      throw new Error(
        "Could not extract cast hash from the URL. Please make sure you're using a valid cast URL.",
      );
    }

    console.log("Successfully extracted hash:", castHash);

    return {
      hash: castHash,
      authorFid: 0, // This would come from API
      text: "Cast content will appear here", // This would come from API
      url: urlWithoutParams || url,
    };
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setCastUrl(clipboardText);
        setPasteSuccess(false);
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  // Fetch cast preview from Neynar
  const fetchCastPreview = async (hash: string) => {
    setIsPreviewLoading(true);
    setCastPreview(null);
    try {
      console.log("Fetching preview for hash:", hash);
      const res = await fetch(`/api/neynar-cast?hash=${hash}`);
      const data = await res.json();

      if (data.error) {
        console.error("Preview fetch error:", data.error);
        setCastPreview({ error: data.error });
        return;
      }

      // Handle Neynar SDK response format
      if (data.cast) {
        console.log("Preview fetch success");
        setCastPreview(data.cast);
      } else if (data.result && data.result.cast) {
        // New SDK response format
        console.log("Preview fetch success (new SDK format)");
        setCastPreview(data.result.cast);
      } else {
        console.warn("No cast data in response:", data);
        setCastPreview({ error: "No cast data found" });
      }
    } catch (error) {
      console.error("Preview fetch exception:", error);
      setCastPreview({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch cast preview",
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Extract the submission logic to be reused by both form submit and auto-submit
  const submitCast = async (url: string) => {
    if (!url.trim()) {
      setError("Please enter a Farcaster cast URL or hash");
      return;
    }

    // Validate input format before proceeding
    if (!isValidFarcasterInput(url)) {
      setError(
        "Invalid URL or hash format. Please enter a valid Farcaster cast URL or hash",
      );
      return;
    }

    if (!dbUser) {
      const isAuth = await showAuthPrompt();
      if (!isAuth) return;
    }

    setIsProcessing(true);

    try {
      // Extract cast data from the URL
      const castData = await extractCastData(url);

      // Display the extracted hash
      setExtractedHash(castData.hash);

      // Fetch cast preview from Neynar
      let neynarCastData = null;
      try {
        console.log("Fetching cast data from API for hash:", castData.hash);
        const res = await fetch(`/api/neynar-cast?hash=${castData.hash}`);

        if (!res.ok) {
          throw new Error(`API response not OK: ${res.status}`);
        }

        const data = await res.json();
        console.log("Received API response:", data);

        if (data.error) {
          throw new Error(data.error);
        }

        // Handle different response formats from Neynar SDK
        if (data.cast) {
          console.log("Found cast in data.cast format");
          neynarCastData = data.cast;
        } else if (data.result && data.result.cast) {
          console.log("Found cast in data.result.cast format");
          neynarCastData = data.result.cast;
        } else {
          console.warn("No cast data in expected format:", data);
          throw new Error("Cast data not found in the expected format");
        }
      } catch (error) {
        console.error("Failed to fetch cast data from Neynar:", error);
        if (error instanceof Error) {
          setError(`Cannot fetch cast details: ${error.message}`);
        } else {
          setError("Failed to fetch cast details from Farcaster");
        }
        setIsProcessing(false);
        return; // Don't continue if we can't fetch the cast
      }

      // If we get here, we have valid cast data - save the bookmark
      console.log("Saving bookmark with cast data:", {
        hash: castData.hash,
        authorFid: neynarCastData?.author?.fid,
        authorUsername: neynarCastData?.author?.username,
        authorDisplayName:
          neynarCastData?.author?.display_name ||
          neynarCastData?.author?.displayName,
        authorPfpUrl:
          neynarCastData?.author?.pfp_url || neynarCastData?.author?.pfp?.url,
        text: neynarCastData?.text?.substring(0, 50) + "...",
      });

      await addBookmark({
        user_id: dbUser!.id,
        cast_hash: castData.hash,
        cast_author_fid: neynarCastData?.author?.fid || 0,
        cast_author_username: neynarCastData?.author?.username || null,
        cast_author_display_name:
          neynarCastData?.author?.display_name ||
          neynarCastData?.author?.displayName ||
          null,
        cast_author_pfp_url:
          neynarCastData?.author?.pfp_url ||
          neynarCastData?.author?.pfp?.url ||
          null,
        cast_text: neynarCastData?.text || "Cast content",
        cast_url: neynarCastData?.url || castData.url,
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
      } catch {
        // Continue anyway - notification is not critical
      }

      // Show success state
      setSuccess(true);

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Reset form after a delay
      setTimeout(() => {
        setCastUrl("");
        setSuccess(false);
        setExtractedHash(null);
        setCastPreview(null);
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setExtractedHash(null);
    setCastPreview(null);
    await submitCast(castUrl);
  };

  // Auto-submit if initialCastUrl is provided
  useEffect(() => {
    const autoSubmitCast = async () => {
      if (
        initialCastUrl &&
        isValidFarcasterInput(initialCastUrl) &&
        !isProcessing &&
        !success &&
        autoSubmit
      ) {
        // Wait a moment for UI to render before auto-submitting
        setTimeout(() => {
          // Directly call the internal submit logic instead of using a fake event
          submitCast(initialCastUrl);
        }, 500);
      }
    };

    autoSubmitCast();
  }, [
    initialCastUrl,
    isProcessing,
    success,
    autoSubmit,
    isValidFarcasterInput,
    submitCast,
  ]);

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
              ref={inputRef}
              value={castUrl}
              onChange={(e) => {
                const newValue = e.target.value;
                setCastUrl(newValue);
                setPasteSuccess(false);
                setError("");

                // Clear extracted hash when input changes
                setExtractedHash(null);
                setCastPreview(null);

                // Auto-validate and fetch preview for valid inputs
                if (newValue.trim() && isValidFarcasterInput(newValue.trim())) {
                  try {
                    // Don't block UI with await, use promise
                    extractCastData(newValue.trim())
                      .then((data) => {
                        setExtractedHash(data.hash);
                        // Fetch preview automatically
                        fetchCastPreview(data.hash);
                      })
                      .catch((err) => {
                        // Just log, don't show error during typing
                        console.log("Auto-validation error:", err);
                      });
                  } catch (err) {
                    // Just log, don't stop typing
                    console.log("Error in auto-validation:", err);
                  }
                }
              }}
              placeholder="https://warpcast.com/~/0x... or 0x..."
              className={`w-full border-2 pl-10 pr-3 py-2 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                error
                  ? "border-red-500"
                  : success
                    ? "border-green-500"
                    : extractedHash
                      ? "border-purple-500"
                      : "border-gray-300"
              }`}
              disabled={isProcessing || success}
            />
            {pasteSuccess && !castUrl && (
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-700 hover:text-purple-600"
              >
                <FiClipboard size={18} />
              </button>
            )}
          </div>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          {extractedHash && !error && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Extracted cast hash:</span>{" "}
                <span className="font-mono text-xs break-all">
                  {extractedHash}
                </span>
                {extractedHash.startsWith("0x") &&
                  extractedHash.length < 66 && (
                    <span className="ml-1 text-amber-600 font-medium">
                      (shortened hash)
                    </span>
                  )}
              </p>
              {/* Cast Preview Section */}
              <div className="mt-2">
                {isPreviewLoading ? (
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <FiLoader className="animate-spin" /> Loading cast
                    preview...
                  </div>
                ) : castPreview ? (
                  castPreview.error ? (
                    <div className="text-xs text-red-500">
                      {castPreview.error}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 mt-2">
                      {/* Profile image with fallback */}
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                        {castPreview.author?.pfp_url ? (
                          <Image
                            src={castPreview.author.pfp_url}
                            alt={castPreview.author?.username || "author"}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : castPreview.author?.pfp?.url ? (
                          <Image
                            src={castPreview.author.pfp.url}
                            alt={castPreview.author?.username || "author"}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-semibold text-xs">
                          {castPreview.author?.display_name ||
                            castPreview.author?.username ||
                            "Unknown"}
                        </div>
                        <div className="text-xs text-gray-600">
                          {castPreview.text}
                        </div>
                      </div>
                    </div>
                  )
                ) : null}
              </div>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Examples:
            <span className="font-mono mx-1">
              https://warpcast.com/~/0x...
            </span>{" "}
            or
            <span className="font-mono mx-1">0x1234...</span>
          </p>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !castUrl.trim() || success}
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
            ${success ? "bg-green-400" : isProcessing ? "bg-yellow-300" : "bg-purple-400"}
            hover:translate-x-[2px] 
            hover:translate-y-[2px]
            active:translate-x-[4px] 
            active:translate-y-[4px]
            disabled:opacity-50
            disabled:cursor-not-allowed
          `}
        >
          {success ? (
            <>
              <FiCheck />
              <span>Saved!</span>
            </>
          ) : isProcessing ? (
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
