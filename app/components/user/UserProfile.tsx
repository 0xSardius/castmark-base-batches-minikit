// components/user/UserProfile.tsx
import { Identity, Avatar, Name } from "@coinbase/onchainkit/identity";
import { useUser } from "@/context/UserContext";

export default function UserProfile() {
  const { dbUser } = useUser();

  if (!dbUser) return null;

  // For Farcaster users, we'll use their FID to generate a proxy address for Identity component
  // This is just for display purposes - in a real implementation, we'd use their actual ETH address
  const proxyAddress =
    `0x${dbUser.fid.toString(16).padStart(40, "0")}` as `0x${string}`;

  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-4 bg-white">
      <div className="flex items-center mb-4">
        {/* OnchainKit Identity component */}
        <Identity address={proxyAddress}>
          <div className="flex items-center">
            <Avatar className="h-16 w-16 rounded-full mr-4" />
            <div>
              <Name className="text-xl font-bold" />
              <div className="text-sm text-gray-600">FID: {dbUser.fid}</div>
            </div>
          </div>
        </Identity>
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-500">Bookmarks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-500">Collections</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
        </div>
      </div>
    </div>
  );
}
