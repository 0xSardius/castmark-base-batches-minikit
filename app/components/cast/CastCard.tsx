// components/cast/CastCard.tsx
import { formatDistanceToNow } from "date-fns";
import {
  FiMessageSquare,
  FiHeart,
  FiRepeat,
  FiExternalLink,
} from "react-icons/fi";
import BookmarkButton from "../bookmark/BookmarkButton";

interface CastCardProps {
  cast: {
    hash: string;
    authorFid: number;
    authorUsername: string;
    authorDisplayName: string;
    authorPfp: string;
    text: string;
    timestamp: string;
    url: string;
  };
}

export default function CastCard({ cast }: CastCardProps) {
  const castData = {
    hash: cast.hash,
    authorFid: cast.authorFid,
    text: cast.text,
    url: cast.url,
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
      <div className="flex">
        <img
          src={cast.authorPfp}
          alt={cast.authorDisplayName}
          className="h-10 w-10 rounded-full mr-3"
        />
        <div className="flex-1">
          <div className="flex items-baseline">
            <span className="font-bold">{cast.authorDisplayName}</span>
            <span className="text-gray-500 text-sm ml-2">
              @{cast.authorUsername}
            </span>
            <span className="text-gray-400 text-xs ml-2">
              {formatDistanceToNow(new Date(cast.timestamp), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="mt-2">{cast.text}</p>

          <div className="mt-3 flex justify-between">
            <div className="flex space-x-4">
              <button className="flex items-center text-gray-500 hover:text-blue-500">
                <FiMessageSquare size={18} className="mr-1" />
                <span className="text-xs">Reply</span>
              </button>
              <button className="flex items-center text-gray-500 hover:text-green-500">
                <FiRepeat size={18} className="mr-1" />
                <span className="text-xs">Recast</span>
              </button>
              <button className="flex items-center text-gray-500 hover:text-red-500">
                <FiHeart size={18} className="mr-1" />
                <span className="text-xs">Like</span>
              </button>
            </div>
            <div className="flex space-x-2">
              <BookmarkButton castData={castData} />
              <a
                href={cast.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
                aria-label="Open in Warpcast"
              >
                <FiExternalLink size={18} className="text-gray-500" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
