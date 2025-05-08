// components/onchain/CollectionAttestation.tsx
import { useState } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { Collection } from "@/lib/supabase";
import { FiAward } from "react-icons/fi";

// For demo purposes - in a real app, you'd use an actual contract
const DEMO_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";
const DEMO_ABI = [
  {
    inputs: [
      { name: "collectionId", type: "string" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "timestamp", type: "uint256" },
    ],
    name: "attestCollection",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable" as const,
    type: "function" as const,
  },
];

interface CollectionAttestationProps {
  collection: Collection;
}

export default function CollectionAttestation({
  collection,
}: CollectionAttestationProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4 border border-purple-200 rounded-lg p-4 bg-purple-50">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <FiAward className="text-purple-600 mr-2" size={20} />
          <h3 className="text-sm font-medium text-purple-800">
            Make this collection verifiable on-chain
          </h3>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-purple-600 transition-transform ${expanded ? "transform rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {expanded && (
        <div className="mt-3">
          <p className="text-xs text-purple-600 mb-3">
            Create an on-chain record of this collection to verify your curation
            work and make it discoverable to others.
          </p>

          <Transaction
            contracts={[
              {
                address: DEMO_CONTRACT_ADDRESS,
                abi: DEMO_ABI,
                functionName: "attestCollection",
                args: [
                  collection.id,
                  collection.name,
                  collection.description || "",
                  Math.floor(new Date(collection.created_at).getTime() / 1000),
                ],
              },
            ]}
          >
            <TransactionButton
              text="Create On-chain Record"
              className="bg-purple-600 text-white text-sm rounded-md px-3 py-1 hover:bg-purple-700 w-full"
            />
            <TransactionStatus />
          </Transaction>
        </div>
      )}
    </div>
  );
}
