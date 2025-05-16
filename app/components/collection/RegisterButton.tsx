import { useState, useEffect } from "react";
import { FiCheck, FiDatabase } from "react-icons/fi";
import { Collection } from "@/lib/supabase";
import { useWalletClient } from "wagmi";

interface RegisterButtonProps {
  collection: Collection;
}

export default function RegisterButton({ collection }: RegisterButtonProps) {
  const [isRegistered, setIsRegistered] = useState(
    collection.is_registered || false,
  );
  const [isLoading, setIsLoading] = useState(false);
  const { data: walletClient } = useWalletClient();

  // Contract details - will update with actual contract address after deployment
  const CONTRACT_ADDRESS =
    (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
    "0x0000000000000000000000000000000000000000";

  // Debug logs
  useEffect(() => {
    console.log("Collection:", collection);
    console.log("Is already registered:", collection.is_registered);
    console.log("Contract Address:", CONTRACT_ADDRESS);
    console.log("Wallet Client available:", !!walletClient);
  }, [CONTRACT_ADDRESS, walletClient, collection]);

  const handleRegister = async () => {
    if (!walletClient) {
      alert("Please connect your wallet first");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting registration with address:", CONTRACT_ADDRESS);
      // The ABI for just the function we need
      const registerCollectionAbi = [
        {
          type: "function",
          name: "registerCollection",
          inputs: [
            { type: "string", name: "collectionId" },
            { type: "string", name: "name" },
            { type: "string", name: "url" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ] as const;

      // Prepare arguments
      const args = [
        collection.id,
        collection.name,
        `${process.env.NEXT_PUBLIC_URL || window.location.origin}/collections/${collection.id}`,
      ] as const;

      console.log("Registration arguments:", args);

      // Send transaction
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: registerCollectionAbi,
        functionName: "registerCollection",
        args,
      });

      console.log("Transaction hash:", hash);

      // Update UI state
      setIsRegistered(true);

      // Update database
      await fetch("/api/collections/update-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collectionId: collection.id,
          isRegistered: true,
          transactionHash: hash,
        }),
      });
    } catch (error) {
      console.error("Error registering collection:", error);
      alert("Failed to register collection. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex items-center gap-2 text-green-600 px-4 py-2 rounded-lg bg-green-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <FiCheck className="text-lg" />
        <span className="font-bold">Registered on Base</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleRegister}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 bg-purple-400 text-black font-bold rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all ${isLoading ? "opacity-70" : ""}`}
    >
      <FiDatabase />
      {isLoading ? "Registering..." : "Register on Base"}
    </button>
  );
}
