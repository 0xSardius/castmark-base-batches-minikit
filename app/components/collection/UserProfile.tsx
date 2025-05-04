// components/user/UserProfile.tsx
import { Identity, Avatar, Name, Address } from "@coinbase/onchainkit/identity";
import { useUser } from "@/context/UserContext";

export default function UserProfile() {
  const { dbUser } = useUser();

  if (!dbUser) return null;

  // For this example, assuming we've added wallet_address to our User type
  const walletAddress =
    dbUser.wallet_address || "0x0000000000000000000000000000000000000000";

  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-4">
      <Identity address={walletAddress} hasCopyAddressOnClick>
        <div className="flex items-center mb-4">
          <Avatar className="h-16 w-16 rounded-full mr-4" />
          <div>
            <Name className="text-xl font-bold" />
            <Address className="text-sm text-gray-600" />
          </div>
        </div>
      </Identity>

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
