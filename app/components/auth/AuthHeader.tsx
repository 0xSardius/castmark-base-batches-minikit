import { useUser } from "@/context/UserContext";
// If you have a type for context from MiniKit, import it here. Otherwise, use unknown.
// import { MiniKitContextType } from "@coinbase/onchainkit/minikit";
// import type { FrameContext } from "@coinbase/onchainkit/minikit";

// interface MiniKitContext {
//   client?: { added?: boolean };
// }

interface AuthHeaderProps {
  context: { client?: { added?: boolean } } | null;
  handleAddFrame: () => void;
}

export default function AuthHeader({
  context,
  handleAddFrame,
}: AuthHeaderProps) {
  const { isAuthenticated, signIn, signOut } = useUser();

  return (
    <div className="flex flex-col items-center gap-4 mt-2">
      <span className="text-2xl font-extrabold px-6 py-2 bg-purple-600 text-white border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] tracking-wide uppercase mb-2">
        Castmark
      </span>
      {context?.client?.added ? (
        <span className="text-sm bg-green-200 border-4 border-black rounded-lg px-4 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          ✓ App saved
        </span>
      ) : (
        <button
          onClick={handleAddFrame}
          className="px-4 py-2 text-sm border-4 border-black bg-yellow-300 rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:shadow-none transition-all"
        >
          Save App
        </button>
      )}
      {isAuthenticated ? (
        <button
          onClick={signOut}
          className="px-4 py-2 text-sm border-4 border-black bg-red-400 text-black rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:shadow-none transition-all"
        >
          Sign Out
        </button>
      ) : (
        <button
          onClick={signIn}
          className="px-4 py-2 text-sm border-4 border-black bg-purple-400 text-black rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:shadow-none transition-all"
        >
          Sign In
        </button>
      )}
    </div>
  );
}
