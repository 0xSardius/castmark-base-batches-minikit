// components/cast/SampleCast.tsx
import { formatDistanceToNow } from "date-fns";
import BookmarkButton from "@/components/bookmark/BookmarkButton";
import Image from "next/image";

export default function SampleCast() {
  // Sample cast data for testing
  const castData = {
    hash: "samplehash123",
    authorFid: 123456,
    authorUsername: "alice",
    authorDisplayName: "Alice",
    authorPfp: "https://placehold.co/100x100?text=A",
    text: "This is a sample cast that we want to bookmark. Testing the Castmark app's functionality!",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    url: "https://warpcast.com/~/cast/samplehash123",
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
      <div className="flex">
        <Image
          src={castData.authorPfp}
          alt={castData.authorDisplayName}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full mr-3"
        />
        <div className="flex-1">
          <div className="flex items-baseline">
            <span className="font-bold">{castData.authorDisplayName}</span>
            <span className="text-gray-500 text-sm ml-2">
              @{castData.authorUsername}
            </span>
            <span className="text-gray-400 text-xs ml-2">
              {formatDistanceToNow(new Date(castData.timestamp), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="mt-2">{castData.text}</p>

          <div className="mt-3 flex justify-between">
            <div className="flex space-x-4">
              {/* Fake interaction buttons */}
              <button className="flex items-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="text-xs">Reply</span>
              </button>
              <button className="flex items-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
                <span className="text-xs">Recast</span>
              </button>
              <button className="flex items-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span className="text-xs">Like</span>
              </button>
            </div>
            <div className="flex space-x-2">
              <BookmarkButton
                castData={{
                  hash: castData.hash,
                  authorFid: castData.authorFid,
                  text: castData.text,
                  url: castData.url,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
