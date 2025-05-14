import { useUser } from "@/context/UserContext";
import { Identity, Avatar, Name } from "@coinbase/onchainkit/identity";

export default function AuthHeader() {
  const { isAuthenticated, signIn, signOut, dbUser } = useUser();

  if (!isAuthenticated || !dbUser) {
    return (
      <button
        onClick={signIn}
        className="px-4 py-2 text-sm border-4 border-black bg-purple-400 text-black rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:shadow-none transition-all"
      >
        Sign In
      </button>
    );
  }

  // For Farcaster users, we'll use their FID to generate a proxy address for Identity component
  const proxyAddress =
    `0x${dbUser.fid.toString(16).padStart(40, "0")}` as `0x${string}`;

  return (
    <div className="flex items-center gap-4">
      <Identity address={proxyAddress}>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-full border-2 border-black" />
          <Name className="text-sm font-bold" />
        </div>
      </Identity>
      <button
        onClick={signOut}
        className="px-3 py-1 text-xs border-2 border-black bg-red-400 text-black rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:shadow-none transition-all"
      >
        Sign Out
      </button>
    </div>
  );
}
